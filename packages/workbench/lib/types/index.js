var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
// Value import: `WorkspaceId` is the brand function, and importing the package
// also pulls its `declare module '@deepseek-ai/cordis'` merge for
// `ctx.workspaceRegistry`.
import { WorkspaceId } from '@deepseek-ai/dsh-workspace';
import { Remote, TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol';
// Value import: registers the model-facing tool named below and merges
// `ctx.tools` into the Context this service is constructed with.
import { defineTool } from '@deepseek-ai/dsh-tools';
import { completionFromInput, completionInputError, planCompletion } from "./completion.js";
import { queryWords, scoreItem } from "./fuzzy.js";
import { planRequestComplete } from "./state.js";
import { workbenchDomain } from "./storage.js";
/** Search page size when the caller does not ask for one. */
const DEFAULT_LIMIT = 50;
/** Search page ceiling, so one query cannot stream an unbounded collection. */
const MAX_LIMIT = 200;
/** Separator used by `setDesc`'s append mode between the old and new text. */
const APPEND_SEPARATOR = '\n\n';
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
    current;
    /**
     * @param current - record observed at the queue slot.
     */
    constructor(current) {
        super('work item changed since it was read');
        this.name = 'WorkbenchConflict';
        this.current = current;
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
    plan;
    /** The record as it stood at the queue slot. */
    current;
    /**
     * @param plan - the retry or refuse edge observed at the slot.
     * @param current - record observed at the slot.
     */
    constructor(plan, current) {
        super(plan.kind === 'refuse' ? plan.message : 'work item is already in progress');
        this.name = 'WorkbenchEdgeLost';
        this.plan = plan;
        this.current = current;
    }
}
/** Work-item service: the durable authority behind the workbench tab. */
let WorkbenchService = (() => {
    let _classSuper = TypertRemoteService;
    let _instanceExtraInitializers = [];
    let _probe_decorators;
    let _search_decorators;
    let _create_decorators;
    let _setDesc_decorators;
    let _update_decorators;
    let _requestComplete_decorators;
    let _delete_decorators;
    return class WorkbenchService extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _probe_decorators = [Remote('probe')];
            _search_decorators = [Remote('search')];
            _create_decorators = [Remote('create')];
            _setDesc_decorators = [Remote('setDesc')];
            _update_decorators = [Remote('update')];
            _requestComplete_decorators = [Remote('requestComplete')];
            _delete_decorators = [Remote('delete')];
            __esDecorate(this, null, _probe_decorators, { kind: "method", name: "probe", static: false, private: false, access: { has: obj => "probe" in obj, get: obj => obj.probe }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _search_decorators, { kind: "method", name: "search", static: false, private: false, access: { has: obj => "search" in obj, get: obj => obj.search }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _create_decorators, { kind: "method", name: "create", static: false, private: false, access: { has: obj => "create" in obj, get: obj => obj.create }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _setDesc_decorators, { kind: "method", name: "setDesc", static: false, private: false, access: { has: obj => "setDesc" in obj, get: obj => obj.setDesc }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _update_decorators, { kind: "method", name: "update", static: false, private: false, access: { has: obj => "update" in obj, get: obj => obj.update }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _requestComplete_decorators, { kind: "method", name: "requestComplete", static: false, private: false, access: { has: obj => "requestComplete" in obj, get: obj => obj.requestComplete }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _delete_decorators, { kind: "method", name: "delete", static: false, private: false, access: { has: obj => "delete" in obj, get: obj => obj.delete }, metadata: _metadata }, null, _instanceExtraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static inject = ['storageDomain', 'workspaceRegistry'];
        /**
         * Opened once, at construction. Every Remote awaits this before touching
         * storage, so a domain that fails to open fails every call with one cause
         * rather than each call opening its own view of the medium.
         */
        ready = __runInitializers(this, _instanceExtraInitializers);
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
        writeBacks = new Map();
        /**
         * @param ctx - Host services owning the storage hub and the workspace registry.
         */
        constructor(ctx) {
            super(ctx, 'workbench');
            this.ready = ctx.storageDomain.open(workbenchDomain);
            // The domain outlives every call that reads it, so an unobserved open that
            // later rejects would surface as an unhandled rejection instead of as a
            // failed Remote. Callers still see the failure through `ready` below.
            this.ready.catch(() => { });
            // The facility holds the name until the handle closes; a reload that rebuilds
            // this service would otherwise find the name still open and fail.
            ctx.effect(() => () => {
                void this.ready.then(domain => domain.close(), () => { });
            }, 'workbench: storage domain');
            // The tool registry is optional, and registered through `inject` rather than
            // `static inject` so a profile without it still gets the whole tab: the only
            // thing lost is a model's ability to write a completion back.
            ctx.inject(['tools'], scoped => { this.registerCompleteTool(scoped); });
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
        registerCompleteTool(ctx) {
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
                    const id = args.id.trim();
                    if (id === '')
                        throw new Error('workbench_complete requires a non-empty id');
                    // A write-back without an owning session has no turn to conclude, and a
                    // completion written outside a turn would be a record nobody asked for.
                    if (!exec.agent)
                        throw new Error('workbench_complete requires an owning agent session');
                    const input = {
                        summary: args.summary.trim(),
                        implementationPath: args.implementationPath,
                        changedFiles: args.changedFiles,
                        verification: args.verification,
                    };
                    const empty = completionInputError(input);
                    if (empty !== undefined)
                        throw new Error(empty);
                    const table = await this.table();
                    const observed = table.get(id);
                    if (observed === undefined) {
                        throw new Error(`unknown work item ${id}; use the id the request named`);
                    }
                    const plan = planCompletion(observed, input);
                    if (plan.kind === 'refuse')
                        throw new Error(plan.message);
                    const earlier = observed.completion;
                    // The request's version guard is consumed by this attempt whether it
                    // succeeds or not: one click arms exactly one write-back, and a later
                    // completion must be answered by a later click.
                    const expectedUpdateAt = this.writeBacks.get(id);
                    this.writeBacks.delete(id);
                    const result = await this.mutate({
                        id: observed.id,
                        workspaceId: observed.workspaceId,
                        ...(expectedUpdateAt === undefined ? {} : { expectedUpdateAt }),
                    }, current => ({ ...current, status: 'done', completion: completionFromInput(input) }));
                    if (result.code === 'conflict') {
                        throw new Error(`work item ${id} was edited after this write-back was requested, so the completion was not recorded; the edit stands and the item is still open for another request`);
                    }
                    if (result.code === 'not_found') {
                        throw new Error(`work item ${id} was deleted before the completion could be recorded`);
                    }
                    if (result.code === 'invalid')
                        throw new Error(result.message);
                    // The fast path: the write-back is what the turn was queued for, so the
                    // turn ends here instead of waiting for the model to find something else
                    // to say (DESIGN.md §11.5).
                    exec.concludeTurn();
                    return {
                        id,
                        written: true,
                        replaced: plan.replaced,
                        ...(earlier === undefined ? {} : { replacedAt: earlier.completedAt, replacedSummary: earlier.summary }),
                    };
                },
            }));
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
        armWriteBack(id, updateAt) {
            this.writeBacks.set(id, updateAt);
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
        async probe() {
            const domain = await this.ready;
            return { domain: domain.name, itemCount: domain.table('items').size };
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
        async search(request) {
            const table = await this.table();
            const words = queryWords(request.query ?? '');
            const wanted = request.status === undefined ? undefined : new Set(request.status);
            const hits = [];
            // Default `exclude`: archived items are the record of a deleted workspace
            // (DESIGN.md §4.7), and leaving them out by default is what keeps them out
            // of the daily view.
            const archived = request.archived ?? 'exclude';
            /*
             * Tier sizes are counted in the same pass but before any filter is applied,
             * so they describe the workspace rather than the current page: "未完成 4"
             * keeps saying 4 while a search narrows the list to one. Archiving is what
             * separates the three daily tiers from the fourth, so it is tested first.
             */
            let activeCount = 0;
            let doneCount = 0;
            let archivedCount = 0;
            for (const [, record] of table.entries()) {
                if (request.workspaceId !== undefined && record.workspaceId !== request.workspaceId)
                    continue;
                if (record.archived)
                    archivedCount++;
                else if (record.status === 'done')
                    doneCount++;
                else
                    activeCount++;
                if (archived === 'exclude' && record.archived)
                    continue;
                if (archived === 'only' && !record.archived)
                    continue;
                if (wanted !== undefined && !wanted.has(record.status))
                    continue;
                if (request.tag !== undefined && record.tag !== request.tag)
                    continue;
                const score = scoreItem(request.query ?? '', record);
                // An empty query is "no filter", not "match nothing"; both score
                // SCORE_MISS, so the word list is what separates them (see fuzzy.ts).
                if (words.length > 0 && score === 0)
                    continue;
                hits.push({ item: record, score });
            }
            // Score descending, then most-recently-updated first. Written as an explicit
            // second key rather than relying on the pre-sort order, so the result does
            // not depend on the snapshot's iteration order.
            hits.sort((left, right) => {
                if (left.score !== right.score)
                    return right.score - left.score;
                if (left.item.updateAt === right.item.updateAt)
                    return 0;
                return left.item.updateAt < right.item.updateAt ? 1 : -1;
            });
            const offset = Math.max(0, request.offset ?? 0);
            const limit = Math.min(MAX_LIMIT, Math.max(1, request.limit ?? DEFAULT_LIMIT));
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
            };
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
        async create(request) {
            const workspacePath = this.resolveWorkspace(request.workspaceId);
            if (workspacePath === undefined) {
                return { code: 'invalid', message: `unknown workspace '${request.workspaceId}'` };
            }
            const title = request.title.trim();
            if (title === '')
                return { code: 'invalid', message: 'title must not be blank' };
            const now = nowInstant();
            const record = {
                id: crypto.randomUUID(),
                workspaceId: request.workspaceId,
                workspacePath,
                title,
                desc: request.desc ?? '',
                tag: request.tag ?? '',
                status: 'open',
                archived: false,
                updateAt: now,
                createdAt: now,
            };
            const table = await this.table();
            await table.put(record.id, record);
            return { code: 'ok', item: record };
        }
        /**
         * Replace or append one work item's description.
         * @param request - target item, new text, and optional mode and version.
         * @returns the stored record, `conflict` against a stale version, or `invalid`.
         * @throws when the domain could not be opened.
         */
        async setDesc(request) {
            const invalid = this.rejectUnknownWorkspace(request.workspaceId);
            if (invalid !== undefined)
                return invalid;
            return this.mutate(request, current => ({
                ...current,
                desc: request.mode === 'append' && current.desc !== ''
                    ? `${current.desc}${APPEND_SEPARATOR}${request.desc}`
                    : request.desc,
            }));
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
        async update(request) {
            const invalid = this.rejectUnknownWorkspace(request.workspaceId);
            if (invalid !== undefined)
                return invalid;
            const title = request.title?.trim();
            if (title === '')
                return { code: 'invalid', message: 'title must not be blank' };
            if (title === undefined && request.tag === undefined) {
                return { code: 'invalid', message: 'update requires title or tag' };
            }
            return this.mutate(request, current => ({
                ...current,
                ...title === undefined ? {} : { title },
                ...request.tag === undefined ? {} : { tag: request.tag },
            }));
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
        async requestComplete(request) {
            const invalid = this.rejectUnknownWorkspace(request.workspaceId);
            if (invalid !== undefined)
                return invalid;
            const table = await this.table();
            const key = request.id;
            const observed = table.get(key);
            // Ownership is part of identity here exactly as it is in `mutate`: an id that
            // belongs to another workspace is reported absent, not forbidden.
            if (observed === undefined || observed.workspaceId !== request.workspaceId) {
                return { code: 'not_found', id: request.id };
            }
            const plan = planRequestComplete(observed.status);
            if (plan.kind === 'refuse')
                return { code: 'invalid', message: plan.message };
            // The retry edge writes nothing at all — no record, no `updateAt`, no version
            // check — so it can neither conflict nor forge recency. It still re-arms the
            // write-back, because the user is asking for a summary of the item as it
            // stands right now, and that version is the one the completion must match.
            if (plan.kind === 'retry') {
                this.armWriteBack(request.id, observed.updateAt);
                return { code: 'ok', item: observed };
            }
            const result = await this.mutate(request, current => {
                // Re-decided at the queue slot, and deliberately not reused from above: this
                // is the only read that is atomic with the write, so it is the one that
                // decides whether the edge still writes (see `WorkbenchEdgeLost`).
                const atSlot = planRequestComplete(current.status);
                if (atSlot.kind !== 'advance')
                    throw new WorkbenchEdgeLost(atSlot, current);
                return { ...current, status: 'in_progress' };
            });
            // Armed only for a write that happened: on a conflict the client's version was
            // stale, so there is no version a later completion could honestly match.
            if (result.code === 'ok')
                this.armWriteBack(request.id, result.item.updateAt);
            return result;
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
        async delete(request) {
            const table = await this.table();
            const current = table.get(request.id);
            // The ownership test also covers an unknown workspace: no stored record can
            // name a workspace the registry does not know, so this returns not_found
            // without a separate registry lookup.
            if (current === undefined || current.workspaceId !== request.workspaceId) {
                return { code: 'not_found', id: request.id };
            }
            await table.delete(request.id);
            // A pending write-back for a deleted item can never be answered, so its
            // version guard is dropped with the item.
            this.writeBacks.delete(request.id);
            return { code: 'ok', id: request.id };
        }
        /**
         * The open domain's item table.
         * @returns the table handle.
         * @throws when the domain could not be opened.
         */
        async table() {
            const domain = await this.ready;
            return domain.table('items');
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
        resolveWorkspace(workspaceId) {
            return this.ctx.workspaceRegistry.get(WorkspaceId(workspaceId))?.path;
        }
        /**
         * Turn an unresolvable workspace into the `invalid` branch, if it is one.
         * @param workspaceId - raw id from the request.
         * @returns the `invalid` value, or `undefined` when the workspace is known.
         */
        rejectUnknownWorkspace(workspaceId) {
            if (this.resolveWorkspace(workspaceId) !== undefined)
                return undefined;
            return { code: 'invalid', message: `unknown workspace '${workspaceId}'` };
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
        async mutate(request, transform) {
            const table = await this.table();
            const key = request.id;
            const current = table.get(key);
            // Ownership is part of identity: an id belonging to another workspace is
            // reported as absent rather than as a permission failure, so the reply
            // never confirms that some other workspace holds that id.
            if (current === undefined || current.workspaceId !== request.workspaceId) {
                return { code: 'not_found', id: request.id };
            }
            const expected = request.expectedUpdateAt;
            if (expected !== undefined && current.updateAt !== expected) {
                return { code: 'conflict', current };
            }
            const now = nowInstant();
            try {
                const next = await table.update(key, record => {
                    if (expected !== undefined && record.updateAt !== expected)
                        throw new WorkbenchConflict(record);
                    return { ...transform(record), updateAt: now };
                });
                return { code: 'ok', item: next };
            }
            catch (error) {
                if (error instanceof WorkbenchConflict)
                    return { code: 'conflict', current: error.current };
                // A `requestComplete` transform may abort its own write: a retry that lost
                // its slot reports the record as it stands, a refusal that lost it reports
                // the refusal (see `WorkbenchEdgeLost`).
                if (error instanceof WorkbenchEdgeLost) {
                    return error.plan.kind === 'refuse'
                        ? { code: 'invalid', message: error.plan.message }
                        : { code: 'ok', item: error.current };
                }
                // The only other expected rejection is the record disappearing between
                // the read above and its queue slot. Confirmed by reading, so nothing here
                // depends on the storage layer's error shape.
                if (table.get(key) === undefined)
                    return { code: 'not_found', id: request.id };
                throw error;
            }
        }
    };
})();
export { WorkbenchService };
/**
 * The canonical instant spelling the domain schema accepts — four-digit year,
 * UTC, millisecond precision.
 * @returns the current instant.
 */
function nowInstant() {
    return new Date().toISOString();
}
export default WorkbenchService;
//# sourceMappingURL=index.js.map