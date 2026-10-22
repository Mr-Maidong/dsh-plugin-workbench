/**
 * Hold the workbench tab open beside the guide, in every sidebar the user opens.
 *
 * WHY THIS EXISTS. A session's right Sidebar seeds exactly one page the first
 * time its column expands — the sole registered guide entry, or the guide
 * itself when nothing registered one — and the platform protects exactly one
 * tab from closing: `canCloseTab` refuses only a missing tab and the guide
 * standing as the sole docked tab. A tab type has no `closable`, `pinned`, or
 * `locked` field, and `registerCloseHandler` is a notification (it returns
 * `void`), not a veto. From a plugin, then, "this tab cannot be closed" has no
 * declarative form: the store honours the close, and this module undoes it.
 *
 * WHAT IT DOES. It subscribes to the two change signals that move when a
 * sidebar's page set moves — the tab inventory, which every session's commit
 * publishes, and the on-screen session — and opens the tab whenever the ruling
 * below says it belongs there. Opening for the first time and re-opening after
 * a close are one operation, so "the tab is there by default" and "the tab
 * comes back" are one mechanism rather than two.
 *
 * WHY IT IS NOT INTRUSIVE. Three conditions gate every reconcile:
 *
 * - No on-screen session, or a collapsed column: there is nothing to open into.
 *   Since opening a tab expands the column, this is what keeps a sidebar the
 *   user has not opened closed — and it is also what makes the tab arrive by
 *   default rather than immediately: the first expansion seeds the guide, that
 *   commit publishes, and this reconcile puts the workbench beside it.
 * - An empty pane: the seed and this open would race for the same root pane,
 *   and the workbench winning that race would cost the session its guide page
 *   for good.
 * - The kind already present: `openTabIn` is idempotent for a page kind, but
 *   re-opening on an unrelated commit would re-focus the tab and undo the
 *   user's choice of what to look at.
 *
 * Everything here is plain data and callbacks, so the ruling is unit-tested
 * without a runtime: see `tests/tab-guardian.spec.ts`.
 */
/**
 * Decide whether this reconcile has to open a workbench tab.
 *
 * The order of the checks is the order of their consequences: a collapsed
 * column is the "never open the sidebar for the user" rule, an empty pane is
 * the "never rob the seed" rule, and a present kind is the "never fight the
 * user over what to look at" rule.
 * @param screen - the on-screen session's sidebar, or `undefined` when no surface is mounted.
 * @param kind - the workbench tab's kind.
 * @returns an `open: false` ruling that means "leave the sidebar exactly as it is".
 */
export function ruleWorkbenchTab(screen, kind) {
    if (screen === undefined || !screen.expanded)
        return { open: false };
    if (screen.kinds.length === 0 || screen.kinds.includes(kind))
        return { open: false };
    return { open: true };
}
/**
 * Keep the workbench tab open.
 *
 * Scheduling is deferred by one microtask because a subscription fires inside
 * the commit that moved the layout, and committing again from there would nest
 * one store write in another. The microtask lands after that commit and before
 * the frame paints, so the user sees the tab in place of the gap rather than
 * after it. A second invalidation arriving before the microtask runs is
 * coalesced into it, and the open converges rather than looping because the
 * commit it causes reports the kind as present.
 * @param sidebar - the controller face, already bound to its receiver.
 * @param kind - the workbench tab's kind.
 * @param report - sink for a failed open, so one bad reconcile cannot break the app.
 * @returns disposer stopping both subscriptions.
 */
export function guardWorkbenchTab(sidebar, kind, report) {
    let stopped = false;
    let scheduled = false;
    const reconcile = () => {
        if (stopped || scheduled)
            return;
        scheduled = true;
        queueMicrotask(() => {
            scheduled = false;
            if (stopped)
                return;
            if (!ruleWorkbenchTab(sidebar.onScreen(), kind).open)
                return;
            try {
                sidebar.openOnScreen(kind);
            }
            catch (error) {
                report(`tab guardian could not open ${kind}: ${String(error)}`);
            }
        });
    };
    // The inventory carries the seed, the close, and every other page-set change;
    // the mounted session carries the switch that re-adopts an already seeded one.
    const stopTabs = sidebar.tabs.subscribe(reconcile);
    const stopMounted = sidebar.mounted.subscribe(reconcile);
    // A sidebar that was already open before this plugin loaded has no change left
    // to observe, so the first reconcile is explicit.
    reconcile();
    return () => {
        stopped = true;
        stopTabs();
        stopMounted();
    };
}
//# sourceMappingURL=guard.js.map