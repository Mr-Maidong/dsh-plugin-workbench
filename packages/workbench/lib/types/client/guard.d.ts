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
/** One reconcile's view of the on-screen session's sidebar. */
export interface WorkbenchTabScreen {
    /** Whether the column is showing its panel. */
    readonly expanded: boolean;
    /** Kinds of every tab the session holds, in any pane, docked or floating. */
    readonly kinds: readonly string[];
}
/** Whether a reconcile opens the tab. */
export type WorkbenchTabRuling = {
    readonly open: true;
} | {
    readonly open: false;
};
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
export declare function ruleWorkbenchTab(screen: WorkbenchTabScreen | undefined, kind: string): WorkbenchTabRuling;
/**
 * The `ctx.sidebarRight` members this module reads.
 *
 * Narrower than the controller on purpose, and phrased as "the on-screen
 * session" rather than as a session id: the guardian's whole subject is the
 * sidebar the user is looking at, and the caller resolves which session that is.
 * That keeps the controller's branded id type, and the ownership question of
 * holding one across a commit, on the caller's side of the boundary — the same
 * split that lets a test drive this module with an object it owns.
 *
 * The change signals are `subscribe`-only: what a reconcile reads, it reads
 * fresh through `onScreen`, so there is no snapshot for the guardian to keep and
 * no id for it to hold after the session it named has gone.
 */
export interface WorkbenchTabSidebar {
    /**
     * Read the on-screen session's sidebar now.
     * @returns the screen, or `undefined` when no surface is mounted.
     */
    onScreen(): WorkbenchTabScreen | undefined;
    /**
     * Open a page kind in the on-screen session.
     * @param kind - the page kind to open.
     */
    openOnScreen(kind: string): void;
    /** Every session's committed page set; only its change signal is read. */
    readonly tabs: {
        /** @param listener - synchronous invalidation callback. @returns unsubscribe. */
        subscribe(listener: () => void): () => void;
    };
    /** The session on screen; only its change signal is read. */
    readonly mounted: {
        /** @param listener - synchronous invalidation callback. @returns unsubscribe. */
        subscribe(listener: () => void): () => void;
    };
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
export declare function guardWorkbenchTab(sidebar: WorkbenchTabSidebar, kind: string, report: (message: string) => void): () => void;
//# sourceMappingURL=guard.d.ts.map