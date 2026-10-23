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
import type { WorkbenchChange } from './types.ts'

/** Notices one watcher may have queued before the oldest are dropped. */
const QUEUE_LIMIT = 64

/** One watcher's sink, as the bus holds it. */
type Sink = (change: WorkbenchChange) => void

/** The Host half's change bus. */
export class WorkbenchChanges {
  /**
   * Host-wide write sequence. It is bumped per notice rather than per item, so a
   * watcher can order two notices without knowing what either one changed.
   */
  private revision = 0

  /** Every open watcher's sink. A Set, so a watcher that closes mid-publish is safe. */
  private readonly sinks = new Set<Sink>()

  /**
   * How many watchers are parked on this bus.
   *
   * Exposed for diagnostics and specs: a closed pane that fails to unregister
   * would keep a parked generator alive for the life of the Host, and that leak
   * has no other visible symptom.
   * @returns the number of open `watch` streams.
   */
  get watcherCount(): number {
    return this.sinks.size
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
  publish(workspaceId: string, at: string = new Date().toISOString()): void {
    if (workspaceId === '') return
    const change: WorkbenchChange = { workspaceId, revision: ++this.revision, at }
    // Copy before iterating: a sink may close its own watcher while being woken.
    for (const sink of [...this.sinks]) {
      // One wedged pane must not fail the write that is being announced, so a
      // throwing sink is dropped rather than propagated into the caller's stack.
      try {
        sink(change)
      } catch {
        this.sinks.delete(sink)
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
  watch(signal: AbortSignal): AsyncIterable<WorkbenchChange> {
    return new WorkbenchWatcher(this.sinks, signal)
  }
}

/** One watcher's queue and its parked reader. */
class WorkbenchWatcher implements AsyncIterable<WorkbenchChange>, AsyncIterator<WorkbenchChange> {
  private readonly queue: WorkbenchChange[] = []

  /** This watcher's slot in the bus, kept so `close` can remove exactly it. */
  private readonly sink: Sink

  /** The parked `next()` call, if a reader is waiting. */
  private wake: (() => void) | undefined

  private closed = false

  /**
   * @param sinks - the bus's watcher set, which this watcher joins immediately.
   * @param signal - carrier cancellation; an already-aborted signal never joins.
   */
  constructor(private readonly sinks: Set<Sink>, private readonly signal: AbortSignal) {
    this.sink = (change) => { this.push(change) }
    if (signal.aborted) {
      this.closed = true
      return
    }
    sinks.add(this.sink)
    signal.addEventListener('abort', this.onAbort, { once: true })
  }

  /** Carrier aborted the stream. */
  private readonly onAbort = (): void => { this.close() }

  /** @returns this watcher, which is its own iterator. */
  [Symbol.asyncIterator](): AsyncIterator<WorkbenchChange> {
    return this
  }

  /** @returns the next queued notice, waiting for one if the queue is empty. */
  async next(): Promise<IteratorResult<WorkbenchChange>> {
    for (;;) {
      const queued = this.queue.shift()
      if (queued !== undefined) return { done: false, value: queued }
      if (this.closed) return { done: true, value: undefined }
      await new Promise<void>((resolve) => { this.wake = resolve })
      this.wake = undefined
    }
  }

  /** Leave early: `for await … break`, or the Host closing the stream. */
  async return(): Promise<IteratorResult<WorkbenchChange>> {
    this.close()
    return { done: true, value: undefined }
  }

  /** Queue one notice, coalescing per workspace and dropping the oldest at the cap. */
  private push(change: WorkbenchChange): void {
    if (this.closed) return
    const stale = this.queue.findIndex(queued => queued.workspaceId === change.workspaceId)
    if (stale >= 0) this.queue.splice(stale, 1)
    else if (this.queue.length >= QUEUE_LIMIT) this.queue.shift()
    this.queue.push(change)
    this.wake?.()
  }

  /** Unsubscribe and release a parked reader. Idempotent. */
  private close(): void {
    if (this.closed) return
    this.closed = true
    // Removing the listener matters even though it was added `once`: a stream
    // closed by `return()` never fires abort, and a listener left on a live
    // signal would pin this watcher — and its queue — for the signal's lifetime.
    this.signal.removeEventListener('abort', this.onAbort)
    this.sinks.delete(this.sink)
    this.wake?.()
  }
}
