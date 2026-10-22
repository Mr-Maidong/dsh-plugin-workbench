/**
 * Client state for one workbench pane.
 *
 * Deliberately a hand-rolled snapshot store rather than a state library: DSH's
 * own Client state (`WorkspaceSource`, the Workspace model) is a
 * `getSnapshot()` / `subscribe()` pair consumed through `useSyncExternalStore`,
 * and matching that keeps this pane's data layer the same shape as everything
 * around it. The package ships no runtime dependency, so pulling in a store
 * would be the only one.
 *
 * REFRESH MODEL (DESIGN.md §6.2). The Client has no push channel for a
 * third-party Remote namespace — `API_REMOTE_FORWARDED_EVENTS` is a closed
 * whitelist — so a change made by another session cannot be pushed here. Three
 * tiers stand in for that:
 *
 *  - tier 1, write-then-merge: a successful write returns the changed record, so
 *    the snapshot is patched in place instead of re-queried;
 *  - tier 2, refresh on becoming visible: the body calls `refresh()` when the
 *    tab turns visible or the window regains focus;
 *  - tier 3, no polling. §6.2 allows a low-frequency poll as a diagnostic only,
 *    and it is off by default; nothing in this store schedules one.
 *
 * When a query is in force, tier 1 alone can leave the list wrong: an edit may
 * push an item out of the query's match set, or pull it in. Those writes take the
 * extra refresh instead of merging, which is cheap because a query is rare.
 */
import type {
  WorkItemId,
  WorkItemRecord,
  WorkbenchCreateRequest,
  WorkbenchDeleteRequest,
  WorkbenchDeleteValue,
  WorkbenchRequestCompleteRequest,
  WorkbenchSearchCounts,
  WorkbenchSearchRequest,
  WorkbenchSearchValue,
  WorkbenchSetDescRequest,
  WorkbenchUpdateRequest,
  WorkbenchWriteValue,
} from 'dsh-plugin-workbench/types'

/** The four filter tiers of DESIGN.md §5.4. Orthogonal to `status`, not a status. */
export type WorkbenchFilterTier = 'all' | 'active' | 'done' | 'archived'

/** Immutable view of one workspace's work items. */
export interface WorkbenchSnapshot {
  /** The workspace this snapshot describes; `''` before one is chosen. */
  readonly workspaceId: string
  readonly query: string
  readonly filter: WorkbenchFilterTier
  readonly phase: 'idle' | 'loading' | 'ready' | 'error'
  readonly items: readonly WorkItemRecord[]
  /** Hits before paging, which may exceed `items.length`. */
  readonly total: number
  /**
   * Sizes of the four filter tiers, which the filter row prints beside each
   * label. Independent of `query` and `filter`, so a tier keeps reporting the
   * workspace's real total while a search narrows the list.
   */
  readonly counts: WorkbenchSearchCounts
  /**
   * Transport or Host failure of the last load, or `null`.
   *
   * `null` rather than an optional field, matching DSH's own `WorkspaceSnapshot`.
   * Business outcomes are NOT errors and never land here: a `conflict` is a
   * successful call whose value says so, and it is returned to the caller that
   * provoked it.
   */
  readonly error: { readonly code: string; readonly message: string } | null
}

/**
 * The Remote calls this store makes, as plain async functions.
 *
 * Injected rather than imported so the store has no opinion about how the
 * Remote is reached, and so a test can drive it without a Client runtime. Every
 * method REJECTS on transport failure and RESOLVES with the Host's result union
 * otherwise, including that union's business-failure arms — `mount.ts` builds it
 * that way, and the distinction is what lets a conflict be shown to the user
 * rather than thrown past them.
 */
export interface WorkbenchGateway {
  search(request: WorkbenchSearchRequest): Promise<WorkbenchSearchValue>
  create(request: WorkbenchCreateRequest): Promise<WorkbenchWriteValue>
  setDesc(request: WorkbenchSetDescRequest): Promise<WorkbenchWriteValue>
  update(request: WorkbenchUpdateRequest): Promise<WorkbenchWriteValue>
  requestComplete(request: WorkbenchRequestCompleteRequest): Promise<WorkbenchWriteValue>
  delete(request: WorkbenchDeleteRequest): Promise<WorkbenchDeleteValue>
}

/** How long a keystroke waits before it becomes a query. */
const QUERY_DEBOUNCE_MS = 250

/** An empty snapshot for a workspace nothing has loaded yet. */
function blank(workspaceId: string): WorkbenchSnapshot {
  return {
    workspaceId,
    query: '',
    filter: 'all',
    phase: 'idle',
    items: [],
    total: 0,
    counts: { all: 0, active: 0, done: 0, archived: 0 },
    error: null,
  }
}

/** Which tier total a record contributes to; mirrors the Host's `search` tally. */
function tierOf(item: WorkItemRecord): keyof WorkbenchSearchCounts {
  if (item.archived) return 'archived'
  return item.status === 'done' ? 'done' : 'active'
}

/**
 * Move one record's contribution into or out of the tier totals.
 *
 * Local writes are merged into the snapshot rather than re-queried (refresh
 * tier 1), so the counts have to move with them or the filter row would keep
 * advertising the totals it had before the write.
 * @param counts - totals before the change.
 * @param item - the record being added or removed.
 * @param delta - `1` when the record appears, `-1` when it goes away.
 * @returns the adjusted totals.
 */
function tally(counts: WorkbenchSearchCounts, item: WorkItemRecord, delta: 1 | -1): WorkbenchSearchCounts {
  const tier = tierOf(item)
  const moved = (value: number): number => Math.max(0, value + delta)
  return {
    // `all` is the non-archived total, so archiving leaves it alone.
    all: tier === 'archived' ? counts.all : moved(counts.all),
    active: tier === 'active' ? moved(counts.active) : counts.active,
    done: tier === 'done' ? moved(counts.done) : counts.done,
    archived: tier === 'archived' ? moved(counts.archived) : counts.archived,
  }
}

/** Translate a filter tier into the Host's filter fields. */
export function filterToRequest(filter: WorkbenchFilterTier): Pick<WorkbenchSearchRequest, 'status' | 'archived'> {
  switch (filter) {
    // The three daily tiers. `active` covers both unfinished statuses; `done` is
    // the third; none of them may show an archived item.
    case 'active':
      return { status: ['open', 'in_progress'], archived: 'exclude' }
    case 'done':
      return { status: ['done'], archived: 'exclude' }
    // The history tier: an archived item is shown whatever its status, because
    // archiving records where an item came from, not how far it got.
    case 'archived':
      return { archived: 'only' }
    case 'all':
      return { archived: 'exclude' }
  }
}

/** Replace one record in a list, leaving the list untouched when it holds none. */
function replace(items: readonly WorkItemRecord[], next: WorkItemRecord): readonly WorkItemRecord[] {
  const at = items.findIndex(item => item.id === next.id)
  if (at < 0) return items
  const copy = items.slice()
  copy[at] = next
  return copy
}

/**
 * Snapshot store for the workbench pane.
 *
 * One snapshot per workspace, kept in a map, so returning to a workspace shows
 * the list it had rather than an empty one while the query is in flight
 * (DESIGN.md §5.5).
 */
export class WorkbenchStore {
  private readonly gateway: WorkbenchGateway
  private readonly cache = new Map<string, WorkbenchSnapshot>()
  private readonly listeners = new Set<() => void>()
  private activeId = ''
  private queryTimer: ReturnType<typeof setTimeout> | undefined
  /**
   * Bumped on every load; a response whose generation is stale is dropped.
   *
   * Without this, switching workspace quickly can let a slow answer for the
   * previous workspace overwrite the new one — the classic out-of-order load.
   */
  private generation = 0

  /** @param gateway - the Remote calls this store drives. */
  constructor(gateway: WorkbenchGateway) {
    this.gateway = gateway
  }

  /**
   * @returns the active workspace's snapshot; never undefined.
   *
   * The fallback must NOT build an uncached `blank(...)` per call: React's
   * `useSyncExternalStore` compares the value it saw at the last render with the
   * value it reads at the next commit, and a fresh object every read is a
   * "store changed" in its eyes even when nothing published — the pane then
   * re-renders itself forever and dies as React #185 (§9.24). Seeding the empty
   * snapshot into the cache gives every `activeId` one stable identity, and the
   * later `setWorkspace`'s merge (`patch`) reads and rewrites that same entry.
   */
  getSnapshot = (): WorkbenchSnapshot => {
    const cached = this.cache.get(this.activeId)
    if (cached !== undefined) return cached
    const seeded = blank(this.activeId)
    this.cache.set(this.activeId, seeded)
    return seeded
  }

  /** @param listener - called on any change to the active snapshot. @returns unsubscribe. */
  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener)
    return () => { this.listeners.delete(listener) }
  }

  /** The workspace every call is currently scoped to. */
  get workspaceId(): string {
    return this.activeId
  }

  /** Stop the pending query timer. */
  dispose(): void {
    if (this.queryTimer !== undefined) clearTimeout(this.queryTimer)
    this.listeners.clear()
  }

  /**
   * Point the pane at a workspace, loading it when its snapshot is not ready.
   * @param workspaceId - workspace to show; `''` clears the pane.
   */
  setWorkspace(workspaceId: string): void {
    if (workspaceId === this.activeId) return
    this.activeId = workspaceId
    this.publish()
    const cached = this.cache.get(workspaceId)
    // A cached snapshot is shown at once, then refreshed: it is a starting point,
    // not an authority, since another session may have written since it was taken.
    if (cached !== undefined && cached.phase === 'ready') void this.load()
    else if (workspaceId !== '') void this.load()
  }

  /**
   * Set the query text and schedule a reload.
   * @param query - raw search text.
   */
  setQuery(query: string): void {
    const current = this.getSnapshot()
    if (current.query === query) return
    this.patch({ query })
    if (this.queryTimer !== undefined) clearTimeout(this.queryTimer)
    this.queryTimer = setTimeout(() => { this.queryTimer = undefined; void this.load() }, QUERY_DEBOUNCE_MS)
  }

  /**
   * Switch filter tier and reload at once: a click is deliberate, unlike a
   * keystroke, so it should not wait.
   * @param filter - tier to show.
   */
  setFilter(filter: WorkbenchFilterTier): void {
    if (this.getSnapshot().filter === filter) return
    this.patch({ filter })
    void this.load()
  }

  /** Reload the active workspace, keeping the current list on screen meanwhile. */
  async refresh(): Promise<void> {
    await this.load()
  }

  /**
   * Create an item in the active workspace and show it without a re-query.
   * @param title - non-blank title; the Host trims and rejects a blank one.
   * @param desc - initial description.
   * @param tag - initial tag.
   * @returns the Host's result union, for the caller to report.
   */
  async create(title: string, desc: string, tag: string): Promise<WorkbenchWriteValue> {
    const result = await this.gateway.create({
      workspaceId: this.activeId, title, desc, tag,
    })
    if (result.code === 'ok') this.admit(result.item)
    return result
  }

  /**
   * Replace an item's description.
   * @param item - the item being edited; its `updateAt` is the compare-and-swap token.
   * @param desc - new description.
   * @returns the Host's result union.
   */
  async setDesc(item: WorkItemRecord, desc: string): Promise<WorkbenchWriteValue> {
    if (desc === item.desc) return { code: 'ok', item }
    const result = await this.gateway.setDesc({
      id: item.id, workspaceId: this.activeId, desc, expectedUpdateAt: item.updateAt,
    })
    await this.settle(result)
    return result
  }

  /**
   * Replace an item's title and/or tag.
   * @param item - the item being edited; its `updateAt` is the compare-and-swap token.
   * @param next - the fields to change.
   * @returns the Host's result union.
   */
  async update(
    item: WorkItemRecord,
    next: { readonly title?: string; readonly tag?: string },
  ): Promise<WorkbenchWriteValue> {
    if (next.title === item.title && next.tag === item.tag) return { code: 'ok', item }
    const result = await this.gateway.update({
      id: item.id, workspaceId: this.activeId, expectedUpdateAt: item.updateAt,
      ...(next.title === undefined ? {} : { title: next.title }),
      ...(next.tag === undefined ? {} : { tag: next.tag }),
    })
    await this.settle(result)
    return result
  }

  /**
   * Ask the Host to write this item back: the `open → in_progress` edge, or its
   * retry (DESIGN.md §4.5).
   *
   * No summary is written here and none is faked. On the retry edge the Host
   * returns the record untouched, so a second press neither conflicts with the
   * first nor refreshes the item's clock — which is why nothing in this call has
   * to special-case a repeat.
   * @param item - the item to push; its `updateAt` is the compare-and-swap token.
   * @returns the Host's result union.
   */
  async requestComplete(item: WorkItemRecord): Promise<WorkbenchWriteValue> {
    const result = await this.gateway.requestComplete({
      id: item.id, workspaceId: this.activeId, expectedUpdateAt: item.updateAt,
    })
    await this.settle(result)
    return result
  }

  /**
   * Delete an item for good. Archiving is a different thing (DESIGN.md §4.7).
   * @param id - item to remove.
   * @returns the Host's result union.
   */
  async remove(id: WorkItemId): Promise<WorkbenchDeleteValue> {
    const result = await this.gateway.delete({ id, workspaceId: this.activeId })
    if (result.code === 'ok') {
      const current = this.getSnapshot()
      const gone = current.items.find(item => item.id === id)
      this.patch({
        items: current.items.filter(item => item.id !== id),
        total: Math.max(0, current.total - 1),
        counts: gone === undefined ? current.counts : tally(current.counts, gone, -1),
      })
    }
    return result
  }

  /**
   * Apply a write result to the snapshot.
   *
   * With no query in force the returned record is merged directly. With one, the
   * write may have changed whether the item still matches, and only the Host can
   * say, so a refresh runs instead.
   * @param result - the write's result union.
   */
  private async settle(result: WorkbenchWriteValue): Promise<void> {
    if (result.code !== 'ok') return
    if (this.getSnapshot().query !== '') { await this.load(); return }
    this.admit(result.item)
  }

  /** Merge a created or changed record into the active list, in place. */
  private admit(item: WorkItemRecord): void {
    const current = this.getSnapshot()
    const known = current.items.some(existing => existing.id === item.id)
    this.patch({
      items: known ? replace(current.items, item) : [item, ...current.items],
      total: known ? current.total : current.total + 1,
      // A field edit cannot move a record between tiers, so only an arrival
      // changes the totals; `adoptConflict` handles the case where it did.
      counts: known ? current.counts : tally(current.counts, item, 1),
    })
  }

  /**
   * Install the Host's version of a record after a conflict.
   *
   * The user's edit lost, but the pane must not keep showing the stale copy it
   * was editing — otherwise the next attempt fails the same way. The Host
   * returns the winning record precisely so this can happen.
   * @param item - the record the Host reports as current.
   */
  adoptConflict(item: WorkItemRecord): void {
    const current = this.getSnapshot()
    const previous = current.items.find(existing => existing.id === item.id)
    if (previous === undefined) return
    this.patch({
      items: replace(current.items, item),
      // The winning record may have moved tier — a model write-back completes an
      // item, which takes it out of `active` — so retally both sides.
      counts: tally(tally(current.counts, previous, -1), item, 1),
    })
  }

  /** Read the active workspace from the Host. */
  private async load(): Promise<void> {
    const workspaceId = this.activeId
    if (workspaceId === '') return
    const generation = ++this.generation
    const current = this.getSnapshot()
    this.patch({ phase: current.phase === 'ready' ? 'ready' : 'loading' })
    try {
      const value = await this.gateway.search({
        workspaceId,
        query: current.query,
        ...filterToRequest(current.filter),
      })
      if (generation !== this.generation) return
      this.patch({
        phase: 'ready',
        items: value.items,
        total: value.total,
        counts: value.counts,
        error: null,
      })
    } catch (error) {
      if (generation !== this.generation) return
      this.patch({ phase: 'error', error: describe(error) })
    }
  }

  /** Merge a partial change into the active snapshot and notify. */
  private patch(change: Partial<WorkbenchSnapshot>): void {
    const next = { ...this.getSnapshot(), ...change }
    this.cache.set(this.activeId, next)
    this.publish()
  }

  /** Wake every subscriber. */
  private publish(): void {
    for (const listener of this.listeners) listener()
  }
}

/** Turn a thrown value into the shape the error banner renders. */
export function describe(error: unknown): { readonly code: string; readonly message: string } {
  if (typeof error === 'object' && error !== null) {
    const candidate = error as { code?: unknown; message?: unknown }
    const message = typeof candidate.message === 'string' && candidate.message !== ''
      ? candidate.message
      : String(error)
    return { code: typeof candidate.code === 'string' ? candidate.code : 'unknown', message }
  }
  return { code: 'unknown', message: String(error) }
}

/**
 * Render items as a Markdown checklist, for the tab menu's copy action.
 * @param items - records to render, in the order shown.
 * @returns a Markdown document, one bullet per item.
 */
export function toMarkdown(items: readonly WorkItemRecord[]): string {
  if (items.length === 0) return ''
  const lines = items.map(item => {
    const box = item.status === 'done' ? '[x]' : '[ ]'
    const tag = item.tag === '' ? '' : ` \`${item.tag}\``
    const archived = item.archived ? ' _(archived)_' : ''
    const head = `- ${box} **${item.title}**${tag}${archived}`
    if (item.desc === '') return head
    // Indent the body so it stays inside the bullet rather than becoming a
    // second paragraph that visually leaves the item.
    return `${head}\n${item.desc.split('\n').map(line => `  ${line}`).join('\n')}`
  })
  return `${lines.join('\n')}\n`
}
