/**
 * Archiving as a user gesture (DESIGN.md §4.7, §9.31).
 *
 * Until §9.31 `archived` was set by exactly one thing — a workspace being deleted
 * left its items behind — so nothing here existed to test. The pane now offers the
 * verb itself, which makes three properties worth pinning at the two faces:
 *
 *  - the Host stores the flag and its date together, and a no-op request writes
 *    nothing, so a double press cannot move `updateAt` and reorder the list;
 *  - the flag is what moves an item between tiers, so the Client's snapshot has to
 *    drop it from the tier on screen instead of merging it in place;
 *  - `archive` is a write like any other: ownership and the version check apply.
 *
 * Runs against the built artifact, on Node's runner (`pnpm test`).
 */
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import WorkbenchService from '../lib/index.js'
import { WorkbenchStore } from '../lib/types/client/store.js'
import type { WorkItemId, WorkItemRecord } from '../lib/types/types.js'

/** The workspace every request in this file targets. */
const WORKSPACE = 'ws-1'

/** An id that is deliberately not a UUID: nothing here parses it. */
const ITEM = 'item-1' as WorkItemId

/** The second item, for the snapshot tests. */
const OTHER = 'item-2' as WorkItemId

/** A version old enough that any real write has to be distinguishable from it. */
const OLD = '2020-01-01T00:00:00.000Z'

/** A version that has to survive a request that writes nothing. */
const LATER = '2024-05-05T05:05:05.005Z'

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

/** One service over a table that only exists in memory. */
function harness(): {
  readonly service: WorkbenchService
  seed(overrides?: Partial<WorkItemRecord>): WorkItemRecord
  row(): WorkItemRecord
} {
  const rows = new Map<string, WorkItemRecord>()

  const table = {
    get: (key: string): WorkItemRecord | undefined => rows.get(key),
    entries: (): IterableIterator<[string, WorkItemRecord]> => rows.entries(),
    put: (key: string, value: WorkItemRecord): Promise<void> => {
      rows.set(key, value)
      return Promise.resolve()
    },
    update: (key: string, transform: (current: WorkItemRecord) => WorkItemRecord): Promise<WorkItemRecord> => {
      const current = rows.get(key)
      if (current === undefined) return Promise.reject(new Error(`no row for ${key}`))
      const next = transform(current)
      rows.set(key, next)
      return Promise.resolve(next)
    },
  }

  const ctx = {
    reflect: { provide: () => {} },
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
    row() {
      return rows.get(ITEM) as WorkItemRecord
    },
  }
}

describe('archive: the record', () => {
  it('stamps the flag and the moment together', async () => {
    const h = harness()
    h.seed()
    const result = await h.service.archive({ workspaceId: WORKSPACE, id: ITEM, archived: true })
    assert.equal(result.code, 'ok')
    if (result.code !== 'ok') return
    assert.equal(result.item.archived, true)
    assert.ok(result.item.archivedAt !== undefined, 'an archived item records when it happened')
    assert.ok(result.item.updateAt > OLD, 'the change is visible in the version')
    assert.deepEqual(h.row(), result.item, 'the returned record is the stored one')
  })

  it('drops the date again when the item comes back', async () => {
    const h = harness()
    h.seed({ archived: true, archivedAt: '2024-01-01T00:00:00.000Z' })
    const result = await h.service.archive({ workspaceId: WORKSPACE, id: ITEM, archived: false })
    assert.equal(result.code, 'ok')
    if (result.code !== 'ok') return
    assert.equal(result.item.archived, false)
    // Absent, not `undefined`: the record is serialised as-is, and a key holding
    // `undefined` would outlive the state it describes.
    assert.equal('archivedAt' in result.item, false, 'the date does not outlive the archive')
    assert.equal('archivedAt' in h.row(), false)
  })

  it('writes nothing when the item is already where it was asked to go', async () => {
    const h = harness()
    const stored = h.seed({ archived: true, archivedAt: '2024-01-01T00:00:00.000Z', updateAt: LATER })
    const result = await h.service.archive({ workspaceId: WORKSPACE, id: ITEM, archived: true })
    assert.equal(result.code, 'ok', 'asking twice is not an error')
    if (result.code !== 'ok') return
    assert.deepEqual(result.item, stored, 'the record comes back exactly as it was')
    assert.deepEqual(h.row(), stored, 'pressing twice cannot move the clock')
  })
})

describe('archive: it moves the item between tiers', () => {
  it('leaves the daily tiers and joins the history one', async () => {
    const h = harness()
    h.seed()
    await h.service.archive({ workspaceId: WORKSPACE, id: ITEM, archived: true })

    const daily = await h.service.search({ workspaceId: WORKSPACE, archived: 'exclude' })
    assert.equal(daily.items.length, 0, 'the three daily tiers may not show an archived item')
    assert.deepEqual(daily.counts, { all: 0, active: 0, done: 0, archived: 1 })

    const history = await h.service.search({ workspaceId: WORKSPACE, archived: 'only' })
    assert.deepEqual(history.items.map(item => item.id), [ITEM])
  })

  it('comes back to the tier its status names', async () => {
    const h = harness()
    h.seed({ status: 'done', archived: true, archivedAt: '2024-01-01T00:00:00.000Z' })
    await h.service.archive({ workspaceId: WORKSPACE, id: ITEM, archived: false })
    const done = await h.service.search({ workspaceId: WORKSPACE, status: ['done'], archived: 'exclude' })
    assert.deepEqual(done.items.map(item => item.id), [ITEM], 'status is untouched by archiving')
  })
})

describe('archive: the same guards as every other write', () => {
  it('reports a stale version instead of overwriting it', async () => {
    const h = harness()
    const stored = h.seed({ updateAt: LATER })
    const result = await h.service.archive({
      workspaceId: WORKSPACE, id: ITEM, archived: true, expectedUpdateAt: OLD,
    })
    assert.equal(result.code, 'conflict')
    if (result.code !== 'conflict') return
    assert.equal(result.current.updateAt, LATER)
    assert.deepEqual(h.row(), stored, 'the losing request must not have written')
  })

  it('reports an item of another workspace as absent', async () => {
    const h = harness()
    h.seed({ workspaceId: 'ws-2' })
    const result = await h.service.archive({ workspaceId: WORKSPACE, id: ITEM, archived: true })
    assert.equal(result.code, 'not_found', 'ownership is part of identity, as in `mutate`')
  })

  it('rejects a workspace the registry does not know', async () => {
    const h = harness()
    h.seed()
    const result = await h.service.archive({ workspaceId: 'ws-ghost', id: ITEM, archived: true })
    assert.equal(result.code, 'invalid')
    if (result.code !== 'invalid') return
    assert.ok(result.message.includes('ws-ghost'))
  })
})

/** The two records the snapshot tests start from: one live, one filed away. */
const OPEN = record()
const FILED = record({ id: OTHER, archived: true, archivedAt: '2024-01-01T00:00:00.000Z', updateAt: LATER })

/**
 * A gateway over a fixed workspace, with `archive` flipping the row it is given.
 *
 * The search always answers with the rows as they stand, so the tier a record
 * belongs to is decided by the same fields the Host would read.
 */
function gatewayOf(rows: WorkItemRecord[]): {
  readonly gateway: ConstructorParameters<typeof WorkbenchStore>[0]
  requests(): readonly { readonly archived?: boolean }[]
} {
  const archiveRequests: { readonly archived?: boolean }[] = []
  const live = [...rows]
  const tally = {
    all: live.filter(item => !item.archived).length,
    active: live.filter(item => !item.archived && item.status !== 'done').length,
    done: live.filter(item => !item.archived && item.status === 'done').length,
    archived: live.filter(item => item.archived).length,
  }
  const gateway = {
    // Filtered like the Host filters, because the point of these tests is which
    // tier an item lands in once its flag changes.
    search: async (request: { archived?: 'exclude' | 'only' | 'include'; status?: readonly string[] }) => {
      const wanted = live.filter((item) => {
        if (request.archived === 'exclude' && item.archived) return false
        if (request.archived === 'only' && !item.archived) return false
        return request.status === undefined || request.status.includes(item.status)
      })
      return { items: wanted.slice(), total: wanted.length, counts: tally }
    },
    create: async () => { throw new Error('spec: unused') },
    setDesc: async () => { throw new Error('spec: unused') },
    update: async () => { throw new Error('spec: unused') },
    archive: async (request: { id: string; archived: boolean }) => {
      archiveRequests.push(request)
      const at = live.findIndex(item => item.id === request.id)
      const next = { ...live[at], archived: request.archived } as WorkItemRecord
      live[at] = next
      return { code: 'ok' as const, item: next }
    },
    requestComplete: async () => { throw new Error('spec: unused') },
    delete: async () => { throw new Error('spec: unused') },
  }
  return { gateway: gateway as unknown as ConstructorParameters<typeof WorkbenchStore>[0], requests: () => archiveRequests }
}

describe('archive: the client snapshot', () => {
  it('drops the item from the tier on screen instead of merging it in place', async () => {
    const { gateway, requests } = gatewayOf([OPEN, FILED])
    const store = new WorkbenchStore(gateway)
    store.setWorkspace(WORKSPACE)
    await store.refresh()
    assert.deepEqual(store.getSnapshot().items.map(item => item.id), [ITEM], '全部 shows the live one only')

    const result = await store.setArchived(OPEN, true)
    assert.equal(result.code, 'ok')
    assert.deepEqual(requests(), [{ workspaceId: WORKSPACE, id: ITEM, archived: true, expectedUpdateAt: OLD }])
    const after = store.getSnapshot()
    assert.deepEqual(after.items, [], 'an archived item is not part of 全部 any more')
    assert.equal(after.total, 0)
    // The filter row counts are read from the snapshot, so they have to move with
    // the record — otherwise 已归档 goes on claiming its old size.
    assert.deepEqual(after.counts, { all: 0, active: 0, done: 0, archived: 2 })
  })

  it('brings a restored item back into the tier that now holds it', async () => {
    const { gateway } = gatewayOf([OPEN, FILED])
    const store = new WorkbenchStore(gateway)
    store.setWorkspace(WORKSPACE)
    await store.refresh()

    const result = await store.setArchived(FILED, false)
    assert.equal(result.code, 'ok')
    const after = store.getSnapshot()
    assert.deepEqual(after.items.map(item => item.id), [OTHER, ITEM], 'a restored item rejoins the list')
    assert.equal(after.total, 2)
    assert.deepEqual(after.counts, { all: 2, active: 2, done: 0, archived: 0 })
  })

  it('does nothing at all when it is asked for the state the item is in', async () => {
    const { gateway, requests } = gatewayOf([OPEN, FILED])
    const store = new WorkbenchStore(gateway)
    store.setWorkspace(WORKSPACE)
    await store.refresh()
    const before = store.getSnapshot()

    const result = await store.setArchived(OPEN, false)
    assert.equal(result.code, 'ok')
    assert.deepEqual(requests(), [], 'no round trip for a press that would change nothing')
    assert.equal(store.getSnapshot(), before, 'and no new snapshot either')
  })
})
