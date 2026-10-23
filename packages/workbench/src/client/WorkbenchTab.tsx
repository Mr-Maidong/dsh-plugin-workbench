/**
 * The workbench tab body.
 *
 * Everything is edited in place (DESIGN.md §5.4): a field's display state is
 * plain text and its edit state is that very box with a wash and a caret (§9.14),
 * so there are no save or revert buttons anywhere in this file. The three verbs
 * are Enter (commit this field), blur (commit too — clicking away is not a
 * cancel), and Escape (revert).
 * Only `desc` differs, because it is the one multi-line field: Enter inserts a
 * newline there instead of committing.
 *
 * Status is never interactive. It is derived — `done` is set by a write-back and
 * by nothing else — so rendering it as something clickable would offer an action
 * the Host does not have.
 */
import { useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import type { ReactNode } from 'react'
import type { InjectFace, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type {} from '@deepseek-ai/dsh-client-ui-sidebar-right/client'
// Type-only: merges `sessionId` into every session-scoped slot's standard props.
import type {} from '@deepseek-ai/dsh-client-ui-session/client'
import type { WorkItemRecord } from 'dsh-plugin-workbench/types'
import type { WorkbenchLocaleKey } from './locales.ts'
import { seedText } from './seed.ts'
import type { WorkbenchFilterTier, WorkbenchSnapshot, WorkbenchStore } from './store.ts'
import { workspaceOfSession } from './workspace-source.ts'
import type { WorkspaceListSource } from './workspace-source.ts'
import type { WriteBackQueued } from './write-back.ts'
import css from './WorkbenchTab.module.css'
import emptyArt from './assets/empty.webp'
import doneMark from './assets/mark-done.webp'
import todoMark from './assets/mark-todo.webp'

/** What the slot's inject face supplies to the body. */
export interface WorkbenchInjected {
  /**
   * The snapshot store for one session, created on first use.
   *
   * Per session, not per plugin: the seat is session-scoped, so two sessions can
   * hold this pane at once and each must own its workspace, query, and list.
   * Sharing one store would make them overwrite each other.
   * @param sessionId - the session this pane belongs to.
   * @returns that session's store.
   */
  readonly storeFor: (sessionId: string) => WorkbenchStore
  /** The Client's Workspace list, so the pane can follow the conversation's workspace. */
  readonly workspaces: WorkspaceListSource
  /**
   * Queue the user turn that asks the model to write this item's summary back.
   *
   * The second half of the write-back flow (§11.3), and the only place this pane
   * spends a model turn on purpose: the request is an ordinary user message, so
   * it is logged like anything else the user types. It is called only after the
   * Host accepted the request, so the item is already `in_progress` when the
   * model reads it. The result stays structural — the mount owns the session
   * binding and the queue, this pane owns the copy — and a session that is not
   * available is a state the user has to be told about rather than a silent
   * no-op.
   * @param sessionId - the session whose queue receives the prompt.
   * @param item - the item the user asked about.
   * @returns whether the turn was queued, and why not when it was not.
   */
  readonly requestWriteBack: (sessionId: string, item: WorkItemRecord) => Promise<WriteBackQueued>
  /** @param message - clipboard failure text, logged by the mount. */
  readonly reportCopyFailure: (message: string) => void
}

// Owned by the module that makes the call, so the result the pane renders and the
// result the queue reports cannot drift; re-exported because this file publishes
// the pane's prop face.
export type { WriteBackQueued } from './write-back.ts'

/** Props the slot delivers to the workbench body. */
export type WorkbenchTabProps = PropsRuntime<'sidebar.right.pane.tab'> & InjectFace<WorkbenchInjected> & PropsLocale<'workbench'>

/**
 * The composer's public action face, as delivered to every session-scope slot.
 *
 * Declared structurally on purpose. `@deepseek-ai/dsh-client-ui-conversation`
 * owns this interface (`client/contract/input.d.ts` → `InputActions`) and merges
 * it into that package's `SessionStandardProps`, so the live Client hands it to
 * this pane as a standard prop — but that package is not a dependency of this
 * plugin, so the property carries no static type here. The names and arities
 * below are copied from its published 0.2.0-rc.2 declaration.
 *
 * Every member is optional. A Client that stops sending the face, or sends a
 * narrower one, then degrades to "no fill button" instead of throwing.
 */
export interface ComposerInputActions {
  /** @returns a revision-guarded copy of the current editor selection. */
  readonly captureInsertion?: () => unknown
  /**
   * Insert text at a captured selection without replacing later edits.
   * @param text - plain text to insert in one undo step.
   * @param span - a selection captured by `captureInsertion`.
   * @returns false when the draft changed or the editor is locked.
   */
  readonly insertText?: (text: string, span: unknown) => boolean
  /** Replace the whole draft — the documented programmatic-write path. */
  readonly setDraft?: (text: string) => void
  /** Return the keyboard to the composer. */
  readonly focus?: () => void
}

/** Which field, if any, is being edited. */
type Editing =
  | { readonly kind: 'none' }
  | { readonly kind: 'create' }
  | { readonly kind: 'field'; readonly id: string; readonly field: 'title' | 'desc' | 'tag'; readonly draft: string }

/** One formatter for the module; constructing one per render is the slow path. */
const RELATIVE = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' })

/**
 * Compact "time since" for a card's right edge.
 *
 * The first minute is worded rather than counted: every action re-renders the
 * pane, so a card that recounted its seconds would appear to tick whenever the
 * user merely clicks around it. Below a minute the card therefore says the same
 * thing, and only then does the stamp start to move — a minute at a time.
 * @param iso - the record's `updateAt`.
 * @param justNow - the localized wording for "less than a minute ago".
 * @returns the age, or `''` when the stamp cannot be parsed.
 */
function relative(iso: string, justNow: string): string {
  const then = Date.parse(iso)
  if (Number.isNaN(then)) return ''
  const seconds = Math.round((then - Date.now()) / 1000)
  const magnitude = Math.abs(seconds)
  if (magnitude < 60) return justNow
  if (magnitude < 3600) return RELATIVE.format(Math.round(seconds / 60), 'minute')
  if (magnitude < 86_400) return RELATIVE.format(Math.round(seconds / 3600), 'hour')
  if (magnitude < 2_592_000) return RELATIVE.format(Math.round(seconds / 86_400), 'day')
  if (magnitude < 31_536_000) return RELATIVE.format(Math.round(seconds / 2_592_000), 'month')
  return RELATIVE.format(Math.round(seconds / 31_536_000), 'year')
}

/**
 * How long the pane watches for a queued write-back to be answered.
 *
 * A write-back is a queued user turn, so it lands whenever the model gets to it —
 * seconds later, or after a whole turn of other work. Nothing pushes the answer
 * into this pane, because it is written into the Host's record and no event
 * carries it (§9.19), so the pane re-reads on a slow timer instead: often enough
 * to feel immediate, rarely enough that a model working for a minute costs tens
 * of queries rather than thousands. The budget ends the watch, so a model that
 * never writes anything costs one minute of quiet re-reads and then hands the
 * control back to the user, who can simply ask again.
 */
const WRITE_BACK_INTERVAL_MS = 1500
const WRITE_BACK_TICKS = 40

/** Render the workbench pane. */
export function WorkbenchTab(props: WorkbenchTabProps) {
  const { workspaces, t, requestWriteBack: queueWriteBack } = props
  const tabInfo = props.useTabInfo()
  const store = props.storeFor(props.sessionId)

  const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot)
  const workspaceSnapshot = useSyncExternalStore(workspaces.subscribe, workspaces.getSnapshot)
  const workspaceItems = workspaceSnapshot.items

  const [editing, setEditing] = useState<Editing>({ kind: 'none' })
  const [expanded, setExpanded] = useState<readonly string[]>([])
  const [notice, setNotice] = useState<string | undefined>(undefined)

  /**
   * The item whose write-back request has been sent and has not settled yet.
   *
   * One at a time, deliberately: §11.4 forbids initiating a second write-back
   * while one is pending, so the pane holds an id rather than a set of them. It
   * exists for two reasons — the control says so while the model works, and the
   * settle effect below knows which item to re-read.
   */
  const [writeBack, setWriteBack] = useState<string | undefined>(undefined)

  const visible = tabInfo.tab.visible
  // The workspace this pane follows: the one the conversation it belongs to sits
  // in, or `''` when it sits in none. Read afresh every render rather than
  // remembered, because moving the conversation into another workspace is the one
  // change that can happen under a pane that is already open.
  const followed = workspaceOfSession(workspaceItems, props.sessionId) ?? ''

  /**
   * Follow that workspace, and re-read it when the pane comes back into view.
   *
   * One effect rather than two: pointing the store at a workspace already starts
   * its load, so a separate refresh pass would fire a second request for the same
   * list on every first open. Here the follow and the re-read of Tier 2 (§6.2)
   * are mutually exclusive branches of a single pass.
   */
  useEffect(() => {
    if (!visible) return
    if (followed !== store.workspaceId) {
      // An open editor belonged to the workspace being left — §5.4 edits in place,
      // so it holds an id from the old list. The switcher closed it on the same
      // event, and following closes it the same way. Returning the current state
      // unchanged when there is nothing open keeps this from costing a render.
      setEditing(current => (current.kind === 'none' ? current : { kind: 'none' }))
      store.setWorkspace(followed)
      return
    }
    // Another session may have written while this kept-mounted body was hidden,
    // and it would otherwise show what it saw when it was last looked at.
    if (followed !== '') void store.refresh()
  }, [store, followed, visible])

  /**
   * Watch a queued write-back until its record says it is done.
   *
   * The effect depends on the id alone — deliberately not on the live snapshot.
   * An earlier version read the store's own snapshot as a dependency *and*
   * refreshed it from inside the same effect, so every store change re-armed the
   * effect, which refreshed again: a render loop that crashed the whole pane
   * (React #185). Reading the record inside the callback, and re-reading only on
   * the timer, keeps the effect running exactly twice per request: once when the
   * click arms it, once when it clears itself.
   *
   * Two readings end it: the record reaching `done` (the completion is in the
   * Host's record, which is why it is fetched rather than merged), or the record
   * leaving the current tier altogether, which is what a completed item does
   * under the active tier (§5.3).
   */
  useEffect(() => {
    if (writeBack === undefined) return
    const id = writeBack
    let ticks = 0
    let timer = 0
    let stopped = false
    const answer = (): void => {
      if (stopped) return
      const status = store.getSnapshot().items.find(entry => entry.id === id)?.status
      if (status === 'done' || status === undefined || ticks >= WRITE_BACK_TICKS) {
        stopped = true
        window.clearInterval(timer)
        setWriteBack(undefined)
      }
    }
    const tick = (): void => {
      ticks += 1
      void store.refresh().then(answer)
    }
    timer = window.setInterval(tick, WRITE_BACK_INTERVAL_MS)
    // The first reading is immediate: the fast path can already be finished by
    // the time the click returns, and waiting a full interval for that would look
    // like the button did nothing.
    tick()
    return () => {
      stopped = true
      window.clearInterval(timer)
    }
  }, [writeBack, store])

  const { active, done } = useMemo(() => {
    const open: WorkItemRecord[] = []
    const finished: WorkItemRecord[] = []
    for (const item of snapshot.items) (item.status === 'done' ? finished : open).push(item)
    return { active: open, done: finished }
  }, [snapshot.items])

  /*
   * The composer's action face. This seat is session-scoped, and the conversation
   * plugin merges its input actions into every session-scope slot's standard
   * props, so the Client passes it in beside `sessionId`. Read through a cast
   * because the declaring package is not a dependency of this plugin.
   */
  const inputActions = (props as unknown as { readonly inputActions?: ComposerInputActions }).inputActions

  /** A face that can write nothing would only produce a dead control. */
  const canFill = inputActions !== undefined
    && (inputActions.insertText !== undefined || inputActions.setDraft !== undefined)

  /**
   * Put one work item into the composer's draft — filling, never submitting.
   *
   * `insertText` is the non-destructive path: it lands at the caret, keeps
   * whatever the user already typed, and is one undo step. It is
   * revision-guarded and refuses when the draft moved under us or the editor is
   * locked, in which case `setDraft` keeps the click from being a silent no-op.
   * @param item - the work item to hand over.
   */
  const fillComposer = (item: WorkItemRecord): void => {
    const text = seedText(item)
    if (text === '' || inputActions === undefined) return
    const span = inputActions.captureInsertion?.()
    const inserted = span !== undefined && inputActions.insertText?.(text, span) === true
    if (!inserted) inputActions.setDraft?.(text)
    inputActions.focus?.()
  }

  /** Report a failed write and re-sync whatever the Host says is current. */
  const report = (result: { readonly code: string; readonly message?: string; readonly current?: WorkItemRecord }): void => {
    if (result.code === 'conflict') {
      if (result.current !== undefined) store.adoptConflict(result.current)
      setNotice(t('error.conflict'))
      return
    }
    if (result.code === 'not_found') {
      setNotice(t('error.notFound'))
      void store.refresh()
      return
    }
    if (result.code === 'invalid') setNotice(t('error.invalid', { message: result.message ?? '' }))
  }

  /** Commit one inline field, clearing the editor only when the Host accepted. */
  const commit = async (item: WorkItemRecord, field: 'title' | 'desc' | 'tag', draft: string): Promise<void> => {
    setNotice(undefined)
    const result = field === 'desc'
      ? await store.setDesc(item, draft)
      : await store.update(item, { [field]: draft })
    if (result.code === 'ok') { setEditing({ kind: 'none' }); return }
    report(result)
    setEditing({ kind: 'none' })
  }

  /**
   * Ask for this item's write-back: both halves of §11.3 in one action.
   *
   * The Host records the request first — the `open → in_progress` edge, or its
   * retry (DESIGN.md §4.5) — and only then is the user turn queued. A request the
   * Host refused must not reach the model, or the model would summarize an item
   * the user's own write never moved. The queued turn costs a real model turn,
   * which is why the pane holds `writeBack` until the session settles; a request
   * that never reached the queue is reported instead of leaving the control
   * looking dead, which is exactly how the missing half behaved before §9.19.
   * @param item - the record to push.
   */
  const requestWriteBack = async (item: WorkItemRecord): Promise<void> => {
    setNotice(undefined)
    // One write-back in flight at a time: a second request would ask the model
    // for the same summary twice, and §11.4 forbids exactly that.
    if (writeBack !== undefined) return
    setWriteBack(item.id)
    const result = await store.requestComplete(item)
    if (result.code !== 'ok') {
      setWriteBack(undefined)
      report(result)
      return
    }
    let queued: WriteBackQueued
    try {
      queued = await queueWriteBack(props.sessionId, item)
    } catch (cause) {
      // The injected face is expected to be total (§9.23), but before that fix a
      // throw here left the control pending forever with nothing but a console
      // stack — the one outcome §9.19 forbids. Report it like any refusal.
      queued = { ok: false, message: cause instanceof Error ? cause.message : String(cause) }
    }
    if (queued.ok) return
    setWriteBack(undefined)
    setNotice(queued.sessionMissing === true
      ? t('writeback.noSession')
      : t('writeback.failed', { message: queued.message ?? '' }))
  }

  const createItem = async (title: string): Promise<void> => {
    const trimmed = title.trim()
    if (trimmed === '') { setEditing({ kind: 'none' }); return }
    setNotice(undefined)
    const result = await store.create(trimmed, '', '')
    if (result.code !== 'ok') report(result)
    setEditing({ kind: 'none' })
  }

  const toggleExpanded = (id: string): void => {
    setExpanded(current => current.includes(id) ? current.filter(entry => entry !== id) : [...current, id])
  }

  /**
   * File one item away, or bring it back (§9.31).
   *
   * No confirmation, and no `window.confirm`: archiving destroys nothing and the
   * same control reverses it, which is precisely the property the delete button
   * it replaced did not have.
   * @param item - the record to archive or restore.
   */
  const archiveItem = async (item: WorkItemRecord): Promise<void> => {
    setNotice(undefined)
    const result = await store.setArchived(item, !item.archived)
    if (result.code !== 'ok') report(result)
  }

  if (workspaceItems.length === 0) {
    return (
      <div className={css.pane}>
        <div className={css.empty}>
          <p>{t('workspace.none')}</p>
          <p className={css.emptyHint}>{t('workspace.noneHint')}</p>
        </div>
      </div>
    )
  }

  // The conversation sits in no workspace, so there is no work list this pane could
  // legitimately show. Keyed on `followed` rather than on the store, so the message
  // does not depend on an effect having run first.
  if (followed === '') {
    return (
      <div className={css.pane}>
        <div className={css.empty}>
          <p>{t('workspace.unassigned')}</p>
          <p className={css.emptyHint}>{t('workspace.unassignedHint')}</p>
        </div>
      </div>
    )
  }

  const tiers: readonly WorkbenchFilterTier[] = ['all', 'active', 'done', 'archived']

  return (
    <div className={css.pane}>
      <div className={css.toolbar}>
        <div className={css.searchRow}>
          <label className={css.searchField}>
            <SearchGlyph />
            <input
              className={css.searchInput}
              type="search"
              value={snapshot.query}
              placeholder={t('search.placeholder')}
              onChange={event => { store.setQuery(event.target.value) }}
            />
          </label>
        </div>
        <div className={css.filterRow}>
          {tiers.map(tier => (
            <button
              key={tier}
              type="button"
              className={[
                css.chip,
                // §9.35: only the current filter is filled. The store keeps one
                // tier, so this can light at most one chip.
                tier === snapshot.filter && css.chipActive,
              ].filter(Boolean).join(' ')}
              aria-pressed={tier === snapshot.filter}
              onClick={() => {
                setEditing({ kind: 'none' })
                store.setFilter(tier)
              }}
            >
              {t(`filter.${tier}` as WorkbenchLocaleKey)}
              {/* Per-tier totals, as in the prototype. They describe the
                  workspace, not the current page, so a search that narrows the
                  list to one row still shows how much is in each tier. */}
              <span className={css.chipCount}>{snapshot.counts[tier]}</span>
            </button>
          ))}
          <span className={css.filterSpacer} />
          <button
            type="button"
            className={css.iconBtn}
            title={t('action.create')}
            aria-label={t('action.create')}
            onClick={() => { setEditing({ kind: 'create' }) }}
          >
            <PlusGlyph />
          </button>
        </div>
      </div>

      <div className={css.scroller}>
        {notice !== undefined && <p className={css.notice}>{notice}</p>}

        {snapshot.phase === 'loading' && (
          <div className={css.skeletonList}>
            <div className={css.skeleton} />
            <div className={css.skeleton} />
          </div>
        )}

        {snapshot.phase === 'error' && (
          <>
            <p className={`${css.status} ${css.statusError}`}>
              {t('state.error', { message: snapshot.error?.message ?? '' })}
            </p>
            <button type="button" className={css.retryBtn} onClick={() => { void store.refresh() }}>
              {t('state.retry')}
            </button>
          </>
        )}

        {snapshot.phase === 'ready' && (
          <>
            {editing.kind === 'create' && (
              <ul className={css.list}>
                <li className={`${css.card} ${css.cardComposing}`}>
                  <div className={css.cardHead}>
                    <span className={`${css.mark} ${css.markBusy}`}>
                      <span className={css.markDot} />
                    </span>
                    <div className={css.cardBody}>
                      <Composer
                        t={t}
                        onCommit={title => { void createItem(title) }}
                        onCancel={() => { setEditing({ kind: 'none' }) }}
                      />
                    </div>
                  </div>
                </li>
              </ul>
            )}

            {snapshot.items.length === 0 && editing.kind !== 'create' && (
              <div className={css.empty}>
                <img
                  className={css.emptyArt}
                  src={emptyArt}
                  alt=""
                  aria-hidden="true"
                  width={600}
                  height={499}
                  draggable={false}
                />
                {/* One line, not two: the illustration already says the list is
                    empty, so a headline above the hint only repeated it. */}
                <p>
                  {snapshot.query !== '' || snapshot.filter !== 'all'
                    ? t('empty.filtered')
                    : t('empty.hint')}
                </p>
              </div>
            )}

            {/* Grouping is a property of the 全部 tier only, and a heading is
                drawn only when there is a second group to tell it apart from:
                with nothing finished, "未完成 · 3" is a label the list below it
                already says. */}
            {snapshot.filter === 'all' && active.length > 0 && done.length > 0 && (
              <p className={css.groupLabel}>{t('group.active')} · {active.length}</p>
            )}
            <ul className={css.list}>
              {(snapshot.filter === 'all' ? active : snapshot.filter === 'done' ? done : snapshot.items).map(item => (
                <Card
                  key={item.id}
                  item={item}
                  t={t}
                  editing={editing}
                  open={expanded.includes(item.id)}
                  pending={writeBack === item.id}
                  onEdit={next => { setEditing(next); setNotice(undefined) }}
                  onCommit={(field, draft) => { void commit(item, field, draft) }}
                  onCancel={() => { setEditing({ kind: 'none' }) }}
                  onToggle={() => { toggleExpanded(item.id) }}
                  onArchive={() => { void archiveItem(item) }}
                  onRequestComplete={() => { void requestWriteBack(item) }}                  onFill={canFill ? () => { fillComposer(item) } : undefined}
                />
              ))}
            </ul>
            {/* §9.26: each group shows whenever its own tier has items. The
                headings stay paired — both drawn only when both groups exist,
                per §5.4's one-threshold rule — but a workspace whose work is all
                finished must still show its finished group. The old guard
                (`done && active`) is what left 全部 blank for it. */}
            {snapshot.filter === 'all' && done.length > 0 && (
              <>
                {active.length > 0 && (
                  <p className={css.groupLabel}>{t('group.done')} · {done.length}</p>
                )}
                <ul className={css.list}>
                  {done.map(item => (
                    <Card
                      key={item.id}
                      item={item}
                      t={t}
                      editing={editing}
                      open={expanded.includes(item.id)}
                      pending={writeBack === item.id}
                      onEdit={next => { setEditing(next); setNotice(undefined) }}
                      onCommit={(field, draft) => { void commit(item, field, draft) }}
                      onCancel={() => { setEditing({ kind: 'none' }) }}
                      onToggle={() => { toggleExpanded(item.id) }}
                      onArchive={() => { void archiveItem(item) }}
                      onRequestComplete={() => { void requestWriteBack(item) }}
                      onFill={canFill ? () => { fillComposer(item) } : undefined}
                    />
                  ))}
                </ul>
              </>
            )}

            {snapshot.total > snapshot.items.length && (
              <p className={css.status}>{t('list.more', { count: snapshot.total - snapshot.items.length })}</p>
            )}
          </>
        )}
      </div>
    </div>
  )
}

/**
 * The status artwork is an alpha mask: only its silhouette is used, and the ink
 * comes from the element's `color`, so the generated marks follow the theme's
 * idle ink and success green instead of carrying a fixed palette (§9.42).
 */
function glyphMask(src: string): { maskImage: string, WebkitMaskImage: string } {
  return { maskImage: `url("${src}")`, WebkitMaskImage: `url("${src}")` }
}

/** Props shared by every card, including the composer's. */
interface CardProps {
  readonly item: WorkItemRecord
  readonly t: (key: WorkbenchLocaleKey, params?: Record<string, string | number>) => string
  readonly editing: Editing
  readonly open: boolean
  /**
   * This card's write-back request is sent and has not settled yet (§9.19).
   *
   * Optional because `CardProps` is shared with the composer, which is not a
   * record and has no write-back to wait for.
   */
  readonly pending?: boolean
  readonly onEdit: (next: Editing) => void
  readonly onCommit: (field: 'title' | 'desc' | 'tag', draft: string) => void
  readonly onCancel: () => void
  readonly onToggle: () => void
  /**
   * File this item away, or bring it back (§9.31).
   *
   * Required, like the write-back: the pane always exposes the call, and the
   * card reads its own `archived` flag for which of the two verbs to draw.
   */
  readonly onArchive: () => void
  /**
   * Ask for a write-back on this item (DESIGN.md §4.5). Required, like delete: the
   * pane always exposes the call, and the card decides which of the states the
   * control is drawn in from `item.status` alone.
   */
  readonly onRequestComplete: () => void
  /**
   * Hand this item to the composer. Absent when the Client does not expose the
   * composer's action face to slots, in which case no button is rendered.
   */
  readonly onFill?: (() => void) | undefined
}

/** One work item. */
function Card({
  item, t, editing, open, pending = false, onEdit, onCommit, onCancel, onToggle, onArchive, onRequestComplete, onFill,
}: CardProps): ReactNode {
  const isEditing = (field: 'title' | 'desc' | 'tag'): boolean =>
    editing.kind === 'field' && editing.id === item.id && editing.field === field
  const draftOf = (field: 'title' | 'desc' | 'tag'): string =>
    editing.kind === 'field' && editing.id === item.id && editing.field === field ? editing.draft : ''

  const classes = [css.card]
  if (item.status === 'done') classes.push(css.cardDone)
  if (item.archived) classes.push(css.cardArchived)

  return (
    <li className={classes.join(' ')}>
      <div className={css.cardHead}>
        {/* The status mark: the generated todo and done seals, drawn as alpha
            masks so they take the theme's ink (§9.42). In progress keeps the
            quiet dot in its soft halo. The 20px slot is what indents the body
            column, not a box around the artwork. */}
        <span
          className={[
            css.mark,
            item.status === 'done' ? css.markDone : '',
            item.status === 'in_progress' ? css.markBusy : '',
          ].filter(Boolean).join(' ')}
          title={t('card.statusHint')}
        >
          {item.status === 'done'
            ? <span className={css.markGlyph} style={glyphMask(doneMark)} />
            : item.status === 'in_progress'
              ? <span className={css.markDot} />
              : <span className={css.markGlyph} style={glyphMask(todoMark)} />}
        </span>
        <div className={css.cardBody}>
          {/* The heading line: the title, with the status pill on the trailing
              edge. The send and write-back controls moved down to the foot
              (§9.30), where the reference design puts its action row, so the
              title owns the whole width of the line it is read on. */}
          <div className={css.titleRow}>
            {isEditing('title')
              ? (
                  <InlineField
                    className={`${css.field} ${css.fieldTitle}`}
                    value={draftOf('title')}
                    placeholder={t('edit.titlePlaceholder')}
                    multiline={false}
                    onChange={draft => { onEdit({ kind: 'field', id: item.id, field: 'title', draft }) }}
                    onCommit={draft => { onCommit('title', draft) }}
                    onCancel={onCancel}
                  />
                )
              : (
                  <button
                    type="button"
                    className={css.titleText}
                    onClick={() => { onEdit({ kind: 'field', id: item.id, field: 'title', draft: item.title }) }}
                  >
                    {item.title}
                  </button>
                )}
            {/* Status is stated once, in the pill: the dot in the margin carries
                the same fact as a shape, and the expanded area's hint carries the
                consequence. An open item says nothing here — the quiet mark is
                the whole statement, as it always was. */}
            {item.status !== 'open' && (
              <span
                className={item.status === 'done'
                  ? `${css.statusPill} ${css.statusPillDone}`
                  : `${css.statusPill} ${css.statusPillBusy}`}
              >
                {item.status === 'done'
                  ? <CheckBadgeGlyph />
                  : <span className={css.statusPip} />}
                {t(item.status === 'done' ? 'card.status.done' : 'card.status.in_progress')}
              </span>
            )}
            {item.archived && <span className={css.archivedBadge}>{t('card.archived')}</span>}
          </div>

          {isEditing('desc')
            ? (
                <InlineField
                  className={`${css.field} ${css.fieldDesc}`}
                  value={draftOf('desc')}
                  placeholder={t('card.noDescription')}
                  multiline
                  onChange={draft => { onEdit({ kind: 'field', id: item.id, field: 'desc', draft }) }}
                  onCommit={draft => { onCommit('desc', draft) }}
                  onCancel={onCancel}
                />
              )
            : (
                <button
                  type="button"
                  className={item.desc === '' ? `${css.descText} ${css.descEmpty}` : css.descText}
                  onClick={() => { onEdit({ kind: 'field', id: item.id, field: 'desc', draft: item.desc }) }}
                >
                  {item.desc === '' ? t('card.noDescription') : item.desc}
                </button>
              )}

          {/* The meta line: the project the item belongs to, read as a labelled
              fact rather than as a chip (§9.30). The timestamp still closes the
              row, and it is still a fact about the item rather than part of its
              heading. */}
          <div className={css.metaRow}>
            <CalendarGlyph />
            <span className={css.metaLabel}>{t('card.project')}</span>
            {isEditing('tag')
              ? (
                  <InlineField
                    className={`${css.field} ${css.fieldTag}`}
                    value={draftOf('tag')}
                    placeholder={t('card.noTag')}
                    multiline={false}
                    onChange={draft => { onEdit({ kind: 'field', id: item.id, field: 'tag', draft }) }}
                    onCommit={draft => { onCommit('tag', draft) }}
                    onCancel={onCancel}
                  />
                )
              : (
                  <button
                    type="button"
                    className={item.tag === '' ? `${css.tag} ${css.tagEmpty}` : css.tag}
                    onClick={() => { onEdit({ kind: 'field', id: item.id, field: 'tag', draft: item.tag }) }}
                  >
                    {item.tag === '' ? t('card.noTag') : item.tag}
                  </button>
                )}
            <span className={css.metaSpacer} />
            <span className={css.time}>{relative(item.updateAt, t('card.justNow'))}</span>
          </div>

          {/* The action row (§9.30): the two things this item can do — go to the
              composer, and be written back — fill the leading edge, and the
              disclosure closes the trailing one. Same verbs as before, given the
              reference design's button shape; both are reachable without opening
              the card, which is what §9.13 and §9.11 asked for. */}
          <div className={css.cardFoot}>
            {onFill !== undefined && (
              <button
                type="button"
                className={css.primaryBtn}
                title={t('card.fillTitle')}
                aria-label={t('card.fillTitle')}
                onClick={onFill}
              >
                <SendGlyph />
                <span>{t('card.fill')}</span>
              </button>
            )}
            {item.status !== 'done' && (
              <button
                type="button"
                className={pending
                  ? `${css.ghostBtn} ${css.ghostBtnPending}`
                  : item.status === 'in_progress' ? `${css.ghostBtn} ${css.ghostBtnBusy}` : css.ghostBtn}
                title={t(pending ? 'writeback.pending' : item.status === 'in_progress' ? 'writeback.retry' : 'writeback.request')}
                aria-label={t(pending ? 'writeback.pending' : item.status === 'in_progress' ? 'writeback.retry' : 'writeback.request')}
                disabled={pending}
                onClick={onRequestComplete}
              >
                <SummaryGlyph />
                <span>{t('card.summarize')}</span>
              </button>
            )}
            <span className={css.footSpacer} />
            {/* Archiving closes the actions cluster, where the reference design
                leaves room for one more control (§9.31). It replaced the delete
                button that used to sit in the open card's corner: filing an item
                away is reversible — the same button brings it back — so it can
                live in the row that needs no confirmation, while a destructive
                removal could not. */}
            <button
              type="button"
              className={item.archived ? `${css.archiveBtn} ${css.archiveBtnOn}` : css.archiveBtn}
              title={t(item.archived ? 'card.unarchive' : 'card.archive')}
              aria-label={t(item.archived ? 'card.unarchive' : 'card.archive')}
              onClick={onArchive}
            >
              <ArchiveGlyph />
              <span>{t(item.archived ? 'card.unarchive' : 'card.archive')}</span>
            </button>
            <span className={css.cardActions}>
              <button
                type="button"
                className={open ? `${css.chevron} ${css.chevronOpen}` : css.chevron}
                title={open ? t('card.collapse') : t('card.expand')}
                aria-label={open ? t('card.collapseDetails') : t('card.expandDetails')}
                aria-expanded={open}
                onClick={onToggle}
              >
                <ChevronGlyph />
                <span>{open ? t('card.collapseDetails') : t('card.expandDetails')}</span>
              </button>
            </span>
          </div>
        </div>
      </div>

      {/* The region is always mounted so its height can be transitioned (§9.18): the
          fold is a `grid-template-rows` 0fr -> 1fr, and a collapsed card keeps the
          content out of the tab order through `visibility`, not by unmounting it. */}
      <div className={open ? `${css.detailWrap} ${css.detailOpen}` : css.detailWrap}>
        <div className={css.detail}>
          <div className={css.detailBody}>
            {/* The expanded area's one rule, and it is labelled (§5.4). It is drawn
                whether or not a summary exists, so the section keeps its name and the
                line does not appear and disappear with the content behind it. */}
            <div className={css.completionDivider}>{t('completion.title')}</div>
            {item.completion === undefined
              ? <CompletionEmpty t={t} />
              : <Completion item={item} t={t} />}
            {/* §9.19: the write-back's next step, in the control's own words. It
                is drawn while the write-back is still pending, while it is queued
                and while it is running — but no longer for a finished card
                (§9.25): its status word and completion record already say
                everything that narration would repeat. Nor for an idle open item
                (§9.31.9): "写回后本条自动完结" explained a rule that the empty icon
                above it already implies, and it sat under every untouched card's
                expanded area as the only thing there. */}
            {(pending || item.status === 'in_progress') && (
              <p className={css.detailHint}>
                {t(pending ? 'writeback.pending' : 'writeback.hintRunning')}
              </p>
            )}
            {/* The prototype's `.detailBar` is gone (§9.31): its only control was
                delete, which moved out of the expanded area entirely once
                archiving replaced it. The empty region stays declared so the fold
                keeps one closing edge. */}
          </div>
        </div>
      </div>
    </li>
  )
}

/**
 * The expanded area with nothing written back yet (§9.31).
 *
 * One icon, no sentence: the divider above it already says 待办总结, so a line of
 * copy underneath only restates the heading and the rule. The words survive as
 * the icon's accessible name, which is where they still earn their keep.
 */
function CompletionEmpty({ t }: { readonly t: CardProps['t'] }): ReactNode {
  return (
    <div className={css.detailEmpty} role="img" aria-label={t('detail.noCompletion')}>
      {/* The completion area's own mark — a sheet with a line on it — at its
          24px detail size; the list's empty state is illustrated instead. */}
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="3" y="4.5" width="18" height="15" rx="4" stroke="currentColor" strokeWidth="1.3" />
        <path d="M3 9.5h18M7.5 14h7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    </div>
  )
}

/** The structured write-back summary, once one exists. */
function Completion({ item, t }: { readonly item: WorkItemRecord; readonly t: CardProps['t'] }): ReactNode {
  const completion = item.completion
  if (completion === undefined) return null
  return (
    <>
      {/* The labelled divider above already names this section, and no second rule
          is drawn between the two (at most one rule in the expanded area, §5.4). */}
      <p className={css.completionSummary}>{completion.summary}</p>

      <div className={css.completionBlock}>
        <p className={css.completionBlockTitle}>{t('completion.implementationPath')}</p>
        <ol className={css.completionSteps}>
          {completion.implementationPath.map((step, index) => (
            <li key={`${String(index)}:${step}`}>{step}</li>
          ))}
        </ol>
      </div>

      {completion.changedFiles.length > 0 && (
        <div className={css.completionBlock}>
          <p className={css.completionBlockTitle}>{t('completion.changedFiles')}</p>
          <ul className={css.completionList}>
            {completion.changedFiles.map(file => (
              <li key={file.path} className={css.completionRow}>
                <span className={css.filePath}>{file.path}</span>
                <span className={css.filePurpose}>{file.purpose}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Legacy only: records written before the tool retired verification still
          show theirs; new completions have no such field. */}
      {completion.verification !== undefined && completion.verification.length > 0 && (
        <div className={css.completionBlock}>
          <p className={css.completionBlockTitle}>{t('completion.verification')}</p>
          <ul className={css.completionList}>
            {completion.verification.map(entry => (
              <li key={entry.command} className={css.completionRow}>
                <span className={css.verifyCmd}>{entry.command}</span>
                <span className={`${css.verifyResult} ${
                  entry.result === 'passed' ? css.verifyPassed : entry.result === 'failed' ? css.verifyFailed : css.verifySkipped
                }`}
                >
                  {t(`verify.${entry.result}` as WorkbenchLocaleKey)}
                </span>
                {entry.note !== undefined && entry.note !== '' && (
                  <span className={css.filePurpose}>{entry.note}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* The writer stamp only earns its line when it says something a status
          word cannot: a model write-back is what `done` already means (§9.25),
          so the record from the model shows no stamp at all. */}
      {completion.completedBy !== 'model' && (
        <p className={css.completionBy}>
          {t('completion.by', { who: t(`writer.${completion.completedBy}` as WorkbenchLocaleKey) })}
        </p>
      )}
    </>
  )
}

/** Props for one inline edit field. */
interface InlineFieldProps {
  /**
   * Composed class names. `string | undefined` rather than `string` because the
   * CSS-module import is an open `Record` read under `noUncheckedIndexedAccess`,
   * so every lookup is nullable — matching React's own `className`, which
   * accepts undefined.
   */
  readonly className: string | undefined
  readonly value: string
  readonly placeholder: string
  readonly multiline: boolean
  readonly onChange: (draft: string) => void
  readonly onCommit: (draft: string) => void
  readonly onCancel: () => void
}

/**
 * A field that is always in edit state: it autofocuses, commits on blur, and
 * reverts on Escape.
 *
 * Blur commits rather than reverts because clicking a different field is the
 * ordinary way to finish with this one; making that lose the edit would punish
 * the common gesture. Escape is the deliberate undo.
 *
 * The box belongs to the caller's field class, which restates the metrics of the
 * text it replaces — clicking a title, a description or a tag must not move
 * anything (§9.14). The description is the one field whose box is
 * content-dependent, so it is measured here: the display clamps it to two lines,
 * and the field grows to those two lines and scrolls inside them, which keeps the
 * card exactly as tall before, during and after the edit.
 *
 * The placeholder is the caller's too, and for a description or a tag it is the
 * display state's own empty word (`card.noDescription` / `card.noTag`): an empty
 * field whose placeholder differed from what it replaced would trade a height
 * jump for a text jump.
 */
const DESC_LINE_HEIGHT = 19
const DESC_MAX_LINES = 2

function InlineField({ className, value, placeholder, multiline, onChange, onCommit, onCancel }: InlineFieldProps): ReactNode {
  const ref = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null)
  const done = useRef(false)

  useEffect(() => {
    const node = ref.current
    if (node === null) return
    node.focus()
    node.setSelectionRange(node.value.length, node.value.length)
  }, [])

  /**
   * `rows={1}` in the render below is load-bearing here: `scrollHeight` never
   * reports less than the element's own height, so the browser's default two rows
   * would pin a one-line description at two lines and the field would jump on
   * every click. Measuring before paint keeps that from being visible.
   */
  useLayoutEffect(() => {
    const node = ref.current
    if (node === null || !multiline) return
    const cap = DESC_LINE_HEIGHT * DESC_MAX_LINES
    node.style.height = 'auto'
    node.style.height = `${Math.max(DESC_LINE_HEIGHT, Math.min(cap, node.scrollHeight))}px`
  }, [multiline, value])

  const finish = (commit: boolean): void => {
    if (done.current) return
    done.current = true
    if (commit) onCommit(value)
    else onCancel()
  }

  const shared = {
    className,
    value,
    placeholder,
    ref: ref as never,
    onChange: (event: { target: { value: string } }) => { onChange(event.target.value) },
    onBlur: () => { finish(true) },
    onKeyDown: (event: { key: string; shiftKey: boolean; preventDefault: () => void }) => {
      if (event.key === 'Escape') { event.preventDefault(); finish(false); return }
      if (event.key === 'Enter' && (!multiline || event.shiftKey)) { event.preventDefault(); finish(true) }
    },
  }

  return multiline
    ? <textarea {...shared} rows={1} />
    : <input {...shared} type="text" />
}

/** The new-item card: one field, because Enter means "commit this field" here too. */
function Composer({ t, onCommit, onCancel }: {
  readonly t: CardProps['t']
  readonly onCommit: (title: string) => void
  readonly onCancel: () => void
}): ReactNode {
  const [title, setTitle] = useState('')
  return (
    <>
      <InlineField
        className={`${css.field} ${css.fieldTitle}`}
        value={title}
        placeholder={t('edit.titlePlaceholder')}
        multiline={false}
        onChange={setTitle}
        onCommit={onCommit}
        onCancel={onCancel}
      />
      <p className={css.editHint}>{t('edit.hint')}</p>
    </>
  )
}

/** Props the title slot delivers; the chip is the plugin's label. */
export type WorkbenchTabTitleProps = InjectFace<WorkbenchInjected> & PropsLocale<'workbench'>

/** Render the workbench tab's chip title: a checklist glyph before the label. */
export function WorkbenchTabTitle(props: WorkbenchTabTitleProps): ReactNode {
  return (
    <>
      <ChecklistGlyph className={css.titleIcon} />
      {props.t('tab.title')}
    </>
  )
}

function ChecklistGlyph({ className }: { className?: string | undefined }): ReactNode {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="2" y="2.5" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.2" />
      <rect x="2" y="9.5" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.2" />
      <path d="M8.5 4.5h5.5M8.5 11.5h5.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

function SearchGlyph(): ReactNode {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M10.5 10.5 14 14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

function PlusGlyph(): ReactNode {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 3.2v9.6M3.2 8h9.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

/**
 * The disclosure chevron.
 *
 * It points down, because the control it sits on says "展开详情": the direction
 * is the promise the label makes, and a right-pointing chevron would read as
 * "next" instead. The open state rotates the *glyph* 180° — never the button,
 * whose rounded hover and press surface must not spin (§9.18).
 */
function ChevronGlyph(): ReactNode {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="m3.6 6.2 4.4 4.4 4.4-4.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/**
 * The project line's calendar, and the card's date fact.
 *
 * Drawn in the hand-cut 16 box the rest of these glyphs use, at the weight of
 * `.metaLabel` beside it, so the meta line reads as one sentence rather than as
 * an icon with a caption bolted on.
 */
function CalendarGlyph(): ReactNode {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="2.3" y="3.6" width="11.4" height="10" rx="2.6" stroke="currentColor" strokeWidth="1.4" />
      <path d="M2.3 6.9h11.4M5.8 2.4v2.3M10.2 2.4v2.3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

/**
 * The finished pill's badge: a filled disc with a knocked-out check.
 *
 * The disc is the pill's own ink, so the two are one colour; the check is
 * knocked out in the surface colour (`--wb-on-accent`), which is what keeps it
 * legible in either theme without a second palette.
 */
function CheckBadgeGlyph(): ReactNode {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="6.9" fill="currentColor" />
      <path d="m5 8.2 2 2 4-4.2" stroke="var(--wb-on-accent)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/*
 * The card's two action glyphs use the icon set's own artwork (§9.15), used as
 * supplied: filled paths in a 1024 box instead of the hand-drawn 16 box the rest
 * of this file uses, so their weight is a property of the drawing rather than of
 * a `stroke-width` chosen here. Nothing is redrawn or rescaled — only `fill` is
 * bound to `currentColor`, so the button's own ink still applies.
 */

/**
 * Send: the icon set's paper plane.
 *
 * Its nose points up-right, the opposite of the hand-drawn plane this replaced:
 * that one flew left because this pane sits on the right of the window and the
 * item travels towards the conversation. That reading (§9.11 item 3) is the one
 * thing this swap gives up, and §9.15 records it as a deliberate trade — the
 * direction belongs to the artwork the user picked. Mirroring it back is a
 * `scaleX(-1)` on this `<svg>` whenever it is wanted.
 */
function SendGlyph(): ReactNode {
  return (
    <svg width="14" height="14" viewBox="0 0 1024 1024" fill="currentColor" aria-hidden="true">
      <path
        d="M826.709333 142.336a32 32 0 0 1 46.72 32.128l-78.293333 656.981333a32 32 0 0 1-44.672 25.472l-202.069333-89.130666-106.965334 108.074666a32 32 0 0 1-54.442666-18.133333L386.688 853.333333v-158.805333l-250.453333-131.669333a32 32 0 0 1-4.053334-54.144l4.010667-2.474667z m-28.629333 123.434667l-342.186667 429.397333a32.085333 32.085333 0 0 1-5.12 5.12l-0.085333 75.221333 67.712-68.394666a32 32 0 0 1 31.018667-8.405334l4.650666 1.664 182.613334 80.512 61.397333-515.114666z m-91.562667 12.202666L219.818667 534.485333l198.912 104.618667 287.786666-361.130667z"
      />
    </svg>
  )
}

/**
 * Write-back: a summary sheet with two lines of text on it.
 *
 * §9.13 chose a reading mark (the magnifier with a trend line) while the control
 * was a 24px icon in the heading line, where only its silhouette could speak.
 * Now the control carries the word 总结, so the glyph's job is to name the thing
 * produced — a written summary — in the same line weight as the calendar and the
 * chevron it stands beside.
 */
function SummaryGlyph(): ReactNode {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="3.1" y="2.2" width="9.8" height="11.6" rx="2.3" stroke="currentColor" strokeWidth="1.4" />
      <path d="M5.8 6.1h4.4M5.8 9.7h2.9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

/**
 * Archive: DSH's archive glyph, at the row's 13px and centred in its box.
 *
 * The supplied art sits 1.6 units from the top of the 16-unit grid and 2.2 from
 * the bottom (stroke included), so at 13px the box looked top-full and left a
 * gap under it. The group is nudged 0.3 down — geometry untouched — which puts
 * 1.9 above and 1.9 below and lands the ink's centre on the box centre.
 *
 * The hand-drawn 13px box this replaces compressed its 3-unit lid into one dark
 * band; DSH's element keeps the lid readable with its 1-unit stroke.
 */
function ArchiveGlyph(): ReactNode {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      strokeWidth="1"
    >
      <g transform="translate(0 0.3)">
        <rect x="1.9" y="2.1" width="12.2" height="3.4" rx="1.1" />
        <path d="M2.95 5.7v4.8a2.9 2.9 0 0 0 2.9 2.9h4.3a2.9 2.9 0 0 0 2.9-2.9V5.7" />
        <path d="m6 9.35 1.4 1.4 2.6-2.6" />
      </g>
    </svg>
  )
}

export type { WorkbenchSnapshot, WorkbenchFilterTier }
