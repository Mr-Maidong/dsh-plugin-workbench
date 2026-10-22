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
import type { WorkItemId, WorkItemRecord, WorkbenchArchiveRequest, WorkbenchCreateRequest, WorkbenchDeleteRequest, WorkbenchDeleteValue, WorkbenchRequestCompleteRequest, WorkbenchSearchCounts, WorkbenchSearchRequest, WorkbenchSearchValue, WorkbenchSetDescRequest, WorkbenchUpdateRequest, WorkbenchWriteValue } from 'dsh-plugin-workbench/types';
/** The four filter tiers of DESIGN.md §5.4. Orthogonal to `status`, not a status. */
export type WorkbenchFilterTier = 'all' | 'active' | 'done' | 'archived';
/** Immutable view of one workspace's work items. */
export interface WorkbenchSnapshot {
    /** The workspace this snapshot describes; `''` before one is chosen. */
    readonly workspaceId: string;
    readonly query: string;
    readonly filter: WorkbenchFilterTier;
    readonly phase: 'idle' | 'loading' | 'ready' | 'error';
    readonly items: readonly WorkItemRecord[];
    /** Hits before paging, which may exceed `items.length`. */
    readonly total: number;
    /**
     * Sizes of the four filter tiers, which the filter row prints beside each
     * label. Independent of `query` and `filter`, so a tier keeps reporting the
     * workspace's real total while a search narrows the list.
     */
    readonly counts: WorkbenchSearchCounts;
    /**
     * Transport or Host failure of the last load, or `null`.
     *
     * `null` rather than an optional field, matching DSH's own `WorkspaceSnapshot`.
     * Business outcomes are NOT errors and never land here: a `conflict` is a
     * successful call whose value says so, and it is returned to the caller that
     * provoked it.
     */
    readonly error: {
        readonly code: string;
        readonly message: string;
    } | null;
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
    search(request: WorkbenchSearchRequest): Promise<WorkbenchSearchValue>;
    create(request: WorkbenchCreateRequest): Promise<WorkbenchWriteValue>;
    setDesc(request: WorkbenchSetDescRequest): Promise<WorkbenchWriteValue>;
    update(request: WorkbenchUpdateRequest): Promise<WorkbenchWriteValue>;
    archive(request: WorkbenchArchiveRequest): Promise<WorkbenchWriteValue>;
    requestComplete(request: WorkbenchRequestCompleteRequest): Promise<WorkbenchWriteValue>;
    delete(request: WorkbenchDeleteRequest): Promise<WorkbenchDeleteValue>;
}
/** Translate a filter tier into the Host's filter fields. */
export declare function filterToRequest(filter: WorkbenchFilterTier): Pick<WorkbenchSearchRequest, 'status' | 'archived'>;
/**
 * Snapshot store for the workbench pane.
 *
 * One snapshot per workspace, kept in a map, so returning to a workspace shows
 * the list it had rather than an empty one while the query is in flight
 * (DESIGN.md §5.5).
 */
export declare class WorkbenchStore {
    private readonly gateway;
    private readonly cache;
    private readonly listeners;
    private activeId;
    private queryTimer;
    /**
     * Bumped on every load; a response whose generation is stale is dropped.
     *
     * Without this, switching workspace quickly can let a slow answer for the
     * previous workspace overwrite the new one — the classic out-of-order load.
     */
    private generation;
    /** @param gateway - the Remote calls this store drives. */
    constructor(gateway: WorkbenchGateway);
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
    getSnapshot: () => WorkbenchSnapshot;
    /** @param listener - called on any change to the active snapshot. @returns unsubscribe. */
    subscribe: (listener: () => void) => (() => void);
    /** The workspace every call is currently scoped to. */
    get workspaceId(): string;
    /** Stop the pending query timer. */
    dispose(): void;
    /**
     * Point the pane at a workspace, loading it when its snapshot is not ready.
     * @param workspaceId - workspace to show; `''` clears the pane.
     */
    setWorkspace(workspaceId: string): void;
    /**
     * Set the query text and schedule a reload.
     * @param query - raw search text.
     */
    setQuery(query: string): void;
    /**
     * Switch filter tier and reload at once: a click is deliberate, unlike a
     * keystroke, so it should not wait.
     * @param filter - tier to show.
     */
    setFilter(filter: WorkbenchFilterTier): void;
    /** Reload the active workspace, keeping the current list on screen meanwhile. */
    refresh(): Promise<void>;
    /**
     * Create an item in the active workspace and show it without a re-query.
     * @param title - non-blank title; the Host trims and rejects a blank one.
     * @param desc - initial description.
     * @param tag - initial tag.
     * @returns the Host's result union, for the caller to report.
     */
    create(title: string, desc: string, tag: string): Promise<WorkbenchWriteValue>;
    /**
     * Replace an item's description.
     * @param item - the item being edited; its `updateAt` is the compare-and-swap token.
     * @param desc - new description.
     * @returns the Host's result union.
     */
    setDesc(item: WorkItemRecord, desc: string): Promise<WorkbenchWriteValue>;
    /**
     * Replace an item's title and/or tag.
     * @param item - the item being edited; its `updateAt` is the compare-and-swap token.
     * @param next - the fields to change.
     * @returns the Host's result union.
     */
    update(item: WorkItemRecord, next: {
        readonly title?: string;
        readonly tag?: string;
    }): Promise<WorkbenchWriteValue>;
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
    requestComplete(item: WorkItemRecord): Promise<WorkbenchWriteValue>;
    /**
     * File an item away, or bring it back (DESIGN.md §4.7, §9.31).
     *
     * The one write that can move a record between tiers, so it is not merged the
     * way a field edit is: an archived item leaves 全部/未完成/已完成 and turns up
     * under 已归档, and the totals have to move with it — or the filter row would go
     * on advertising the sizes it had before the click. The item is dropped from
     * the list outright when the active filter stops matching it.
     * @param item - the item whose archived state changes.
     * @param archived - `true` to file it away, `false` to bring it back.
     * @returns the Host's result union.
     */
    setArchived(item: WorkItemRecord, archived: boolean): Promise<WorkbenchWriteValue>;
    /**
     * Delete an item for good. Archiving is a different thing (DESIGN.md §4.7).
     * @param id - item to remove.
     * @returns the Host's result union.
     */
    remove(id: WorkItemId): Promise<WorkbenchDeleteValue>;
    /**
     * Apply a write result to the snapshot.
     *
     * With no query in force the returned record is merged directly. With one, the
     * write may have changed whether the item still matches, and only the Host can
     * say, so a refresh runs instead.
     * @param result - the write's result union.
     */
    private settle;
    /** Merge a created or changed record into the active list, in place. */
    private admit;
    /**
     * Install the Host's version of a record after a conflict.
     *
     * The user's edit lost, but the pane must not keep showing the stale copy it
     * was editing — otherwise the next attempt fails the same way. The Host
     * returns the winning record precisely so this can happen.
     * @param item - the record the Host reports as current.
     */
    adoptConflict(item: WorkItemRecord): void;
    /** Read the active workspace from the Host. */
    private load;
    /** Merge a partial change into the active snapshot and notify. */
    private patch;
    /** Wake every subscriber. */
    private publish;
}
/** Turn a thrown value into the shape the error banner renders. */
export declare function describe(error: unknown): {
    readonly code: string;
    readonly message: string;
};
/**
 * Render items as a Markdown checklist, for the tab menu's copy action.
 * @param items - records to render, in the order shown.
 * @returns a Markdown document, one bullet per item.
 */
export declare function toMarkdown(items: readonly WorkItemRecord[]): string;
//# sourceMappingURL=store.d.ts.map