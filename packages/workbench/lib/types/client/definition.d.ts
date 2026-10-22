/**
 * The workbench tab type: what a workbench tab IS.
 *
 * This is stage one of registration and is purely static — which addresses the
 * type recognizes, how it ranks, and what its chip says. Everything a body
 * needs at runtime arrives in its props (stage two, `mount.ts`).
 */
import type { SidebarRightTabDefinition } from '@deepseek-ai/dsh-client-ui-sidebar-right/client';
import type { TranslateNS } from '@deepseek-ai/dsh-client-locale/client';
import { NS } from './locales.ts';
/** Registration identity, and the key the body and title register under. */
export declare const WORKBENCH_TAB_ID = "dsh-plugin-workbench/workbench";
/** Type discriminator: what a workbench tab is, and what `openTab` names. */
export declare const WORKBENCH_KIND = "workbench";
/**
 * Registration identity for the tab-menu seat.
 *
 * The seat is a `list`, so its entries need a stable id to be identified and
 * ordered. One registration renders both of this plugin's entries, so one id
 * covers them.
 */
export declare const WORKBENCH_MENU_ID = "dsh-plugin-workbench/menu";
/**
 * Build the tab type definition.
 *
 * `multiple: false` gives one workbench page per pane: the list is a view onto
 * a workspace, and a second copy of it in the same pane is never what anyone
 * wanted. `keepMounted` preserves scroll position and filter choice across tab
 * switches, which a work list is expected to do.
 *
 * No `guide` entries, deliberately. Two things follow from offering none: the
 * workbench stops being advertised as a capsule on 开始, and the guide resumes
 * being that page's seeded default — the seed is the sole registered entry, or
 * the guide when there are none — so opening the sidebar lands on 开始 and
 * `guard.ts` then puts the workbench beside it. Adding an entry back would
 * undo both.
 * @param t - This plugin's translator.
 * @returns the definition to register.
 */
export declare function workbenchTabDefinition(t: TranslateNS<typeof NS>): SidebarRightTabDefinition;
//# sourceMappingURL=definition.d.ts.map