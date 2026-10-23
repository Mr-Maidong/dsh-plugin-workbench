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
import type { Context } from '@deepseek-ai/cordis';
import { TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol';
import type { WorkbenchArchiveRequest, WorkbenchCreateRequest, WorkbenchDeleteRequest, WorkbenchDeleteValue, WorkbenchProbeValue, WorkbenchRequestCompleteRequest, WorkbenchSearchRequest, WorkbenchSearchValue, WorkbenchSetDescRequest, WorkbenchUpdateRequest, WorkbenchWriteValue } from './types.ts';
export type * from './types.ts';
declare module '@deepseek-ai/cordis' {
    interface Context {
        /** Work-item authority the right-Sidebar workbench and the model tools share. */
        workbench: WorkbenchService;
    }
}
/** Work-item service: the durable authority behind the workbench tab. */
export declare class WorkbenchService extends TypertRemoteService {
    static inject: string[];
    /**
     * Opened once, at construction. Every Remote awaits this before touching
     * storage, so a domain that fails to open fails every call with one cause
     * rather than each call opening its own view of the medium.
     */
    private readonly ready;
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
    private readonly writeBacks;
    /**
     * @param ctx - Host services owning the storage hub and the workspace registry.
     */
    constructor(ctx: Context);
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
    private registerCompleteTool;
    /**
     * Register every model-facing tool this plugin owns.
     *
     * `workbench_search` and `workbench_create` (DESIGN.md §9.34) are thin
     * projections of the Remote methods, so a model and the pane share one
     * validator, one ranking, and one write path rather than two that can drift.
     * `workbench_complete` stays the write-back route below.
     * @param ctx - a Context with `tools` available.
     */
    private registerTools;
    /**
     * The workspace whose session account holds `sessionId`.
     *
     * The registry is the only place that knows which directory a session works
     * in, and a tool has no other handle on it: the model cannot see workspace
     * ids, so the tool call resolves one from the session it runs under. The
     * account is header-validated (cwd must equal the workspace path), which is
     * why this is not merely a first-registered-workspace guess.
     * @param sessionId - the calling agent's session id.
     * @returns the owning workspace, or `undefined` when no workspace claims it
     *   (a subagent session, for example).
     */
    private workspaceOfSession;
    /**
     * Look up an explicit `workspaceId` tool argument.
     * @param workspaceId - the durable id the call passed.
     * @returns the workspace, or `undefined` when the registry does not know it.
     */
    private workspaceById;
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
    private armWriteBack;
    /**
     * Report that the Host half is mounted and its domain is open.
     *
     * The tab body calls this on mount so an installed-but-broken plugin says so
     * in the pane, rather than rendering an empty list that reads as "no work
     * items" and sends the user looking in the wrong place.
     * @returns the open domain's name and how many items it holds.
     * @throws when the domain could not be opened.
     */
    probe(): Promise<WorkbenchProbeValue>;
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
    search(request: WorkbenchSearchRequest): Promise<WorkbenchSearchValue>;
    /**
     * Create one work item.
     *
     * Creation is always `open`: `status` is not an input, because `in_progress`
     * and `done` are reached only through the write-back path (DESIGN.md §4.5).
     * @param request - owning workspace and the initial fields.
     * @returns the stored record, or `invalid` when an input cannot be honored.
     * @throws when the domain could not be opened.
     */
    create(request: WorkbenchCreateRequest): Promise<WorkbenchWriteValue>;
    /**
     * Replace or append one work item's description.
     * @param request - target item, new text, and optional mode and version.
     * @returns the stored record, `conflict` against a stale version, or `invalid`.
     * @throws when the domain could not be opened.
     */
    setDesc(request: WorkbenchSetDescRequest): Promise<WorkbenchWriteValue>;
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
    update(request: WorkbenchUpdateRequest): Promise<WorkbenchWriteValue>;
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
    requestComplete(request: WorkbenchRequestCompleteRequest): Promise<WorkbenchWriteValue>;
    /**
     * File one work item away, or bring it back (§4.7, §9.31).
     *
     * §4.7 gave `archived` one producer — a deleted workspace left its items behind
     * as the record of what was asked for there — and this plugin had not
     * implemented that yet, so nothing could reach the 已归档 tier. The user's own
     * 归档 button is now the first producer, and it shares the field with that
     * future one: an archived item is out of the three daily tiers and inside
     * 已归档, whatever the reason it got there. Nothing is destroyed, which is
     * exactly why the control needs no confirmation and why it can be undone from
     * the same button.
     *
     * `archivedAt` is stamped on the way in and dropped on the way out, so the
     * field never describes a moment that no longer applies. A no-op request (the
     * item is already in the asked-for state) still returns the record, but writes
     * nothing: pressing a toggle twice must not make the list look fresher than it
     * is.
     * @param request - target item, the state to move to, and the version last seen.
     * @returns the record after the change, `conflict` on a stale version, or `invalid`.
     * @throws when the domain could not be opened.
     */
    archive(request: WorkbenchArchiveRequest): Promise<WorkbenchWriteValue>;
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
    delete(request: WorkbenchDeleteRequest): Promise<WorkbenchDeleteValue>;
    /**
     * The open domain's item table.
     * @returns the table handle.
     * @throws when the domain could not be opened.
     */
    private table;
    /**
     * Canonical path of a workspace, or `undefined` when the registry does not
     * know it.
     *
     * Work-item writes are scoped by this check (DESIGN.md §4.1) so a forged or
     * stale `workspaceId` cannot create records that no workspace can ever show.
     * @param workspaceId - raw id from the request.
     * @returns the workspace's canonical path.
     */
    private resolveWorkspace;
    /**
     * Turn an unresolvable workspace into the `invalid` branch, if it is one.
     * @param workspaceId - raw id from the request.
     * @returns the `invalid` value, or `undefined` when the workspace is known.
     */
    private rejectUnknownWorkspace;
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
    private mutate;
}
export default WorkbenchService;
//# sourceMappingURL=index.d.ts.map