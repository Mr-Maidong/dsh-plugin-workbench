/**
 * The Client services this plugin declares before it reads them.
 *
 * Cordis resolves `ctx.<name>` only for a service the plugin declared: an
 * undeclared read throws `cannot get property "<name>" without inject` from the
 * context proxy, at whatever moment the read happens — for a click handler that
 * was an unhandled rejection with the control left looking dead (§9.23).
 * Declaring them here holds activation until they exist, makes the reads legal,
 * and gives the specs real data to assert instead of a grep through the mount.
 *
 * One list, two consumers: the module's own `inject` export, which the Client
 * loader reads, and the scoped `ctx.inject` that registers the UI. They used to
 * be two literal arrays that had to be kept in sync by hand.
 *
 * `remote.workbench` is deliberately absent — this plugin provides it.
 * `workspaces` is present because the pane's workspace picker is not optional:
 * without a workspace there is nothing to list, and the Client always ships the
 * controller. `sidebarRight` is the tab guardian's dependency; `sidebarRightTabs`
 * alone would let the type register with no controller to hold it open in.
 * `sessions` is the write-back's turn queue (§11.3).
 *
 * No runtime imports, so a spec can load this file directly.
 */
export const CLIENT_DEPS = [
    'remote',
    'slots',
    'locale',
    'sidebarRight',
    'sidebarRightTabs',
    'workspaces',
    'sessions',
];
//# sourceMappingURL=deps.js.map