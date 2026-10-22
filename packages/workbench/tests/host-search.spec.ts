/**
 * The tally behind the filter row, tested against the built Host service.
 *
 * `search` answers two different questions about the same rows: which page to
 * draw, and how many items sit in each of the four tiers the filter row prints.
 * The second number is deliberately NOT a property of the first — it describes
 * the workspace, so a search that matches nothing still shows the totals it is
 * searching within, and a chip keeps saying "未完成 4" while the list under it
 * holds one row. That independence is invisible in the response shape and easy
 * to lose in a later edit ("just count the hits"), and a wrong count here looks
 * like a plausible number rather than like a bug, so it is asserted.
 *
 * Runs against `lib/` for the same reason the other two suites do: that is the
 * artifact DSH loads.
 */
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import type { WorkItemRecord } from '../src/types.ts'
import WorkbenchService from '../lib/index.js'

/** A record with the fields the tally reads, and plausible values for the rest. */
function record(
  id: string,
  workspaceId: string,
  status: WorkItemRecord['status'],
  archived = false,
): WorkItemRecord {
  return {
    id,
    workspaceId,
    workspacePath: `/${workspaceId}`,
    title: id,
    desc: '',
    tag: '',
    status,
    archived,
    updateAt: '2026-01-01T00:00:00.000Z',
    createdAt: '2026-01-01T00:00:00.000Z',
  }
}

/**
 * Four tiers across two workspaces, with one item per name so a query can
 * narrow the page without being able to change the tally by accident.
 */
const ITEMS: readonly WorkItemRecord[] = [
  record('alpha', 'w', 'open'),
  record('beta', 'w', 'in_progress'),
  record('gamma', 'w', 'done'),
  record('delta', 'w', 'done', true),
  record('epsilon', 'other', 'open'),
]

/** What every `w` search must report, whatever it was asked for. */
const TIERS_OF_W = { all: 3, active: 2, done: 1, archived: 1 }

/**
 * Construct the service over a stand-in domain.
 *
 * The same stub the Remote contract test uses, plus `entries()`: the tally walks
 * the whole table, so a stub that could only report `size` would throw instead of
 * counting. `workspaceRegistry` is still absent — `search` never reads it.
 * @param records - rows the stand-in table holds.
 * @returns a service whose `search` runs against those rows.
 */
function serviceOver(records: readonly WorkItemRecord[]): WorkbenchService {
  const ctx = {
    reflect: { provide: () => {} },
    // A real Context reaches optional Services through `inject`. This double carries
    // no Tool registry, so it hands the callback the smallest one that satisfies
    // registration: the write-back tool then registers here exactly as in a host.
    inject: (deps: readonly string[], callback: (scoped: unknown) => void) => {
      if (deps.includes('tools')) callback({ tools: { register: () => {} } })
    },
    effect: () => {},
    storageDomain: {
      open: () => Promise.resolve({
        name: 'workbench',
        table: () => ({ size: records.length, entries: () => records.map(item => [item.id, item]) }),
      }),
    },
  }
  return new WorkbenchService(ctx as unknown as ConstructorParameters<typeof WorkbenchService>[0])
}

describe('workbench search tally', () => {
  it('counts each tier of the requested workspace', async () => {
    const value = await serviceOver(ITEMS).search({ workspaceId: 'w', archived: 'exclude' })
    assert.equal(value.total, 3)
    assert.deepEqual(value.counts, TIERS_OF_W)
  })

  it('counts archived items separately instead of dropping them', async () => {
    const value = await serviceOver(ITEMS).search({ workspaceId: 'w', archived: 'only' })
    assert.equal(value.total, 1)
    assert.deepEqual(
      value.counts,
      TIERS_OF_W,
      'the archived chip counts archived items, so the tally cannot follow the filter',
    )
  })

  it('keeps counting the workspace when the query matches nothing', async () => {
    const value = await serviceOver(ITEMS).search({ workspaceId: 'w', query: 'no such item' })
    assert.equal(value.total, 0)
    assert.deepEqual(value.counts, TIERS_OF_W)
  })

  it('keeps counting the workspace when the status filter narrows it', async () => {
    const value = await serviceOver(ITEMS).search({
      workspaceId: 'w',
      status: ['done'],
      archived: 'exclude',
    })
    assert.equal(value.total, 1)
    assert.deepEqual(value.counts, TIERS_OF_W)
  })

  it('never counts another workspace’s items', async () => {
    const value = await serviceOver(ITEMS).search({ workspaceId: 'other' })
    assert.deepEqual(value.counts, { all: 1, active: 1, done: 0, archived: 0 })
  })
})
