/**
 * The workbench tab's actions menu.
 *
 * Two extra items at the end of a tab's menu. The seat is a `list` slot with no
 * dispatch key, so every entry is rendered for every tab and decides its own
 * visibility from the record it is handed — hence the kind check, which is also
 * why this plugin never has to be told how many other tabs exist.
 */
import type { ReactNode } from 'react'
import type { InjectFace, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type {} from '@deepseek-ai/dsh-client-ui-sidebar-right/client'
import type {} from '@deepseek-ai/dsh-client-ui-session/client'
import { WORKBENCH_KIND } from './definition.ts'
import { toMarkdown } from './store.ts'
import type { WorkbenchInjected } from './WorkbenchTab.tsx'
import css from './WorkbenchMenu.module.css'

/** Props the menu slot delivers: the tab whose menu is open, plus the session. */
export type WorkbenchMenuItemProps =
  PropsRuntime<'sidebar.right.tab.menu.item'> & InjectFace<WorkbenchInjected> & PropsLocale<'workbench'>

/**
 * Read `kind` off a tab record.
 *
 * Probed rather than accessed because `TabRecord` comes from the docking kit,
 * whose types this plugin does not depend on; the field is read defensively so a
 * foreign menu entry can never make this one throw.
 * @param tab - the record from the slot owner props.
 * @returns the tab's kind, or undefined when it has none.
 */
function kindOf(tab: unknown): string | undefined {
  if (typeof tab !== 'object' || tab === null) return undefined
  const value = (tab as { readonly kind?: unknown }).kind
  return typeof value === 'string' ? value : undefined
}

/** Render the workbench entries, or nothing when another tab's menu is open. */
export function WorkbenchMenuItem(props: WorkbenchMenuItemProps): ReactNode {
  const { t, reportCopyFailure } = props
  if (kindOf(props.tab) !== WORKBENCH_KIND) return null
  // Resolved here rather than at click time: this seat's inject face is built per
  // session, so the store exists as soon as the entry is for a workbench tab.
  const store = props.storeFor(props.sessionId)

  return (
    <>
      <button
        type="button"
        className={css.item}
        onClick={() => {
          props.dismiss()
          void store.refresh()
        }}
      >
        {t('action.refresh')}
      </button>
      <button
        type="button"
        className={css.item}
        onClick={() => {
          props.dismiss()
          const markdown = toMarkdown(store.getSnapshot().items)
          if (markdown === '') return
          void navigator.clipboard.writeText(markdown).catch((error: unknown) => {
            reportCopyFailure(error instanceof Error ? error.message : String(error))
          })
        }}
      >
        {t('action.copy')}
      </button>
    </>
  )
}
