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
import type { Context } from '@deepseek-ai/cordis'
import type { RemoteResult, TypertRemoteContribution } from '@deepseek-ai/dsh-typert-protocol'
// Type-only: pulls the Client Remote mount surface (ctx.remote).
import type {} from '@deepseek-ai/dsh-api-remotes/client'
// Type-only: the Remote namespace this module mounts.
import type {} from 'dsh-plugin-workbench/remote'
// Type-only: pulls the locale plugin's Context merge (ctx.locale).
import type {} from '@deepseek-ai/dsh-client-locale/client'
// Type-only: pulls the right Sidebar's Context merges and SlotMap entries.
import type {} from '@deepseek-ai/dsh-client-ui-sidebar-right/client'
// Type-only: pulls the renderer that turns a slot registration into a component.
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
// Type-only: pulls the Workspace Controller's Context merge (ctx.workspaces).
import type {} from '@deepseek-ai/dsh-api-workspace-controller/client'
// Type-only: merges `sessionId` into every session-scoped slot's standard props.
import type {} from '@deepseek-ai/dsh-client-ui-session/client'
import { WorkbenchTab, WorkbenchTabTitle } from './WorkbenchTab.tsx'
import type { WorkbenchInjected } from './WorkbenchTab.tsx'
import { WorkbenchMenuItem } from './WorkbenchMenu.tsx'
import { WORKBENCH_KIND, WORKBENCH_MENU_ID, WORKBENCH_TAB_ID, workbenchTabDefinition } from './definition.ts'
import { guardWorkbenchTab } from './guard.ts'
import type { WorkbenchTabSidebar } from './guard.ts'
import { WorkbenchStore } from './store.ts'
import type { WorkbenchGateway } from './store.ts'
import { en, NS, zh } from './locales.ts'
import { bindWorkspaceSource } from './workspace-source.ts'
import { CLIENT_DEPS } from './deps.ts'
// The two halves of the write-back flow (§11.3) live in this half rather than
// beside the Host's write-back rules because the two halves share types, not
// values — see the module's own note. `queueWriteBack` owns the session queue
// lookup as well as the text, so both are driven by `tests/write-back.spec.ts`
// without React, a DOM, or the Remote.
import { queueWriteBack } from './write-back.ts'
import type { WriteBackSessions } from './write-back.ts'

export type { WorkbenchInjected, WorkbenchTabProps, WorkbenchTabTitleProps } from './WorkbenchTab.tsx'
export type { WorkbenchMenuItemProps } from './WorkbenchMenu.tsx'
export type { WorkbenchLocaleKey } from './locales.ts'
export type { WorkbenchFilterTier, WorkbenchGateway, WorkbenchSnapshot } from './store.ts'
export type { WorkbenchTabRuling, WorkbenchTabScreen, WorkbenchTabSidebar } from './guard.ts'
export { WorkbenchStore, filterToRequest, toMarkdown } from './store.ts'
export { WORKBENCH_KIND, WORKBENCH_MENU_ID, WORKBENCH_TAB_ID, workbenchTabDefinition } from './definition.ts'
export { guardWorkbenchTab, ruleWorkbenchTab } from './guard.ts'

/**
 * Services required before the tab can be registered.
 *
 * The list lives in `deps.ts` so that this declaration and the scoped
 * `ctx.inject` below read from one place, and so a spec can assert the real list
 * rather than the mount's text (§9.23).
 */
export const inject: string[] = [...CLIENT_DEPS]

/**
 * Unwrap a Remote result, rethrowing a carrier failure.
 *
 * The business arms of a `WorkbenchWriteValue` are NOT failures: `conflict`,
 * `not_found`, and `invalid` arrive inside a successful result and are returned
 * to the caller, which is what lets a conflict be shown rather than thrown past
 * the user.
 * @param result - the Remote's result envelope.
 * @returns the value, when the call reached the Host.
 */
function unwrap<T>(result: RemoteResult<T>): T {
  if (!result.ok) throw result.error
  return result.value
}

/**
 * The guardian's face of `ctx.sidebarRight`.
 *
 * The controller's members are prototype methods that read `this`, and the
 * guardian holds them for the plugin's lifetime — the same hazard
 * `workspace-source.ts` documents for `ctx.workspaces.list`, so the same
 * treatment.
 *
 * The session id is resolved here and never leaves: every read asks the
 * controller which session is on screen and answers about that one. That keeps
 * the controller's branded `SessionId` on this side of the boundary — `string`
 * is not assignable to it — and leaves the guardian holding no id of its own.
 * @param ctx - Client runtime owning the right Sidebar.
 * @returns the face the guardian reads.
 */
function sidebarFace(ctx: Context): WorkbenchTabSidebar {
  const sidebar = ctx.sidebarRight
  return {
    onScreen: () => {
      const sessionId = sidebar.mounted.getSnapshot()
      if (sessionId === undefined) return undefined
      return {
        expanded: sidebar.isExpanded(),
        kinds: sidebar.tabsIn(sessionId).map(tab => tab.kind),
      }
    },
    openOnScreen: kind => {
      const sessionId = sidebar.mounted.getSnapshot()
      if (sessionId !== undefined) sidebar.openTabIn(sessionId, kind)
    },
    tabs: { subscribe: listener => sidebar.openTabs.subscribe(listener) },
    mounted: { subscribe: listener => sidebar.mounted.subscribe(listener) },
  }
}

/** Contribute the workbench tab type, its body, chip title, and menu entries. */
function registerUi(ctx: Context): void {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'workbench: dictionaries')

  const t = ctx.locale.bind(NS)
  ctx.effect(() => ctx.sidebarRightTabs.register(workbenchTabDefinition(t)), 'workbench: tab type')

  // Registered after the type, because the guardian's first reconcile can
  // already open the tab and `openTabIn` throws for an unregistered kind.
  ctx.effect(
    () => guardWorkbenchTab(
      sidebarFace(ctx),
      WORKBENCH_KIND,
      message => ctx.logger.error(`workbench: ${message}`),
    ),
    'workbench: tab guardian',
  )

  const gateway: WorkbenchGateway = {
    search: async request => unwrap(await ctx.remote.workbench.search(request)),
    create: async request => unwrap(await ctx.remote.workbench.create(request)),
    setDesc: async request => unwrap(await ctx.remote.workbench.setDesc(request)),
    update: async request => unwrap(await ctx.remote.workbench.update(request)),
    requestComplete: async request => unwrap(await ctx.remote.workbench.requestComplete(request)),
    delete: async request => unwrap(await ctx.remote.workbench.delete(request)),
  }

  // One store per session: the pane's seats are session-scoped, so two sessions
  // can hold a workbench pane at once and each must own its workspace selection,
  // query, and list. The map is the mount's, not a module's, so a reload leaves
  // nothing behind.
  const stores = new Map<string, WorkbenchStore>()
  // Bound at the boundary: the controller's `getSnapshot`/`subscribe` are
  // prototype methods that read `this`, while React calls a
  // `useSyncExternalStore` pair with no receiver. See `workspace-source.ts`.
  const workspaces = bindWorkspaceSource(ctx.workspaces.list)

  const injected = (): WorkbenchInjected => ({
    storeFor: (sessionId: string) => {
      const existing = stores.get(sessionId)
      if (existing !== undefined) return existing
      const created = new WorkbenchStore(gateway)
      stores.set(sessionId, created)
      return created
    },
    workspaces,
    // The second half of the write-back (§11.3): queue an ordinary user turn
    // asking the model for the summary. It goes through the session's own queue
    // rather than a side channel, so it is logged like anything else the user
    // types, and the model sees exactly the text built here.
    //
    // The service is read through `ctx.get`, not `ctx.sessions`: the package that
    // declares that property is not a dependency, so a structural type is all
    // this side has — and the read goes through a thunk, because a cordis
    // context *throws* on an undeclared service rather than answering
    // `undefined`, and a throw inside a click handler used to leave the control
    // pending forever (§9.23). The glue guards the read.
    requestWriteBack: async (sessionId, item) =>
      queueWriteBack(() => ctx.get('sessions') as WriteBackSessions | undefined, sessionId, item),
    reportCopyFailure: (message: string) => {
      ctx.logger.error(`workbench: clipboard write failed: ${message}`)
    },
  })

  ctx.effect(
    () => () => {
      for (const store of stores.values()) store.dispose()
      stores.clear()
    },
    'workbench: session stores',
  )

  ctx.slots.inject('sidebar.right.pane.tab', () => ctx.slots.register({
    name: 'sidebar.right.pane.tab', key: WORKBENCH_TAB_ID, locale: NS,
    inject: injected,
  }, WorkbenchTab))

  ctx.slots.inject('sidebar.right.pane.tab.title', () => ctx.slots.register({
    name: 'sidebar.right.pane.tab.title', key: WORKBENCH_TAB_ID, locale: NS,
    inject: injected,
  }, WorkbenchTabTitle))

  // A `list` seat: entries carry a stable id and there is no dispatch key, so this
  // registers once and the component declines by tab kind. Its inject face is
  // built per session — the signature is `(sessionId, actions) => object` — which
  // is what lets one registration serve every session's menu.
  ctx.slots.inject('sidebar.right.tab.menu.item', () => ctx.slots.register({
    name: 'sidebar.right.tab.menu.item', id: WORKBENCH_MENU_ID, locale: NS,
    inject: injected,
  }, WorkbenchMenuItem))
}

/**
 * Mount the Remote contribution unless another plugin already supplies the
 * namespace, then register the workbench tab.
 * @param ctx - Client runtime owning the Remote, dictionaries, and slots.
 * @param contribution - generated `workbench` Remote definitions.
 * @returns disposer joining the UI teardown and the Remote withdrawal.
 */
export async function mountWorkbench(
  ctx: Context,
  contribution: TypertRemoteContribution,
): Promise<() => Promise<void>> {
  // Non-strict `ctx.get`: a composition may have no provider yet, and the
  // generated contribution below supplies the namespace.
  const providedElsewhere = ctx.get('remote.workbench') !== undefined
  const disposeRemote = providedElsewhere ? undefined : await ctx.remote.$mount(contribution)
  const ui = ctx.inject(
    [...CLIENT_DEPS, 'remote.workbench'],
    registerUi,
  )
  try {
    await ui
  } catch (error) {
    await ui.dispose()
    await disposeRemote?.()
    throw error
  }
  return async () => {
    await ui.dispose()
    await disposeRemote?.()
  }
}
