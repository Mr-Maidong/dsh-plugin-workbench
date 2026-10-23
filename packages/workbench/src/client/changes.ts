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
// The package specifier, not `../types.ts`: the browser project's `paths` maps
// it to the declaration the host build emits, and a relative import would drag
// `src/types.ts` into this program and collide with that same output (§9.36).
import type { WorkbenchChange } from 'dsh-plugin-workbench/types'

/** How many times in a row a dead stream is reopened before the follower stops. */
const MAX_ATTEMPTS = 8

/** First backoff step; doubles per failed attempt up to {@link MAX_BACKOFF_MS}. */
const FIRST_BACKOFF_MS = 250

/** Ceiling on the retry delay, so a long outage does not stretch waits forever. */
const MAX_BACKOFF_MS = 4000

/** One thing worth re-reading when its workspace changes. */
export interface ChangeTarget {
  /** Workspace the target is currently showing; `''` when it shows none. */
  readonly workspaceId: string
  /** Re-read the list. Implementations keep the current list on screen. */
  refresh(): void
}

/** What the follower needs from its owner. */
export interface FollowOptions {
  /**
   * Open one stream generation.
   *
   * Called again after a failure, so it must be cheap and side-effect free — it
   * is `() => ctx.remote.workbench.watch()`, not a handle captured once.
   */
  open(): AsyncIterable<WorkbenchChange>
  /** The panes to re-read; read fresh on each use, because panes come and go. */
  targets(): Iterable<ChangeTarget>
  /** Plugin lifetime; aborting it ends the follower for good. */
  signal: AbortSignal
  /** Called with each carrier failure, for the log. Never throws out of here. */
  onError?(error: unknown): void
  /** Injected by tests; production uses a real timer. */
  wait?(ms: number, signal: AbortSignal): Promise<void>
}

/** How the follower stopped. */
export type FollowOutcome = 'aborted' | 'gave-up' | 'ended'

/** The delay before attempt number `attempt` (1-based). */
function backoff(attempt: number): number {
  return Math.min(MAX_BACKOFF_MS, FIRST_BACKOFF_MS * 2 ** (attempt - 1))
}

/**
 * Sleep, but wake immediately on abort.
 *
 * A plain `setTimeout` promise would hold the follower open for up to
 * {@link MAX_BACKOFF_MS} after the plugin was disposed, and the abort listener it
 * leaked would keep the old copy of this function alive with it.
 * @param ms - how long to wait.
 * @param signal - plugin lifetime.
 */
function wait(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise<void>(resolve => {
    const timer = setTimeout(done, ms)
    function done(): void {
      clearTimeout(timer)
      signal.removeEventListener('abort', done)
      resolve()
    }
    signal.addEventListener('abort', done, { once: true })
  })
}

/**
 * Re-read the panes a notice names, and keep doing so until the plugin is gone.
 * @param options - the stream opener, the panes, and the lifetime signal.
 * @returns why the loop ended; never rejects.
 */
export async function followChanges(options: FollowOptions): Promise<FollowOutcome> {
  const { signal } = options
  const sleep = options.wait ?? wait
  // The first open is not a reconnect: every pane that exists is loading or
  // already loaded *after* this point, so re-reading on it would only duplicate
  // the load `setWorkspace` just started.
  let reconnect = false
  let attempt = 0

  while (!signal.aborted) {
    if (reconnect) for (const target of options.targets()) target.refresh()
    reconnect = true
    try {
      for await (const change of options.open()) {
        if (signal.aborted) return 'aborted'
        // A delivered notice is proof the carrier works, so the retry budget is
        // about consecutive failures, not lifetime failures.
        attempt = 0
        for (const target of options.targets()) {
          if (target.workspaceId !== '' && target.workspaceId === change.workspaceId) target.refresh()
        }
      }
      // The Host ended the stream without the plugin aborting: it was reloaded.
      // Treat that as a failure to reconnect rather than a clean finish, because
      // "no more notices ever" is not a state this pane can honor.
    } catch (error) {
      if (signal.aborted) return 'aborted'
      options.onError?.(error)
    }
    if (signal.aborted) return 'aborted'
    attempt += 1
    if (attempt > MAX_ATTEMPTS) return 'gave-up'
    await sleep(backoff(attempt), signal)
  }
  return 'aborted'
}
