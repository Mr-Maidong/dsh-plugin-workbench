/**
 * The Client's half of the change stream (§9.36): one connection, every pane.
 *
 * The Host streams a notice per write; this file turns a notice into "re-read
 * the list you are showing". The pane itself is not involved, which is the
 * point: the write may have been made by the *model* (`workbench_create`,
 * `workbench_complete`), by another session's pane, or by this very pane, and
 * the first two have no local call for the UI to react to.
 *
 * WHY A RE-READ AND NOT A PATCH
 * -----------------------------
 * A notice names a workspace and nothing else. Merging would need the record,
 * and merging a record into a list ordered by score, filtered by a tier, and
 * paged at 50 is a second implementation of `search` that would eventually
 * disagree with the first about where the row belongs. A re-read is one query
 * against the authority, and it competes with a keystroke's query through the
 * store's generation counter (§9.24) rather than racing it.
 *
 * WHY IT RETRIES
 * --------------
 * The stream dies with the connection (a Host restart, a laptop waking up). A
 * follower that gave up would leave the pane frozen with no visible difference
 * from "nothing changed", which is the worst failure this feature can have — so
 * a dropped stream is reopened with a bounded backoff, and a *successful*
 * reconnect re-reads every open pane, because notices written during the gap
 * are gone.
 *
 * @module dsh-plugin-workbench/client/changes
 */
import type { WorkbenchChange } from 'dsh-plugin-workbench/types';
/** One thing worth re-reading when its workspace changes. */
export interface ChangeTarget {
    /** Workspace the target is currently showing; `''` when it shows none. */
    readonly workspaceId: string;
    /** Re-read the list. Implementations keep the current list on screen. */
    refresh(): void;
}
/** What the follower needs from its owner. */
export interface FollowOptions {
    /**
     * Open one stream generation.
     *
     * Called again after a failure, so it must be cheap and side-effect free — it
     * is `() => ctx.remote.workbench.watch()`, not a handle captured once.
     */
    open(): AsyncIterable<WorkbenchChange>;
    /** The panes to re-read; read fresh on each use, because panes come and go. */
    targets(): Iterable<ChangeTarget>;
    /** Plugin lifetime; aborting it ends the follower for good. */
    signal: AbortSignal;
    /** Called with each carrier failure, for the log. Never throws out of here. */
    onError?(error: unknown): void;
    /** Injected by tests; production uses a real timer. */
    wait?(ms: number, signal: AbortSignal): Promise<void>;
}
/** How the follower stopped. */
export type FollowOutcome = 'aborted' | 'gave-up' | 'ended';
/**
 * Re-read the panes a notice names, and keep doing so until the plugin is gone.
 * @param options - the stream opener, the panes, and the lifetime signal.
 * @returns why the loop ended; never rejects.
 */
export declare function followChanges(options: FollowOptions): Promise<FollowOutcome>;
//# sourceMappingURL=changes.d.ts.map