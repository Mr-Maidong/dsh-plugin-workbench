/**
 * The Host's change notifier: one bus, one `watch` stream per connected pane
 * (DESIGN.md §9.36).
 *
 * WHY A STREAM AND NOT AN EVENT
 * -----------------------------
 * `API_REMOTE_FORWARDED_EVENTS` is a closed allowlist owned by the Harness, so a
 * plugin cannot add a Cordis event to it and have the browser hear it. A Remote
 * *stream* is the other direction that exists: the plugin owns the method, the
 * Client opens it, and the Host yields whenever it has something to say. Every
 * other live surface in the Harness (`session/control`, the job and terminal
 * controllers) is built the same way, which is the strongest argument that this
 * is the supported shape rather than a trick.
 *
 * WHAT A NOTICE IS WORTH
 * ----------------------
 * The pane does not need the changed record — it needs to know its list is
 * stale. So the bus carries one small value per write and nothing else; the
 * pane answers it with the `search` it already knows how to run. That keeps one
 * authority for the list (§13.2) and makes a notice's worst case a redundant
 * query, never a wrong row.
 *
 * The queue is bounded and coalescing: a burst of writes to one workspace
 * collapses to the newest notice for it, because the thousandth item in a burst
 * says the same thing as the first — "re-read". A slow or detached watcher
 * therefore cannot grow this into a leak.
 *
 * @module dsh-plugin-workbench/changes
 */
import type { WorkbenchChange } from './types.ts';
/** The Host half's change bus. */
export declare class WorkbenchChanges {
    /**
     * Host-wide write sequence. It is bumped per notice rather than per item, so a
     * watcher can order two notices without knowing what either one changed.
     */
    private revision;
    /** Every open watcher's sink. A Set, so a watcher that closes mid-publish is safe. */
    private readonly sinks;
    /**
     * How many watchers are parked on this bus.
     *
     * Exposed for diagnostics and specs: a closed pane that fails to unregister
     * would keep a parked generator alive for the life of the Host, and that leak
     * has no other visible symptom.
     * @returns the number of open `watch` streams.
     */
    get watcherCount(): number;
    /**
     * Announce one write.
     *
     * Called after the write has landed, never before: a notice the storage layer
     * then refused would send every pane after a list that does not exist.
     * @param workspaceId - workspace whose items changed; `''` is ignored, since no
     *   record can name it (§4.1) and no pane can be showing it.
     * @param at - the instant the write was applied; defaults to now.
     */
    publish(workspaceId: string, at?: string): void;
    /**
     * Open one watcher.
     *
     * It subscribes *here*, not on the first `next()`: an async generator body
     * does not run until it is first pulled, and the Host opens a stream by
     * calling the method and iterating the result later — a write landing in
     * between would have been lost. Subscribing in the constructor closes that
     * window, and means a watcher that has not been read yet still cannot miss a
     * notice.
     * @param signal - cancellation owned by the Remote stream carrier.
     * @returns one notice per coalesced write, until the signal aborts.
     */
    watch(signal: AbortSignal): AsyncIterable<WorkbenchChange>;
}
//# sourceMappingURL=changes.d.ts.map