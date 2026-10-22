/**
 * Work-item service: the Host half of the workbench plugin.
 *
 * The Host is the only owner of work-item storage. The browser half reaches it
 * through the Typert Remote; models reach it through tools (P4/P5). Keeping one
 * authority is what makes the read-back and write-back paths agree — a client
 * cache is a projection of this, never a second source.
 *
 * @module dsh-plugin-workbench
 */
import type { Context } from '@deepseek-ai/cordis'
// Type-only: pulls the storage hub's domain-facility merge (ctx.storageDomain).
import type {} from '@deepseek-ai/dsh-storage-domain'
import type { Domain } from '@deepseek-ai/dsh-storage-domain'
// Value import: `WorkspaceId` is the brand function, and importing the package
// also pulls its `declare module '@deepseek-ai/cordis'` merge for
// `ctx.workspaceRegistry`.
import { WorkspaceId } from '@deepseek-ai/dsh-workspace'
import { Remote, TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol'
// Value import: registers the model-facing tool named below and merges
// `ctx.tools` into the Context this service is constructed with.
import { defineTool } from '@deepseek-ai/dsh-tools'
// Typert-generated ./typert and ./remote artifacts import Zod at runtime.
import type {} from 'zod'
import { completionFromInput, completionInputError, planCompletion } from './completion.ts'
import { queryWords, scoreItem } from './fuzzy.ts'
import { planRequestComplete } from './state.ts'
import type { RequestCompletePlan } from './state.ts'
import { workbenchDomain } from './storage.ts'
import type {
  WorkItemId, WorkItemRecord, WorkbenchCompletionInput, WorkbenchCreateRequest,
  WorkbenchDeleteRequest, WorkbenchDeleteValue, WorkbenchProbeValue,
  WorkbenchRequestCompleteRequest, WorkbenchSearchRequest, WorkbenchSearchValue,
  WorkbenchSetDescRequest, WorkbenchUpdateRequest, WorkbenchWriteValue,
} from './types.ts'

export type * from './types.ts'

/** Search page size when the caller does not ask for one. */
const DEFAULT_LIMIT = 50

/** Search page ceiling, so one query cannot stream an unbounded collection. */
const MAX_LIMIT = 200

/** Separator used by `setDesc`'s append mode between the old and new text. */
const APPEND_SEPARATOR = '\n\n'

/**
 * The `invalid` branch shared by every write-ish result union.
 *
 * Named separately because {@link WorkbenchDeleteValue} has no `ok`-with-item
 * arm, so the workspace guard must return exactly this branch — handing back a
 * whole {@link WorkbenchWriteValue} would claim the ability to return an `ok`
 * shape that delete cannot express.
 */
type WorkbenchInvalid = { readonly code: 'invalid'; readonly message: string }

/**
 * Internal signal that a queued compare-and-swap lost its race.
 *
 * Thrown from inside `KvTable.update`'s transform, which runs synchronously
 * inside the domain's write queue and is never wrapped in a try/catch by the
 * storage layer — so throwing aborts the write before anything is persisted.
 * That is the whole point: a rejected CAS must not touch the record.
 *
 * Never escapes this module; `mutate` converts it back into the `conflict`
 * branch of {@link WorkbenchWriteValue}.
 */
class WorkbenchConflict extends Error {
  /** The record as it stood at the queue slot, which is what the caller lost to. */
  readonly current: WorkItemRecord

  /**
   * @param current - record observed at the queue slot.
   */
  constructor(current: WorkItemRecord) {
    super('work item changed since it was read')
    this.name = 'WorkbenchConflict'
    this.current = current
  }
}

/**
 * Internal signal that a queued `requestComplete` reached its slot on an edge
 * that must not write.
 *
 * The plan is decided from a read *before* the queue, and a record can move in
 * between: another session can advance it to `in_progress`, and — once the model
 * can complete items (P5) — it can become `done`. Writing on either would be
 * wrong, and the second one badly: it would drag a completed item back to
 * `in_progress`, an edge §4.5 says does not exist. The slot is the only read
 * that is atomic with the write, so the plan is re-decided there and thrown out
 * through the same abort mechanism as {@link WorkbenchConflict} — a throw inside
 * the transform is what stops the write from being persisted.
 */
class WorkbenchEdgeLost extends Error {
  /** The plan as re-decided at the queue slot; never `advance`. */
  readonly plan: Exclude<RequestCompletePlan, { kind: 'advance' }>

  /** The record as it stood at the queue slot. */
  readonly current: WorkItemRecord

  /**
   * @param plan - the retry or refuse edge observed at the slot.
   * @param current - record observed at the slot.
   */
  constructor(plan: Exclude<RequestCompletePlan, { kind: 'advance' }>, current: WorkItemRecord) {
    super(plan.kind === 'refuse' ? plan.message : 'work item is already in progress')
    this.name = 'WorkbenchEdgeLost'
    this.plan = plan
    this.current = current
  }
}

declare module '@deepseek-ai/cordis' {
  interface Context {
    /** Work-item authority the right-Sidebar workbench and the model tools share. */
    workbench: WorkbenchService
  }
}

/** Work-item service: the durable authority behind the workbench tab. */
export class WorkbenchService extends TypertRemoteService {
  static inject = ['storageDomain', 'workspaceRegistry']

  /**
   * Opened once, at construction. Every Remote awaits this before touching
   * storage, so a domain that fails to open fails every call with one cause
   * rather than each call opening its own view of the medium.
   */
  private readonly ready: Promise<Domain<typeof workbenchDomain>>

  /**
   * The `updateAt` each item was at when the user last asked for a write-back,
   * keyed by item id.
   *
   * The write-back is version-guarded so it cannot overwrite an edit the user
   * made after clicking (DESIGN.md §11.4): the tool carries no version of its
   * own — the model has no way to know one — so the Host remembers the version
   * the *request* observed and hands it to the same CAS the Remote writes use.
   * A model that finishes the work late loses to a later user edit, which is the
   * correct direction: the user's own text is never silently replaced.
   */
  private readonly writeBacks = new Map<string, string>()

  /**
   * @param ctx - Host services owning the storage hub and the workspace registry.
   */
  constructor(ctx: Context) {
    super(ctx, 'workbench')
    this.ready = ctx.storageDomain.open(workbenchDomain)
    // The domain outlives every call that reads it, so an unobserved open that
    // later rejects would surface as an unhandled rejection instead of as a
    // failed Remote. Callers still see the failure through `ready` below.
    this.ready.catch(() => {})
    // The facility holds the name until the handle closes; a reload that rebuilds
    // this service would otherwise find the name still open and fail.
    ctx.effect(() => () => {
      void this.ready.then(domain => domain.close(), () => {})
    }, 'workbench: storage domain')
    // The tool registry is optional, and registered through `inject` rather than
    // `static inject` so a profile without it still gets the whole tab: the only
    // thing lost is a model's ability to write a completion back.
    ctx.inject(['tools'], scoped => { this.registerCompleteTool(scoped) })
  }

  /**
   * Register `workbench_complete`: the one model-facing tool of the write-back
   * route (DESIGN.md §11.3, §13.5).
   *
   * The tool is the *second half* of a two-part flow. The tab's click only
   * advances the item to `in_progress` and queues a user turn asking for the
   * summary; the model answers that turn by calling this tool, which is the only
   * thing that may write `done` and a completion record (DESIGN.md §4.5). A model
   * that never calls it costs nothing: the item stays `in_progress` with no
   * record and no fake completion, and the user can ask again.
   *
   * The tool writes to the same durable record every Remote writes to, and
   * appends no session event. That is a deliberate deviation from the design's
   * first sketch (DESIGN.md §11.6): a session event type declared outside this
   * repository is absent from the generated `KNOWN_SESSION_EVENT_TYPES`, and the
   * persistence read path refuses to load a log carrying an unknown type that is
   * not marked `ignorable` — a marker `Session.append()` cannot set. The record
   * is the authority anyway (§13.2), so the write-back writes it and the tab
   * re-reads it when the session settles.
   * @param ctx - a Context with `tools` available.
   */
  private registerCompleteTool(ctx: Context): void {
    ctx.tools.register(defineTool({
      name: 'workbench_complete',
      description: 'Write the completion record for one workbench work item. Echo the id from the request exactly. Call only after the task is actually done, and report only verification commands that were actually run. Each call records the whole task: a later call for the same id replaces the earlier record, so rewrite the summary, the implementation path, the changed files, and the verification to cover everything the task did — every requirement and every later correction — not only the latest change. A replacement that drops a file or a command the earlier record already carries is rejected.',
      parameters: {
        id: { type: 'string', required: true, description: 'Work item id, echoed from the request.' },
        summary: { type: 'string', required: true, description: 'Complete result summary for the whole task, not only the latest change.' },
        implementationPath: { type: 'array', required: true, items: { type: 'string' }, description: 'Every implementation step of the task, not only the latest change.' },
        changedFiles: { type: 'array', required: true, description: 'Every file the task changed; a later call keeps the earlier entries.', items: { type: 'object', additionalProperties: false, properties: { path: { type: 'string', required: true }, purpose: { type: 'string', required: true } } } },
        verification: { type: 'array', required: true, description: 'Every command the task actually ran; a later call keeps the earlier entries.', items: { type: 'object', additionalProperties: false, properties: { command: { type: 'string', required: true }, result: { type: 'string', required: true, enum: ['passed', 'failed', 'skipped'] }, note: { type: 'string' } } } },
      },
      output: {
        schema: {
          type: 'object',
          additionalProperties: false,
          properties: {
            id: { type: 'string', required: true },
            written: { type: 'boolean', required: true },
            replaced: { type: 'boolean', required: true },
            replacedAt: { type: 'string' },
            replacedSummary: { type: 'string' },
          },
        },
        render: (_args, value) => [{
          type: 'text',
          text: value.replaced
            ? `Recorded the completion for work item ${value.id}, replacing the record written at ${value.replacedAt}. Make sure it covers the whole task: if the summary or any list describes only the latest change, call workbench_complete again with the complete record. The replaced record said: ${value.replacedSummary}`
            : `Recorded the completion for work item ${value.id}.`,
        }],
      },
      execute: async (args, exec) => {
        const id = args.id.trim()
        if (id === '') throw new Error('workbench_complete requires a non-empty id')
        // A write-back without an owning session has no turn to conclude, and a
        // completion written outside a turn would be a record nobody asked for.
        if (!exec.agent) throw new Error('workbench_complete requires an owning agent session')
        const input: WorkbenchCompletionInput = {
          summary: args.summary.trim(),
          implementationPath: args.implementationPath,
          changedFiles: args.changedFiles,
          verification: args.verification,
        }
        const empty = completionInputError(input)
        if (empty !== undefined) throw new Error(empty)
        const table = await this.table()
        const observed = table.get(id as WorkItemId)
        if (observed === undefined) {
          throw new Error(`unknown work item ${id}; use the id the request named`)
        }
        const plan = planCompletion(observed, input)
        if (plan.kind === 'refuse') throw new Error(plan.message)
        const earlier = observed.completion
        // The request's version guard is consumed by this attempt whether it
        // succeeds or not: one click arms exactly one write-back, and a later
        // completion must be answered by a later click.
        const expectedUpdateAt = this.writeBacks.get(id)
        this.writeBacks.delete(id)
        const result = await this.mutate({
          id: observed.id,
          workspaceId: observed.workspaceId,
          ...(expectedUpdateAt === undefined ? {} : { expectedUpdateAt }),
        }, current => ({ ...current, status: 'done' as const, completion: completionFromInput(input) }))
        if (result.code === 'conflict') {
          throw new Error(`work item ${id} was edited after this write-back was requested, so the completion was not recorded; the edit stands and the item is still open for another request`)
        }
        if (result.code === 'not_found') {
          throw new Error(`work item ${id} was deleted before the completion could be recorded`)
        }
        if (result.code === 'invalid') throw new Error(result.message)
        // The fast path: the write-back is what the turn was queued for, so the
        // turn ends here instead of waiting for the model to find something else
        // to say (DESIGN.md §11.5).
        exec.concludeTurn()
        return {
          id,
          written: true,
          replaced: plan.replaced,
          ...(earlier === undefined ? {} : { replacedAt: earlier.completedAt, replacedSummary: earlier.summary }),
        }
      },
    }))
  }

  /**
   * Remember the version a write-back request observed.
   *
   * Called on both edges of the request, because the guard has to cover the
   * version the *client* last saw: the advance edge re-stamps `updateAt` as it
   * writes, and the retry edge writes nothing at all, so in both cases the
   * version the model's completion must still match is the one the request
   * returned (DESIGN.md §4.5, §11.4).
   * @param id - the item the user asked about.
   * @param updateAt - the version that request observed.
   */
  private armWriteBack(id: string, updateAt: string): void {
    this.writeBacks.set(id, updateAt)
  }

  /**
   * Report that the Host half is mounted and its domain is open.
   *
   * The tab body calls this on mount so an installed-but-broken plugin says so
   * in the pane, rather than rendering an empty list that reads as "no work
   * items" and sends the user looking in the wrong place.
   * @returns the open domain's name and how many items it holds.
   * @throws when the domain could not be opened.
   */
  @Remote('probe')
  async probe(): Promise<WorkbenchProbeValue> {
    const domain = await this.ready
    return { domain: domain.name, itemCount: domain.table('items').size }
  }

  /**
   * Fuzzy-query work items, ranked by the three-tier score in `fuzzy.ts`.
   *
   * Reads a snapshot: `entries()` is documented as stable while queued writes
   * land, so one query sees one consistent collection rather than a list that
   * changes mid-scan.
   * @param request - filters, paging, and the optional query text.
   * @returns the page plus the unpaged hit count.
   * @throws when the domain could not be opened.
   */
  @Remote('search')
  async search(request: WorkbenchSearchRequest): Promise<WorkbenchSearchValue> {
    const table = await this.table()
    const words = queryWords(request.query ?? '')
    const wanted = request.status === undefined ? undefined : new Set<string>(request.status)

    const hits: { readonly item: WorkItemRecord; readonly score: number }[] = []
    // Default `exclude`: archived items are the record of a deleted workspace
    // (DESIGN.md §4.7), and leaving them out by default is what keeps them out
    // of the daily view.
    const archived = request.archived ?? 'exclude'
    /*
     * Tier sizes are counted in the same pass but before any filter is applied,
     * so they describe the workspace rather than the current page: "未完成 4"
     * keeps saying 4 while a search narrows the list to one. Archiving is what
     * separates the three daily tiers from the fourth, so it is tested first.
     */
    let activeCount = 0
    let doneCount = 0
    let archivedCount = 0
    for (const [, record] of table.entries()) {
      if (request.workspaceId !== undefined && record.workspaceId !== request.workspaceId) continue
      if (record.archived) archivedCount++
      else if (record.status === 'done') doneCount++
      else activeCount++
      if (archived === 'exclude' && record.archived) continue
      if (archived === 'only' && !record.archived) continue
      if (wanted !== undefined && !wanted.has(record.status)) continue
      if (request.tag !== undefined && record.tag !== request.tag) continue

      const score = scoreItem(request.query ?? '', record)
      // An empty query is "no filter", not "match nothing"; both score
      // SCORE_MISS, so the word list is what separates them (see fuzzy.ts).
      if (words.length > 0 && score === 0) continue
      hits.push({ item: record, score })
    }

    // Score descending, then most-recently-updated first. Written as an explicit
    // second key rather than relying on the pre-sort order, so the result does
    // not depend on the snapshot's iteration order.
    hits.sort((left, right) => {
      if (left.score !== right.score) return right.score - left.score
      if (left.item.updateAt === right.item.updateAt) return 0
      return left.item.updateAt < right.item.updateAt ? 1 : -1
    })

    const offset = Math.max(0, request.offset ?? 0)
    const limit = Math.min(MAX_LIMIT, Math.max(1, request.limit ?? DEFAULT_LIMIT))
    return {
      items: hits.slice(offset, offset + limit).map(hit => hit.item),
      total: hits.length,
      counts: {
        // The daily tiers partition the non-archived items, so `all` is their sum.
        all: activeCount + doneCount,
        active: activeCount,
        done: doneCount,
        archived: archivedCount,
      },
    }
  }

  /**
   * Create one work item.
   *
   * Creation is always `open`: `status` is not an input, because `in_progress`
   * and `done` are reached only through the write-back path (DESIGN.md §4.5).
   * @param request - owning workspace and the initial fields.
   * @returns the stored record, or `invalid` when an input cannot be honored.
   * @throws when the domain could not be opened.
   */
  @Remote('create')
  async create(request: WorkbenchCreateRequest): Promise<WorkbenchWriteValue> {
    const workspacePath = this.resolveWorkspace(request.workspaceId)
    if (workspacePath === undefined) {
      return { code: 'invalid', message: `unknown workspace '${request.workspaceId}'` }
    }
    const title = request.title.trim()
    if (title === '') return { code: 'invalid', message: 'title must not be blank' }

    const now = nowInstant()
    const record: WorkItemRecord = {
      id: crypto.randomUUID() as WorkItemId,
      workspaceId: request.workspaceId,
      workspacePath,
      title,
      desc: request.desc ?? '',
      tag: request.tag ?? '',
      status: 'open',
      archived: false,
      updateAt: now,
      createdAt: now,
    }

    const table = await this.table()
    await table.put(record.id, record)
    return { code: 'ok', item: record }
  }

  /**
   * Replace or append one work item's description.
   * @param request - target item, new text, and optional mode and version.
   * @returns the stored record, `conflict` against a stale version, or `invalid`.
   * @throws when the domain could not be opened.
   */
  @Remote('setDesc')
  async setDesc(request: WorkbenchSetDescRequest): Promise<WorkbenchWriteValue> {
    const invalid = this.rejectUnknownWorkspace(request.workspaceId)
    if (invalid !== undefined) return invalid
    return this.mutate(request, current => ({
      ...current,
      desc: request.mode === 'append' && current.desc !== ''
        ? `${current.desc}${APPEND_SEPARATOR}${request.desc}`
        : request.desc,
    }))
  }

  /**
   * Change one work item's title and tag.
   *
   * Requesting neither is rejected rather than treated as a no-op: a silent
   * success would still have to either bump `updateAt` (changing a record the
   * caller did not ask to change) or not bump it (making `update` the one write
   * that may not write), and both readings are wrong.
   * @param request - target item and the fields to change.
   * @returns the stored record, `conflict` against a stale version, or `invalid`.
   * @throws when the domain could not be opened.
   */
  @Remote('update')
  async update(request: WorkbenchUpdateRequest): Promise<WorkbenchWriteValue> {
    const invalid = this.rejectUnknownWorkspace(request.workspaceId)
    if (invalid !== undefined) return invalid
    const title = request.title?.trim()
    if (title === '') return { code: 'invalid', message: 'title must not be blank' }
    if (title === undefined && request.tag === undefined) {
      return { code: 'invalid', message: 'update requires title or tag' }
    }
    return this.mutate(request, current => ({
      ...current,
      ...title === undefined ? {} : { title },
      ...request.tag === undefined ? {} : { tag: request.tag },
    }))
  }

  /**
   * Ask for a write-back on one work item: the `open → in_progress` edge, and its
   * retry (DESIGN.md §4.5).
   *
   * It advances intent, never outcome. No summary is produced here, and no status
   * other than `in_progress` is reachable from it: `done` stays the monopoly of a
   * successful `workbench_complete` (P5), which is what makes a completed item a
   * fact rather than a claim.
   *
   * The retry edge is idempotent by construction — an item already in progress is
   * returned unwritten, with `expectedUpdateAt` ignored — so pressing the control
   * twice neither conflicts with the first press nor moves `updateAt`, and a
   * failed model turn can be retried without the list pretending to be fresher
   * than it is. Only the writing edge compares versions, which is also why a
   * genuine race there is still reported as `conflict` rather than merged.
   * @param request - target item and the version the caller last saw.
   * @returns the record after the edge, `conflict` on the writing edge, or `invalid`.
   * @throws when the domain could not be opened.
   */
  @Remote('requestComplete')
  async requestComplete(request: WorkbenchRequestCompleteRequest): Promise<WorkbenchWriteValue> {
    const invalid = this.rejectUnknownWorkspace(request.workspaceId)
    if (invalid !== undefined) return invalid
    const table = await this.table()
    const key = request.id as WorkItemId
    const observed = table.get(key)
    // Ownership is part of identity here exactly as it is in `mutate`: an id that
    // belongs to another workspace is reported absent, not forbidden.
    if (observed === undefined || observed.workspaceId !== request.workspaceId) {
      return { code: 'not_found', id: request.id }
    }
    const plan = planRequestComplete(observed.status)
    if (plan.kind === 'refuse') return { code: 'invalid', message: plan.message }
    // The retry edge writes nothing at all — no record, no `updateAt`, no version
    // check — so it can neither conflict nor forge recency. It still re-arms the
    // write-back, because the user is asking for a summary of the item as it
    // stands right now, and that version is the one the completion must match.
    if (plan.kind === 'retry') {
      this.armWriteBack(request.id, observed.updateAt)
      return { code: 'ok', item: observed }
    }
    const result = await this.mutate(request, current => {
      // Re-decided at the queue slot, and deliberately not reused from above: this
      // is the only read that is atomic with the write, so it is the one that
      // decides whether the edge still writes (see `WorkbenchEdgeLost`).
      const atSlot = planRequestComplete(current.status)
      if (atSlot.kind !== 'advance') throw new WorkbenchEdgeLost(atSlot, current)
      return { ...current, status: 'in_progress' }
    })
    // Armed only for a write that happened: on a conflict the client's version was
    // stale, so there is no version a later completion could honestly match.
    if (result.code === 'ok') this.armWriteBack(request.id, result.item.updateAt)
    return result
  }

  /**
   * Delete one work item.
   *
   * Deletion is a real removal, not the archiving of §4.7: archiving preserves
   * an item whose *workspace* disappeared, while this is the user discarding an
   * item they asked for.
   *
   * Unlike the other writes there is no workspace guard, because
   * {@link WorkbenchDeleteValue} has no `invalid` arm. An unresolvable
   * `workspaceId` therefore falls out of the ownership check below as
   * `not_found` — which is the more accurate answer anyway: if the workspace
   * does not exist, no item can belong to it, so the item is absent rather than
   * mis-specified.
   * @param request - target item.
   * @returns the deleted id, or `not_found`.
   * @throws when the domain could not be opened.
   */
  @Remote('delete')
  async delete(request: WorkbenchDeleteRequest): Promise<WorkbenchDeleteValue> {
    const table = await this.table()
    const current = table.get(request.id)
    // The ownership test also covers an unknown workspace: no stored record can
    // name a workspace the registry does not know, so this returns not_found
    // without a separate registry lookup.
    if (current === undefined || current.workspaceId !== request.workspaceId) {
      return { code: 'not_found', id: request.id }
    }
    await table.delete(request.id)
    // A pending write-back for a deleted item can never be answered, so its
    // version guard is dropped with the item.
    this.writeBacks.delete(request.id)
    return { code: 'ok', id: request.id }
  }

  /**
   * The open domain's item table.
   * @returns the table handle.
   * @throws when the domain could not be opened.
   */
  private async table() {
    const domain = await this.ready
    return domain.table('items')
  }

  /**
   * Canonical path of a workspace, or `undefined` when the registry does not
   * know it.
   *
   * Work-item writes are scoped by this check (DESIGN.md §4.1) so a forged or
   * stale `workspaceId` cannot create records that no workspace can ever show.
   * @param workspaceId - raw id from the request.
   * @returns the workspace's canonical path.
   */
  private resolveWorkspace(workspaceId: string): string | undefined {
    return this.ctx.workspaceRegistry.get(WorkspaceId(workspaceId))?.path
  }

  /**
   * Turn an unresolvable workspace into the `invalid` branch, if it is one.
   * @param workspaceId - raw id from the request.
   * @returns the `invalid` value, or `undefined` when the workspace is known.
   */
  private rejectUnknownWorkspace(workspaceId: string): WorkbenchInvalid | undefined {
    if (this.resolveWorkspace(workspaceId) !== undefined) return undefined
    return { code: 'invalid', message: `unknown workspace '${workspaceId}'` }
  }

  /**
   * Apply one compare-and-swap transform to a work item.
   *
   * Two checks, because they answer different questions. The read outside the
   * queue gives the fast, ordinary answers (`not_found`, `conflict`) without
   * paying for a queued write. The check *inside* the transform is the one that
   * is actually atomic: it sees the record as of its queue slot, so a writer
   * that landed in between cannot be clobbered by a stale expectation.
   * @param request - target item, optional expected version.
   * @param transform - next-record builder, given the record as of the queue slot.
   *   It may abort the write by throwing {@link WorkbenchConflict} or
   *   {@link WorkbenchEdgeLost}; both are turned back into a result below.
   * @returns the write outcome.
   * @throws when the domain could not be opened, or the failure is unexpected.
   */
  private async mutate(
    request: { readonly id: string; readonly workspaceId: string; readonly expectedUpdateAt?: string },
    transform: (current: WorkItemRecord) => WorkItemRecord,
  ): Promise<WorkbenchWriteValue> {
    const table = await this.table()
    const key = request.id as WorkItemId
    const current = table.get(key)
    // Ownership is part of identity: an id belonging to another workspace is
    // reported as absent rather than as a permission failure, so the reply
    // never confirms that some other workspace holds that id.
    if (current === undefined || current.workspaceId !== request.workspaceId) {
      return { code: 'not_found', id: request.id }
    }
    const expected = request.expectedUpdateAt
    if (expected !== undefined && current.updateAt !== expected) {
      return { code: 'conflict', current }
    }

    const now = nowInstant()
    try {
      const next = await table.update(key, record => {
        if (expected !== undefined && record.updateAt !== expected) throw new WorkbenchConflict(record)
        return { ...transform(record), updateAt: now } satisfies WorkItemRecord
      })
      return { code: 'ok', item: next }
    } catch (error) {
      if (error instanceof WorkbenchConflict) return { code: 'conflict', current: error.current }
      // A `requestComplete` transform may abort its own write: a retry that lost
      // its slot reports the record as it stands, a refusal that lost it reports
      // the refusal (see `WorkbenchEdgeLost`).
      if (error instanceof WorkbenchEdgeLost) {
        return error.plan.kind === 'refuse'
          ? { code: 'invalid', message: error.plan.message }
          : { code: 'ok', item: error.current }
      }
      // The only other expected rejection is the record disappearing between
      // the read above and its queue slot. Confirmed by reading, so nothing here
      // depends on the storage layer's error shape.
      if (table.get(key) === undefined) return { code: 'not_found', id: request.id }
      throw error
    }
  }
}

/**
 * The canonical instant spelling the domain schema accepts — four-digit year,
 * UTC, millisecond precision.
 * @returns the current instant.
 */
function nowInstant(): string {
  return new Date().toISOString()
}

export default WorkbenchService
