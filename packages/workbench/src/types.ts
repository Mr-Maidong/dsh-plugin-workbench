/**
 * Work-item record and the Remote contract the browser half reads.
 *
 * Everything here is JSON-safe by construction: the values cross a Typert
 * Remote boundary and are re-validated by zod on the way back out of storage
 * (see `storage.ts`), so a value that cannot survive that round trip must not
 * be spelled here.
 *
 * @module dsh-plugin-workbench/types
 */

/** Work-item identity (branded string, a UUID minted by the Host). */
export type WorkItemId = string & { readonly __brand: 'WorkItemId' }

/**
 * Live status. Flows one way, `open → in_progress → done`; see DESIGN.md §4.5.
 *
 * `done` is not an assignable field: only a successful model write-back sets it,
 * and nothing can undo it. The user cannot set a status, and neither can a tool
 * except by handing over a completion.
 */
export type WorkItemStatus = 'open' | 'in_progress' | 'done'

/** What one verification step reported. */
export type VerificationResult = 'passed' | 'failed' | 'skipped'

/** One changed file, and why it changed. */
export interface ChangedFile {
  readonly path: string
  readonly purpose: string
}

/** One verification command and its outcome. */
export interface VerificationEntry {
  readonly command: string
  readonly result: VerificationResult
  readonly note?: string
}

/**
 * The structured result a model hands back when it writes a completion.
 *
 * `completedAt` and `completedBy` are filled by the executor, never by the
 * model, so the same shape cannot be used as tool input (see
 * `WorkbenchCompletionInput`).
 */
export interface WorkbenchCompletion {
  /** What this round actually did. */
  readonly summary: string
  /** The implementation path, in the order it was taken. */
  readonly implementationPath: readonly string[]
  readonly changedFiles: readonly ChangedFile[]
  readonly verification: readonly VerificationEntry[]
  /** ISO-8601 UTC with millisecond precision, stamped by the executor. */
  readonly completedAt: string
  /** `'model'` = written back by a model; `'user'` = marked complete by the user. Display copy only. */
  readonly completedBy: 'model' | 'user'
}

/**
 * What a tool submits as a completion: {@link WorkbenchCompletion} without the
 * two executor-owned fields, so a model cannot invent its own completion time
 * or claim a human marked it done.
 */
export interface WorkbenchCompletionInput {
  readonly summary: string
  readonly implementationPath: readonly string[]
  readonly changedFiles: readonly ChangedFile[]
  readonly verification: readonly VerificationEntry[]
}

/** One work item as the browser half renders it. */
export interface WorkItemRecord {
  readonly id: WorkItemId
  /** Owning workspace; `''` means unassigned (the session is in no workspace). */
  readonly workspaceId: string
  /**
   * Snapshot of the owning workspace's canonical path, so an archived item can
   * still show which directory it belonged to after the workspace is gone.
   */
  readonly workspacePath: string
  readonly title: string
  readonly desc: string
  /** A single free-text tag; `''` means none. */
  readonly tag: string
  readonly status: WorkItemStatus
  /**
   * Filed away: out of the three daily tiers and inside 已归档 (DESIGN.md §4.7,
   * §9.31).
   *
   * Two things set it, and the field does not distinguish them — §4.7's original
   * case (the owning workspace was deleted, which is why the path snapshot above
   * exists) and, since §9.31, the user's own 归档 button, which the same button
   * reverses.
   *
   * Orthogonal to `status`, not a fourth value: an archived `open` item is
   * still editable and still writable back, and an archived `done` item is
   * still a trustworthy execution record.
   */
  readonly archived: boolean
  /** ISO-8601 UTC with millisecond precision; set when `archived` became true. */
  readonly archivedAt?: string
  /** ISO-8601 UTC with millisecond precision; refreshed by every write. Backs the `update_at` requirement. */
  readonly updateAt: string
  /** ISO-8601 UTC with millisecond precision; written once at creation. */
  readonly createdAt: string
  /** The write-back result; present only once `status` is `done`. */
  readonly completion?: WorkbenchCompletion
}

/**
 * P0 liveness probe.
 *
 * The tab body calls this on mount, so an installed plugin that fails to mount,
 * fails to reach the Host, or serves a stale bundle reports itself in the pane
 * instead of rendering an empty list that looks like "no work items". It is
 * also what makes the Remote path observable from the browser console.
 */
export interface WorkbenchProbeValue {
  /** Domain name the Host opened, or `''` before the domain is ready. */
  readonly domain: string
  /** Work items currently persisted. */
  readonly itemCount: number
}

/* -------------------------------------------------------------------------- *
 * P1 write and query contract (DESIGN.md §4.1)
 *
 * Every write returns a discriminated union instead of throwing. A conflict is
 * an ordinary outcome of concurrent editing, not an exception, and the browser
 * half has to render it either way — so it travels as a value the caller must
 * match on rather than as a rejection it might forget to catch.
 * -------------------------------------------------------------------------- */

/**
 * Which side of the archive line `search` returns.
 *
 * Three states rather than a boolean: the fourth filter tier of DESIGN.md §5.4
 * shows ONLY archived items, the three daily tiers show only unarchived ones,
 * and a caller may still want both at once. A single `includeArchived` flag can
 * express the third case but not the second as distinct from it, so the tier
 * that matters most for the daily view would have had to filter client-side,
 * where the hit count and paging would then be wrong.
 */
export type WorkbenchArchivedScope = 'exclude' | 'include' | 'only'

/** Filters and paging accepted by the `search` Remote. */
export interface WorkbenchSearchRequest {
  /** Owning workspace; omitted means every workspace. */
  readonly workspaceId?: string
  /** Fuzzy query text; omitted or blank means no text filter. */
  readonly query?: string
  /** Restrict to these statuses; omitted means all of them. */
  readonly status?: readonly WorkItemStatus[]
  /** Exact tag match; omitted means any. */
  readonly tag?: string
  /**
   * How to treat archived items (DESIGN.md §4.7). Defaults to `exclude`:
   * archived items are the record of a deleted workspace, and mixing them into
   * the daily view is what this field exists to prevent.
   */
  readonly archived?: WorkbenchArchivedScope
  /** Offset into the scored, `updateAt`-descending order. */
  readonly offset?: number
  /** Page size. Defaults to 50, capped at 200. */
  readonly limit?: number
}

/**
 * How many items each filter tier holds, within the request's workspace.
 *
 * Counted over the whole workspace and ignoring the request's `query`, `status`,
 * `archived` and `tag`: these are the sizes of the four tiers, not of the
 * current page, which is what lets the filter row say "未完成 4" while showing
 * only the two that match a search (DESIGN.md §5.4).
 *
 * `all` is the non-archived total, because archiving moves an item out of every
 * daily tier at once — it is the one tier that is not simply a status.
 */
export interface WorkbenchSearchCounts {
  readonly all: number
  readonly active: number
  readonly done: number
  readonly archived: number
}

/** A page of search results. */
export interface WorkbenchSearchValue {
  readonly items: readonly WorkItemRecord[]
  /** Hits before paging, so the UI can say how many remain. */
  readonly total: number
  /** Sizes of the four filter tiers for this workspace, independent of the page. */
  readonly counts: WorkbenchSearchCounts
}

/** Create one work item. */
export interface WorkbenchCreateRequest {
  readonly workspaceId: string
  readonly title: string
  readonly desc?: string
  readonly tag?: string
  // No `status`: creation is always `open` (DESIGN.md §4.5). The only way to
  // express "someone is already working on this" is `requestComplete`.
}

/** Replace or append one work item's description. */
export interface WorkbenchSetDescRequest {
  readonly workspaceId: string
  readonly id: WorkItemId
  readonly desc: string
  /** Defaults to `replace`. */
  readonly mode?: 'replace' | 'append'
  /** Last observed `updateAt`; a mismatch yields `conflict` rather than a blind write. */
  readonly expectedUpdateAt?: string
}

/** Change a work item's title and tag. */
export interface WorkbenchUpdateRequest {
  readonly workspaceId: string
  readonly id: WorkItemId
  readonly title?: string
  readonly tag?: string
  readonly expectedUpdateAt?: string
}

/**
 * Ask for a write-back on one work item (DESIGN.md §4.5).
 *
 * The user-facing half of completion, and it produces no summary: it advances the
 * intent — `open → in_progress` — so the record says that work is under way. The
 * summary itself arrives only through a successful `workbench_complete`, which is
 * the one thing that turns an item `done`.
 */
export interface WorkbenchRequestCompleteRequest {
  readonly workspaceId: string
  readonly id: WorkItemId
  /**
   * The version the caller last saw. Honoured on the `open → in_progress` edge
   * only: an item that is already `in_progress` is a retry, and a retry that
   * could conflict would fight the write it is retrying (§4.5).
   */
  readonly expectedUpdateAt?: string
}

/**
 * Put one work item away, or take it back out (DESIGN.md §4.7, §9.31).
 *
 * Archiving is the user's own filing decision, and it is reversible, which is
 * what lets the pane offer it as a plain button: nothing is destroyed, the item
 * only leaves the three daily tiers and turns up under 已归档.
 */
export interface WorkbenchArchiveRequest {
  readonly workspaceId: string
  readonly id: WorkItemId
  /** `true` files the item away; `false` brings it back. */
  readonly archived: boolean
  /** Last observed `updateAt`; a mismatch yields `conflict` rather than a blind write. */
  readonly expectedUpdateAt?: string
}

/** Delete one work item. */
export interface WorkbenchDeleteRequest {
  readonly workspaceId: string
  readonly id: WorkItemId
}

/**
 * Outcome of a write, as a discriminated union.
 *
 * `not_found` and `conflict` both name the item they are about, so a caller can
 * report which row to refresh; `conflict` carries the current record so the UI
 * can show what it lost to without a second round trip.
 */
export type WorkbenchWriteValue =
  | { readonly code: 'ok'; readonly item: WorkItemRecord }
  | { readonly code: 'not_found'; readonly id: string }
  | { readonly code: 'conflict'; readonly current: WorkItemRecord }
  | { readonly code: 'invalid'; readonly message: string }

/**
 * Outcome of a delete.
 *
 * `conflict` is reserved rather than produced today: nothing yet races a
 * delete, because the write-back path that would is P3. It stays in the union
 * so adding that guard does not change the wire shape.
 */
export type WorkbenchDeleteValue =
  | { readonly code: 'ok'; readonly id: string }
  | { readonly code: 'not_found'; readonly id: string }
  | { readonly code: 'conflict'; readonly current: WorkItemRecord }

/**
 * One change notice, as `watch` streams it (DESIGN.md §9.36).
 *
 * It deliberately carries no item and no diff. A notice answers exactly one
 * question — "is the list I am holding still the list the Host has?" — and the
 * cheap honest answer to a *no* is a re-query through the same `search` the pane
 * already runs. Shipping the changed record here would create a second way for
 * the list to be populated, and the two would eventually disagree about paging,
 * ranking, and tier counts.
 *
 * `revision` is the Host's counter, monotonic across workspaces. A watcher can
 * use it to drop a notice it has already acted on after a reconnect replays one.
 */
export interface WorkbenchChange {
  /** Workspace whose items changed; `''` never appears on the wire. */
  readonly workspaceId: string
  /** Host-wide write sequence number of this notice. */
  readonly revision: number
  /** When the Host applied the write, ISO-8601 UTC with millisecond precision. */
  readonly at: string
}
