/**
 * The write path at the service boundary: DESIGN.md §4.5's three edges, plus the
 * compare-and-swap that decides who wins a race.
 *
 * `tests/state.spec.ts` pins the rule itself; this pins the wiring around it —
 * that only the writing edge touches the record, that a retry neither advances
 * `updateAt` nor conflicts, that `done` is refused, and that a lost race is
 * reported instead of silently overwriting. Those are the P3 acceptance criteria,
 * and none of them is visible from the plan function alone: the interesting part
 * is which reads happen before which write, and that is what a harness can stage.
 *
 * Runs against `lib/index.js` with a hand-written table. The real storage domain
 * wants a DSH home and a per-record file layout, and none of that is what is under
 * test; the stub implements the four methods the write path actually calls, and the
 * casts mirror the ones `tests/remote-contract.spec.ts` already uses to get past
 * the domain generics.
 */
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import WorkbenchService from '../lib/index.js'
import type { WorkItemId, WorkItemRecord } from '../lib/types/types.js'

/** The workspace every request in this file targets. */
const WORKSPACE = 'ws-1'

/** An id that is deliberately not a UUID: nothing here parses it. */
const ITEM = 'item-1' as WorkItemId

/** A version old enough that any real write has to be distinguishable from it. */
const OLD = '2020-01-01T00:00:00.000Z'

/** A record as it would have been stored, with the fields under test overloaded. */
function record(overrides: Partial<WorkItemRecord> = {}): WorkItemRecord {
  return {
    id: ITEM,
    workspaceId: WORKSPACE,
    workspacePath: 'D:/ws',
    title: '一条工作项',
    desc: '',
    tag: '',
    status: 'open',
    archived: false,
    updateAt: OLD,
    createdAt: OLD,
    ...overrides,
  }
}

/** What a test needs from the harness. */
interface Harness {
  readonly service: WorkbenchService
  /** Put a row in the table without going through the service. */
  seed(overrides?: Partial<WorkItemRecord>): WorkItemRecord
  /**
   * Stage a second writer landing between the service's read and its queue slot.
   * Applied once, at the next queued write, and persisted — which is what makes an
   * aborted write observable: the row keeps this version, not the service's.
   */
  park(next: (current: WorkItemRecord) => WorkItemRecord): void
  row(): WorkItemRecord
}

/** One service over a table that only exists in memory. */
function harness(): Harness {
  const rows = new Map<string, WorkItemRecord>()
  let parked: ((current: WorkItemRecord) => WorkItemRecord) | undefined

  const table = {
    get: (key: string): WorkItemRecord | undefined => rows.get(key),
    put: (key: string, value: WorkItemRecord): Promise<void> => {
      rows.set(key, value)
      return Promise.resolve()
    },
    update: (key: string, transform: (current: WorkItemRecord) => WorkItemRecord): Promise<WorkItemRecord> => {
      const current = rows.get(key)
      if (current === undefined) return Promise.reject(new Error(`no row for ${key}`))
      // The parked writer goes first, and its version is what the transform sees
      // *and* what survives if the transform throws.
      if (parked !== undefined) {
        rows.set(key, parked(current))
        parked = undefined
      }
      const atSlot = rows.get(key) as WorkItemRecord
      const next = transform(atSlot)
      rows.set(key, next)
      return Promise.resolve(next)
    },
  }

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
      open: () => Promise.resolve({ name: 'workbench', table: () => table }),
    },
    workspaceRegistry: {
      get: (id: string) => (id === WORKSPACE ? { path: 'D:/ws' } : undefined),
    },
  }

  return {
    service: new WorkbenchService(
      ctx as unknown as ConstructorParameters<typeof WorkbenchService>[0],
    ),
    seed(overrides = {}) {
      const value = record(overrides)
      rows.set(value.id, value)
      return value
    },
    park(next) {
      parked = next
    },
    row() {
      return rows.get(ITEM) as WorkItemRecord
    },
  }
}

describe('requestComplete: the one writing edge', () => {
  it('advances an open item and stamps a new version', async () => {
    const h = harness()
    h.seed()
    const result = await h.service.requestComplete({
      workspaceId: WORKSPACE, id: ITEM, expectedUpdateAt: OLD,
    })
    assert.equal(result.code, 'ok', 'an open item accepts a write-back request')
    if (result.code !== 'ok') return
    assert.equal(result.item.status, 'in_progress')
    assert.ok(result.item.updateAt > OLD, 'the write has to be visible in the version')
    assert.deepEqual(h.row(), result.item, 'the returned record is the stored one')
  })

  it('reports a stale version instead of overwriting it', async () => {
    const h = harness()
    h.seed({ status: 'open', updateAt: '2024-05-05T05:05:05.005Z' })
    const result = await h.service.requestComplete({
      workspaceId: WORKSPACE, id: ITEM, expectedUpdateAt: OLD,
    })
    assert.equal(result.code, 'conflict', 'a caller holding an old copy loses the race')
    if (result.code !== 'conflict') return
    assert.equal(result.current.updateAt, '2024-05-05T05:05:05.005Z', 'the caller is told what it lost to')
    assert.equal(h.row().status, 'open', 'the losing request must not have written')
  })
})

describe('requestComplete: the retry edge', () => {
  it('writes nothing at all, so pressing twice cannot move the clock', async () => {
    const h = harness()
    const stored = h.seed({ status: 'in_progress', updateAt: '2024-05-05T05:05:05.005Z' })
    const result = await h.service.requestComplete({
      workspaceId: WORKSPACE, id: ITEM, expectedUpdateAt: OLD,
    })
    assert.equal(result.code, 'ok', 'a retry is accepted, never a conflict')
    if (result.code !== 'ok') return
    assert.deepEqual(result.item, stored, 'the record comes back exactly as it was')
    assert.deepEqual(h.row(), stored, 'and the table still holds it — the retry did not write')
  })

  it('reports a conflict, not a silent retry, when the writer held a version', async () => {
    const h = harness()
    h.seed({ status: 'open', updateAt: OLD })
    h.park(current => ({ ...current, status: 'in_progress', updateAt: '2024-06-06T06:06:06.006Z' }))
    // A caller that cached a version is on the *writing* edge as far as this
    // request is concerned, so a version that no longer matches is a conflict —
    // the compare-and-swap is checked before the plan is re-decided, and that
    // order is deliberate: "someone else got there first" is the more useful
    // answer than "your press was a retry".
    const result = await h.service.requestComplete({
      workspaceId: WORKSPACE, id: ITEM, expectedUpdateAt: OLD,
    })
    assert.equal(result.code, 'conflict')
    if (result.code !== 'conflict') return
    assert.equal(result.current.updateAt, '2024-06-06T06:06:06.006Z')
    assert.equal(h.row().updateAt, '2024-06-06T06:06:06.006Z', 'the loser stamped nothing over it')
  })

  it('keeps the other writer\'s version when a tokenless request lost its slot', async () => {
    const h = harness()
    h.seed({ status: 'open', updateAt: OLD })
    // Written without a version, which is how a model tool calls this (P4) and how
    // any caller that never cached one does. That is the case the queue-slot check
    // exists for: there is no version to conflict on, and the record moved from
    // `open` to `in_progress` after this request read it, so the plan re-decided at
    // the slot is `retry` — and a retry must not write.
    h.park(current => ({ ...current, status: 'in_progress', updateAt: '2024-06-06T06:06:06.006Z' }))
    const result = await h.service.requestComplete({ workspaceId: WORKSPACE, id: ITEM })
    assert.equal(result.code, 'ok')
    if (result.code !== 'ok') return
    assert.equal(result.item.updateAt, '2024-06-06T06:06:06.006Z', 'the winner\'s version survives')
    assert.equal(h.row().updateAt, '2024-06-06T06:06:06.006Z', 'nothing was stamped over it')
  })
})

describe('requestComplete: the edge that does not exist', () => {
  it('refuses a finished item and leaves it finished', async () => {
    const h = harness()
    const stored = h.seed({ status: 'done', updateAt: '2024-05-05T05:05:05.005Z' })
    const result = await h.service.requestComplete({ workspaceId: WORKSPACE, id: ITEM })
    assert.equal(result.code, 'invalid', 'completion is irreversible (§4.5)')
    if (result.code !== 'invalid') return
    assert.ok(result.message !== '', 'a refusal says why')
    assert.deepEqual(h.row(), stored, 'a refused request must not touch the record')
  })

  it('still refuses when the item finished before the slot', async () => {
    const h = harness()
    h.seed({ status: 'open', updateAt: OLD })
    // The model completes the item in the window between the read and the slot.
    // Writing the `open → in_progress` edge here would resurrect a finished item,
    // which is the one thing §4.5 says no edge may do. Tokenless, like the case
    // above: with a version, the compare-and-swap would answer first.
    h.park(current => ({ ...current, status: 'done', updateAt: '2024-07-07T07:07:07.007Z' }))
    const result = await h.service.requestComplete({ workspaceId: WORKSPACE, id: ITEM })
    assert.equal(result.code, 'invalid')
    assert.equal(h.row().status, 'done', 'a completed item stays completed')
  })
})

describe('requestComplete: ownership and workspace guards', () => {
  it('reports an item of another workspace as absent', async () => {
    const h = harness()
    h.seed({ workspaceId: 'ws-2' })
    const result = await h.service.requestComplete({ workspaceId: WORKSPACE, id: ITEM })
    assert.equal(result.code, 'not_found', 'ownership is part of identity, as in `mutate`')
  })

  it('rejects a workspace the registry does not know', async () => {
    const h = harness()
    h.seed()
    const result = await h.service.requestComplete({ workspaceId: 'ws-ghost', id: ITEM })
    assert.equal(result.code, 'invalid')
    if (result.code !== 'invalid') return
    assert.ok(result.message.includes('ws-ghost'), 'the message names the workspace that failed')
  })
})
