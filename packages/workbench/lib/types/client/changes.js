/** How many times in a row a dead stream is reopened before the follower stops. */
const MAX_ATTEMPTS = 8;
/** First backoff step; doubles per failed attempt up to {@link MAX_BACKOFF_MS}. */
const FIRST_BACKOFF_MS = 250;
/** Ceiling on the retry delay, so a long outage does not stretch waits forever. */
const MAX_BACKOFF_MS = 4000;
/** The delay before attempt number `attempt` (1-based). */
function backoff(attempt) {
    return Math.min(MAX_BACKOFF_MS, FIRST_BACKOFF_MS * 2 ** (attempt - 1));
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
function wait(ms, signal) {
    return new Promise(resolve => {
        const timer = setTimeout(done, ms);
        function done() {
            clearTimeout(timer);
            signal.removeEventListener('abort', done);
            resolve();
        }
        signal.addEventListener('abort', done, { once: true });
    });
}
/**
 * Re-read the panes a notice names, and keep doing so until the plugin is gone.
 * @param options - the stream opener, the panes, and the lifetime signal.
 * @returns why the loop ended; never rejects.
 */
export async function followChanges(options) {
    const { signal } = options;
    const sleep = options.wait ?? wait;
    // The first open is not a reconnect: every pane that exists is loading or
    // already loaded *after* this point, so re-reading on it would only duplicate
    // the load `setWorkspace` just started.
    let reconnect = false;
    let attempt = 0;
    while (!signal.aborted) {
        if (reconnect)
            for (const target of options.targets())
                target.refresh();
        reconnect = true;
        try {
            for await (const change of options.open()) {
                if (signal.aborted)
                    return 'aborted';
                // A delivered notice is proof the carrier works, so the retry budget is
                // about consecutive failures, not lifetime failures.
                attempt = 0;
                for (const target of options.targets()) {
                    if (target.workspaceId !== '' && target.workspaceId === change.workspaceId)
                        target.refresh();
                }
            }
            // The Host ended the stream without the plugin aborting: it was reloaded.
            // Treat that as a failure to reconnect rather than a clean finish, because
            // "no more notices ever" is not a state this pane can honor.
        }
        catch (error) {
            if (signal.aborted)
                return 'aborted';
            options.onError?.(error);
        }
        if (signal.aborted)
            return 'aborted';
        attempt += 1;
        if (attempt > MAX_ATTEMPTS)
            return 'gave-up';
        await sleep(backoff(attempt), signal);
    }
    return 'aborted';
}
//# sourceMappingURL=changes.js.map