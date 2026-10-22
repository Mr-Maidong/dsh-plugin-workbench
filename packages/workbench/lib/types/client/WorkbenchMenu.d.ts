/**
 * The workbench tab's actions menu.
 *
 * Two extra items at the end of a tab's menu. The seat is a `list` slot with no
 * dispatch key, so every entry is rendered for every tab and decides its own
 * visibility from the record it is handed — hence the kind check, which is also
 * why this plugin never has to be told how many other tabs exist.
 */
import type { ReactNode } from 'react';
import type { InjectFace, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots';
import type { WorkbenchInjected } from './WorkbenchTab.tsx';
/** Props the menu slot delivers: the tab whose menu is open, plus the session. */
export type WorkbenchMenuItemProps = PropsRuntime<'sidebar.right.tab.menu.item'> & InjectFace<WorkbenchInjected> & PropsLocale<'workbench'>;
/** Render the workbench entries, or nothing when another tab's menu is open. */
export declare function WorkbenchMenuItem(props: WorkbenchMenuItemProps): ReactNode;
//# sourceMappingURL=WorkbenchMenu.d.ts.map