/** Notices one watcher may have queued before the oldest are dropped. */
const QUEUE_LIMIT = 64;
/** The Host half's change bus. */
export class WorkbenchChanges {
    /**
     * Host-wide write sequence. It is bumped per notice rather than per item, so a
     * watcher can order two notices without knowing what either one changed.
     */
    revision = 0;
    /** Every open watcher's sink. A Set, so a watcher that closes mid-publish is safe. */
    sinks = new Set();
    /**
     * How many watchers are parked on this bus.
     *
     * Exposed for diagnostics and specs: a closed pane that fails to unregister
     * would keep a parked generator alive for the life of the Host, and that leak
     * has no other visible symptom.
     * @returns the number of open `watch` streams.
     */
    get watcherCount() {
        return this.sinks.size;
    }
    /**
     * Announce one write.
     *
     * Called after the write has landed, never before: a notice the storage layer
     * then refused would send every pane after a list that does not exist.
     * @param workspaceId - workspace whose items changed; `''` is ignored, since no
     *   record can name it (§4.1) and no pane can be showing it.
     * @param at - the instant the write was applied; defaults to now.
     */
    publish(workspaceId, at = new Date().toISOString()) {
        if (workspaceId === '')
            return;
        const change = { workspaceId, revision: ++this.revision, at };
        // Copy before iterating: a sink may close its own watcher while being woken.
        for (const sink of [...this.sinks]) {
            // One wedged pane must not fail the write that is being announced, so a
            // throwing sink is dropped rather than propagated into the caller's stack.
            try {
                sink(change);
            }
            catch {
                this.sinks.delete(sink);
            }
        }
    }
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
    watch(signal) {
        return new WorkbenchWatcher(this.sinks, signal);
    }
}
/** One watcher's queue and its parked reader. */
class WorkbenchWatcher {
    sinks;
    signal;
    queue = [];
    /** This watcher's slot in the bus, kept so `close` can remove exactly it. */
    sink;
    /** The parked `next()` call, if a reader is waiting. */
    wake;
    closed = false;
    /**
     * @param sinks - the bus's watcher set, which this watcher joins immediately.
     * @param signal - carrier cancellation; an already-aborted signal never joins.
     */
    constructor(sinks, signal) {
        this.sinks = sinks;
        this.signal = signal;
        this.sink = (change) => { this.push(change); };
        if (signal.aborted) {
            this.closed = true;
            return;
        }
        sinks.add(this.sink);
        signal.addEventListener('abort', this.onAbort, { once: true });
    }
    /** Carrier aborted the stream. */
    onAbort = () => { this.close(); };
    /** @returns this watcher, which is its own iterator. */
    [Symbol.asyncIterator]() {
        return this;
    }
    /** @returns the next queued notice, waiting for one if the queue is empty. */
    async next() {
        for (;;) {
            const queued = this.queue.shift();
            if (queued !== undefined)
                return { done: false, value: queued };
            if (this.closed)
                return { done: true, value: undefined };
            await new Promise((resolve) => { this.wake = resolve; });
            this.wake = undefined;
        }
    }
    /** Leave early: `for await … break`, or the Host closing the stream. */
    async return() {
        this.close();
        return { done: true, value: undefined };
    }
    /** Queue one notice, coalescing per workspace and dropping the oldest at the cap. */
    push(change) {
        if (this.closed)
            return;
        const stale = this.queue.findIndex(queued => queued.workspaceId === change.workspaceId);
        if (stale >= 0)
            this.queue.splice(stale, 1);
        else if (this.queue.length >= QUEUE_LIMIT)
            this.queue.shift();
        this.queue.push(change);
        this.wake?.();
    }
    /** Unsubscribe and release a parked reader. Idempotent. */
    close() {
        if (this.closed)
            return;
        this.closed = true;
        // Removing the listener matters even though it was added `once`: a stream
        // closed by `return()` never fires abort, and a listener left on a live
        // signal would pin this watcher — and its queue — for the signal's lifetime.
        this.signal.removeEventListener('abort', this.onAbort);
        this.sinks.delete(this.sink);
        this.wake?.();
    }
}
//# sourceMappingURL=changes.js.map