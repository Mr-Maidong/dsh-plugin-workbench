/**
 * Workbench tab, browser half: mounts the generated `workbench` Remote and
 * contributes the right-Sidebar tab that consumes it.
 *
 * The Host state arrives through the generated Remote, which is the projection
 * of this package's Host service. Nothing else in the profile mounts it, so the
 * plugin owns both phases of the mount and withdraws both on disposal.
 */
import type { Context } from '@deepseek-ai/cordis';
export { inject } from './mount.ts';
export { WORKBENCH_KIND, WORKBENCH_TAB_ID, workbenchTabDefinition, } from './definition.ts';
export { guardWorkbenchTab, ruleWorkbenchTab } from './guard.ts';
export { en, NS, zh } from './locales.ts';
export type { WorkbenchLocaleKey } from './locales.ts';
export type { WorkbenchTabRuling, WorkbenchTabScreen, WorkbenchTabSidebar, } from './guard.ts';
export type { WorkbenchInjected, WorkbenchTabProps, WorkbenchTabTitleProps, } from './WorkbenchTab.tsx';
/**
 * Mount the Remote face, then the workbench tab, as one plugin lifecycle.
 * @param ctx - Client runtime owning the Remote, dictionaries, and slots.
 * @returns disposer joined over the Remote withdrawal and the UI teardown.
 */
export declare function apply(ctx: Context): Promise<() => Promise<void>>;
//# sourceMappingURL=index.d.ts.map