/**
 * Mount lifecycle for the work-item Remote and the workbench tab that reads it.
 *
 * The two phases are ordered because the tab's inject face calls
 * `ctx.remote.workbench`, which does not exist before the mount. A failure in
 * the second phase withdraws the first, so a failed apply leaves no
 * half-mounted service behind.
 *
 * A composition may already provide the namespace — another plugin could mount
 * a `workbench` Remote too — and the Gateway rejects a second contribution for
 * one namespace. An already-provided `remote.workbench` is therefore reused: the
 * plugin adds only the tab and withdraws only that.
 */
import type { Context } from '@deepseek-ai/cordis';
import type { TypertRemoteContribution } from '@deepseek-ai/dsh-typert-protocol';
export type { WorkbenchInjected, WorkbenchTabProps, WorkbenchTabTitleProps } from './WorkbenchTab.tsx';
export type { WorkbenchMenuItemProps } from './WorkbenchMenu.tsx';
export type { WorkbenchLocaleKey } from './locales.ts';
export type { WorkbenchFilterTier, WorkbenchGateway, WorkbenchSnapshot } from './store.ts';
export type { WorkbenchTabRuling, WorkbenchTabScreen, WorkbenchTabSidebar } from './guard.ts';
export { WorkbenchStore, filterToRequest, toMarkdown } from './store.ts';
export { WORKBENCH_KIND, WORKBENCH_MENU_ID, WORKBENCH_TAB_ID, workbenchTabDefinition } from './definition.ts';
export { guardWorkbenchTab, ruleWorkbenchTab } from './guard.ts';
/**
 * Services required before the tab can be registered.
 *
 * The list lives in `deps.ts` so that this declaration and the scoped
 * `ctx.inject` below read from one place, and so a spec can assert the real list
 * rather than the mount's text (§9.23).
 */
export declare const inject: string[];
/**
 * Mount the Remote contribution unless another plugin already supplies the
 * namespace, then register the workbench tab.
 * @param ctx - Client runtime owning the Remote, dictionaries, and slots.
 * @param contribution - generated `workbench` Remote definitions.
 * @returns disposer joining the UI teardown and the Remote withdrawal.
 */
export declare function mountWorkbench(ctx: Context, contribution: TypertRemoteContribution): Promise<() => Promise<void>>;
//# sourceMappingURL=mount.d.ts.map