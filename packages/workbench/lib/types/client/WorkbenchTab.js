import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
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
import { useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { seedText } from "./seed.js";
import { workspaceOfSession } from "./workspace-source.js";
import css from './WorkbenchTab.module.css';
/** One formatter for the module; constructing one per render is the slow path. */
const RELATIVE = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });
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
function relative(iso, justNow) {
    const then = Date.parse(iso);
    if (Number.isNaN(then))
        return '';
    const seconds = Math.round((then - Date.now()) / 1000);
    const magnitude = Math.abs(seconds);
    if (magnitude < 60)
        return justNow;
    if (magnitude < 3600)
        return RELATIVE.format(Math.round(seconds / 60), 'minute');
    if (magnitude < 86_400)
        return RELATIVE.format(Math.round(seconds / 3600), 'hour');
    if (magnitude < 2_592_000)
        return RELATIVE.format(Math.round(seconds / 86_400), 'day');
    if (magnitude < 31_536_000)
        return RELATIVE.format(Math.round(seconds / 2_592_000), 'month');
    return RELATIVE.format(Math.round(seconds / 31_536_000), 'year');
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
const WRITE_BACK_INTERVAL_MS = 1500;
const WRITE_BACK_TICKS = 40;
/** Render the workbench pane. */
export function WorkbenchTab(props) {
    const { workspaces, t, requestWriteBack: queueWriteBack } = props;
    const tabInfo = props.useTabInfo();
    const store = props.storeFor(props.sessionId);
    const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot);
    const workspaceSnapshot = useSyncExternalStore(workspaces.subscribe, workspaces.getSnapshot);
    const workspaceItems = workspaceSnapshot.items;
    const [editing, setEditing] = useState({ kind: 'none' });
    const [expanded, setExpanded] = useState([]);
    const [notice, setNotice] = useState(undefined);
    /**
     * The item whose write-back request has been sent and has not settled yet.
     *
     * One at a time, deliberately: §11.4 forbids initiating a second write-back
     * while one is pending, so the pane holds an id rather than a set of them. It
     * exists for two reasons — the control says so while the model works, and the
     * settle effect below knows which item to re-read.
     */
    const [writeBack, setWriteBack] = useState(undefined);
    const visible = tabInfo.tab.visible;
    // The workspace this pane follows: the one the conversation it belongs to sits
    // in, or `''` when it sits in none. Read afresh every render rather than
    // remembered, because moving the conversation into another workspace is the one
    // change that can happen under a pane that is already open.
    const followed = workspaceOfSession(workspaceItems, props.sessionId) ?? '';
    /**
     * Follow that workspace, and re-read it when the pane comes back into view.
     *
     * One effect rather than two: pointing the store at a workspace already starts
     * its load, so a separate refresh pass would fire a second request for the same
     * list on every first open. Here the follow and the re-read of Tier 2 (§6.2)
     * are mutually exclusive branches of a single pass.
     */
    useEffect(() => {
        if (!visible)
            return;
        if (followed !== store.workspaceId) {
            // An open editor belonged to the workspace being left — §5.4 edits in place,
            // so it holds an id from the old list. The switcher closed it on the same
            // event, and following closes it the same way. Returning the current state
            // unchanged when there is nothing open keeps this from costing a render.
            setEditing(current => (current.kind === 'none' ? current : { kind: 'none' }));
            store.setWorkspace(followed);
            return;
        }
        // Another session may have written while this kept-mounted body was hidden,
        // and it would otherwise show what it saw when it was last looked at.
        if (followed !== '')
            void store.refresh();
    }, [store, followed, visible]);
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
        if (writeBack === undefined)
            return;
        const id = writeBack;
        let ticks = 0;
        let timer = 0;
        let stopped = false;
        const answer = () => {
            if (stopped)
                return;
            const status = store.getSnapshot().items.find(entry => entry.id === id)?.status;
            if (status === 'done' || status === undefined || ticks >= WRITE_BACK_TICKS) {
                stopped = true;
                window.clearInterval(timer);
                setWriteBack(undefined);
            }
        };
        const tick = () => {
            ticks += 1;
            void store.refresh().then(answer);
        };
        timer = window.setInterval(tick, WRITE_BACK_INTERVAL_MS);
        // The first reading is immediate: the fast path can already be finished by
        // the time the click returns, and waiting a full interval for that would look
        // like the button did nothing.
        tick();
        return () => {
            stopped = true;
            window.clearInterval(timer);
        };
    }, [writeBack, store]);
    const { active, done } = useMemo(() => {
        const open = [];
        const finished = [];
        for (const item of snapshot.items)
            (item.status === 'done' ? finished : open).push(item);
        return { active: open, done: finished };
    }, [snapshot.items]);
    /*
     * The composer's action face. This seat is session-scoped, and the conversation
     * plugin merges its input actions into every session-scope slot's standard
     * props, so the Client passes it in beside `sessionId`. Read through a cast
     * because the declaring package is not a dependency of this plugin.
     */
    const inputActions = props.inputActions;
    /** A face that can write nothing would only produce a dead control. */
    const canFill = inputActions !== undefined
        && (inputActions.insertText !== undefined || inputActions.setDraft !== undefined);
    /**
     * Put one work item into the composer's draft — filling, never submitting.
     *
     * `insertText` is the non-destructive path: it lands at the caret, keeps
     * whatever the user already typed, and is one undo step. It is
     * revision-guarded and refuses when the draft moved under us or the editor is
     * locked, in which case `setDraft` keeps the click from being a silent no-op.
     * @param item - the work item to hand over.
     */
    const fillComposer = (item) => {
        const text = seedText(item);
        if (text === '' || inputActions === undefined)
            return;
        const span = inputActions.captureInsertion?.();
        const inserted = span !== undefined && inputActions.insertText?.(text, span) === true;
        if (!inserted)
            inputActions.setDraft?.(text);
        inputActions.focus?.();
    };
    /** Report a failed write and re-sync whatever the Host says is current. */
    const report = (result) => {
        if (result.code === 'conflict') {
            if (result.current !== undefined)
                store.adoptConflict(result.current);
            setNotice(t('error.conflict'));
            return;
        }
        if (result.code === 'not_found') {
            setNotice(t('error.notFound'));
            void store.refresh();
            return;
        }
        if (result.code === 'invalid')
            setNotice(t('error.invalid', { message: result.message ?? '' }));
    };
    /** Commit one inline field, clearing the editor only when the Host accepted. */
    const commit = async (item, field, draft) => {
        setNotice(undefined);
        const result = field === 'desc'
            ? await store.setDesc(item, draft)
            : await store.update(item, { [field]: draft });
        if (result.code === 'ok') {
            setEditing({ kind: 'none' });
            return;
        }
        report(result);
        setEditing({ kind: 'none' });
    };
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
    const requestWriteBack = async (item) => {
        setNotice(undefined);
        // One write-back in flight at a time: a second request would ask the model
        // for the same summary twice, and §11.4 forbids exactly that.
        if (writeBack !== undefined)
            return;
        setWriteBack(item.id);
        const result = await store.requestComplete(item);
        if (result.code !== 'ok') {
            setWriteBack(undefined);
            report(result);
            return;
        }
        let queued;
        try {
            queued = await queueWriteBack(props.sessionId, item);
        }
        catch (cause) {
            // The injected face is expected to be total (§9.23), but before that fix a
            // throw here left the control pending forever with nothing but a console
            // stack — the one outcome §9.19 forbids. Report it like any refusal.
            queued = { ok: false, message: cause instanceof Error ? cause.message : String(cause) };
        }
        if (queued.ok)
            return;
        setWriteBack(undefined);
        setNotice(queued.sessionMissing === true
            ? t('writeback.noSession')
            : t('writeback.failed', { message: queued.message ?? '' }));
    };
    const createItem = async (title) => {
        const trimmed = title.trim();
        if (trimmed === '') {
            setEditing({ kind: 'none' });
            return;
        }
        setNotice(undefined);
        const result = await store.create(trimmed, '', '');
        if (result.code !== 'ok')
            report(result);
        setEditing({ kind: 'none' });
    };
    const toggleExpanded = (id) => {
        setExpanded(current => current.includes(id) ? current.filter(entry => entry !== id) : [...current, id]);
    };
    /**
     * File one item away, or bring it back (§9.31).
     *
     * No confirmation, and no `window.confirm`: archiving destroys nothing and the
     * same control reverses it, which is precisely the property the delete button
     * it replaced did not have.
     * @param item - the record to archive or restore.
     */
    const archiveItem = async (item) => {
        setNotice(undefined);
        const result = await store.setArchived(item, !item.archived);
        if (result.code !== 'ok')
            report(result);
    };
    if (workspaceItems.length === 0) {
        return (_jsx("div", { className: css.pane, children: _jsxs("div", { className: css.empty, children: [_jsx("p", { children: t('workspace.none') }), _jsx("p", { className: css.emptyHint, children: t('workspace.noneHint') })] }) }));
    }
    // The conversation sits in no workspace, so there is no work list this pane could
    // legitimately show. Keyed on `followed` rather than on the store, so the message
    // does not depend on an effect having run first.
    if (followed === '') {
        return (_jsx("div", { className: css.pane, children: _jsxs("div", { className: css.empty, children: [_jsx("p", { children: t('workspace.unassigned') }), _jsx("p", { className: css.emptyHint, children: t('workspace.unassignedHint') })] }) }));
    }
    const tiers = ['all', 'active', 'done', 'archived'];
    return (_jsxs("div", { className: css.pane, children: [_jsxs("div", { className: css.toolbar, children: [_jsx("div", { className: css.searchRow, children: _jsxs("label", { className: css.searchField, children: [_jsx(SearchGlyph, {}), _jsx("input", { className: css.searchInput, type: "search", value: snapshot.query, placeholder: t('search.placeholder'), onChange: event => { store.setQuery(event.target.value); } })] }) }), _jsxs("div", { className: css.filterRow, children: [tiers.map(tier => (_jsxs("button", { type: "button", className: [
                                    css.chip,
                                    (tier === 'all' || tier === 'active') && css.chipFlat,
                                    tier === snapshot.filter && css.chipActive,
                                ].filter(Boolean).join(' '), onClick: () => {
                                    setEditing({ kind: 'none' });
                                    store.setFilter(tier);
                                }, children: [t(`filter.${tier}`), _jsx("span", { className: css.chipCount, children: snapshot.counts[tier] })] }, tier))), _jsx("span", { className: css.filterSpacer }), _jsx("button", { type: "button", className: css.iconBtn, title: t('action.create'), "aria-label": t('action.create'), onClick: () => { setEditing({ kind: 'create' }); }, children: _jsx(PlusGlyph, {}) })] })] }), _jsxs("div", { className: css.scroller, children: [notice !== undefined && _jsx("p", { className: css.notice, children: notice }), snapshot.phase === 'loading' && (_jsxs("div", { className: css.skeletonList, children: [_jsx("div", { className: css.skeleton }), _jsx("div", { className: css.skeleton })] })), snapshot.phase === 'error' && (_jsxs(_Fragment, { children: [_jsx("p", { className: `${css.status} ${css.statusError}`, children: t('state.error', { message: snapshot.error?.message ?? '' }) }), _jsx("button", { type: "button", className: css.retryBtn, onClick: () => { void store.refresh(); }, children: t('state.retry') })] })), snapshot.phase === 'ready' && (_jsxs(_Fragment, { children: [editing.kind === 'create' && (_jsx("ul", { className: css.list, children: _jsx("li", { className: `${css.card} ${css.cardComposing}`, children: _jsxs("div", { className: css.cardHead, children: [_jsx("span", { className: `${css.mark} ${css.markBusy}`, children: _jsx("span", { className: css.markDot }) }), _jsx("div", { className: css.cardBody, children: _jsx(Composer, { t: t, onCommit: title => { void createItem(title); }, onCancel: () => { setEditing({ kind: 'none' }); } }) })] }) }) })), snapshot.items.length === 0 && editing.kind !== 'create' && (_jsxs("div", { className: css.empty, children: [_jsx(EmptyGlyph, {}), snapshot.query !== '' || snapshot.filter !== 'all'
                                        ? (_jsxs(_Fragment, { children: [_jsx("p", { children: t('empty.filtered') }), _jsx("p", { className: css.emptyHint, children: t('empty.filteredHint') })] }))
                                        : (_jsxs(_Fragment, { children: [_jsx("p", { children: t('empty.title') }), _jsx("p", { className: css.emptyHint, children: t('empty.hint') })] }))] })), snapshot.filter === 'all' && active.length > 0 && done.length > 0 && (_jsxs("p", { className: css.groupLabel, children: [t('group.active'), " \u00B7 ", active.length] })), _jsx("ul", { className: css.list, children: (snapshot.filter === 'all' ? active : snapshot.filter === 'done' ? done : snapshot.items).map(item => (_jsx(Card, { item: item, t: t, editing: editing, open: expanded.includes(item.id), pending: writeBack === item.id, onEdit: next => { setEditing(next); setNotice(undefined); }, onCommit: (field, draft) => { void commit(item, field, draft); }, onCancel: () => { setEditing({ kind: 'none' }); }, onToggle: () => { toggleExpanded(item.id); }, onArchive: () => { void archiveItem(item); }, onRequestComplete: () => { void requestWriteBack(item); }, onFill: canFill ? () => { fillComposer(item); } : undefined }, item.id))) }), snapshot.filter === 'all' && done.length > 0 && (_jsxs(_Fragment, { children: [active.length > 0 && (_jsxs("p", { className: css.groupLabel, children: [t('group.done'), " \u00B7 ", done.length] })), _jsx("ul", { className: css.list, children: done.map(item => (_jsx(Card, { item: item, t: t, editing: editing, open: expanded.includes(item.id), pending: writeBack === item.id, onEdit: next => { setEditing(next); setNotice(undefined); }, onCommit: (field, draft) => { void commit(item, field, draft); }, onCancel: () => { setEditing({ kind: 'none' }); }, onToggle: () => { toggleExpanded(item.id); }, onArchive: () => { void archiveItem(item); }, onRequestComplete: () => { void requestWriteBack(item); }, onFill: canFill ? () => { fillComposer(item); } : undefined }, item.id))) })] })), snapshot.total > snapshot.items.length && (_jsx("p", { className: css.status, children: t('list.more', { count: snapshot.total - snapshot.items.length }) }))] }))] })] }));
}
/** One work item. */
function Card({ item, t, editing, open, pending = false, onEdit, onCommit, onCancel, onToggle, onArchive, onRequestComplete, onFill, }) {
    const isEditing = (field) => editing.kind === 'field' && editing.id === item.id && editing.field === field;
    const draftOf = (field) => editing.kind === 'field' && editing.id === item.id && editing.field === field ? editing.draft : '';
    const classes = [css.card];
    if (item.status === 'done')
        classes.push(css.cardDone);
    if (item.archived)
        classes.push(css.cardArchived);
    return (_jsxs("li", { className: classes.join(' '), children: [_jsxs("div", { className: css.cardHead, children: [_jsx("span", { className: [
                            css.mark,
                            item.status === 'done' ? css.markDone : '',
                            item.status === 'in_progress' ? css.markBusy : '',
                        ].filter(Boolean).join(' '), title: t('card.statusHint'), children: _jsx("span", { className: css.markDot }) }), _jsxs("div", { className: css.cardBody, children: [_jsxs("div", { className: css.titleRow, children: [isEditing('title')
                                        ? (_jsx(InlineField, { className: `${css.field} ${css.fieldTitle}`, value: draftOf('title'), placeholder: t('edit.titlePlaceholder'), multiline: false, onChange: draft => { onEdit({ kind: 'field', id: item.id, field: 'title', draft }); }, onCommit: draft => { onCommit('title', draft); }, onCancel: onCancel }))
                                        : (_jsx("button", { type: "button", className: css.titleText, onClick: () => { onEdit({ kind: 'field', id: item.id, field: 'title', draft: item.title }); }, children: item.title })), item.status !== 'open' && (_jsxs("span", { className: item.status === 'done'
                                            ? `${css.statusPill} ${css.statusPillDone}`
                                            : `${css.statusPill} ${css.statusPillBusy}`, children: [item.status === 'done'
                                                ? _jsx(CheckBadgeGlyph, {})
                                                : _jsx("span", { className: css.statusPip }), t(item.status === 'done' ? 'card.status.done' : 'card.status.in_progress')] })), item.archived && _jsx("span", { className: css.archivedBadge, children: t('card.archived') })] }), isEditing('desc')
                                ? (_jsx(InlineField, { className: `${css.field} ${css.fieldDesc}`, value: draftOf('desc'), placeholder: t('card.noDescription'), multiline: true, onChange: draft => { onEdit({ kind: 'field', id: item.id, field: 'desc', draft }); }, onCommit: draft => { onCommit('desc', draft); }, onCancel: onCancel }))
                                : (_jsx("button", { type: "button", className: item.desc === '' ? `${css.descText} ${css.descEmpty}` : css.descText, onClick: () => { onEdit({ kind: 'field', id: item.id, field: 'desc', draft: item.desc }); }, children: item.desc === '' ? t('card.noDescription') : item.desc })), _jsxs("div", { className: css.metaRow, children: [_jsx(CalendarGlyph, {}), _jsx("span", { className: css.metaLabel, children: t('card.project') }), isEditing('tag')
                                        ? (_jsx(InlineField, { className: `${css.field} ${css.fieldTag}`, value: draftOf('tag'), placeholder: t('card.noTag'), multiline: false, onChange: draft => { onEdit({ kind: 'field', id: item.id, field: 'tag', draft }); }, onCommit: draft => { onCommit('tag', draft); }, onCancel: onCancel }))
                                        : (_jsx("button", { type: "button", className: item.tag === '' ? `${css.tag} ${css.tagEmpty}` : css.tag, onClick: () => { onEdit({ kind: 'field', id: item.id, field: 'tag', draft: item.tag }); }, children: item.tag === '' ? t('card.noTag') : item.tag })), _jsx("span", { className: css.metaSpacer }), _jsx("span", { className: css.time, children: relative(item.updateAt, t('card.justNow')) })] }), _jsxs("div", { className: css.cardFoot, children: [onFill !== undefined && (_jsxs("button", { type: "button", className: css.primaryBtn, title: t('card.fillTitle'), "aria-label": t('card.fillTitle'), onClick: onFill, children: [_jsx(SendGlyph, {}), _jsx("span", { children: t('card.fill') })] })), item.status !== 'done' && (_jsxs("button", { type: "button", className: pending
                                            ? `${css.ghostBtn} ${css.ghostBtnPending}`
                                            : item.status === 'in_progress' ? `${css.ghostBtn} ${css.ghostBtnBusy}` : css.ghostBtn, title: t(pending ? 'writeback.pending' : item.status === 'in_progress' ? 'writeback.retry' : 'writeback.request'), "aria-label": t(pending ? 'writeback.pending' : item.status === 'in_progress' ? 'writeback.retry' : 'writeback.request'), disabled: pending, onClick: onRequestComplete, children: [_jsx(SummaryGlyph, {}), _jsx("span", { children: t('card.summarize') })] })), _jsx("span", { className: css.footSpacer }), _jsxs("button", { type: "button", className: item.archived ? `${css.archiveBtn} ${css.archiveBtnOn}` : css.archiveBtn, title: t(item.archived ? 'card.unarchive' : 'card.archive'), "aria-label": t(item.archived ? 'card.unarchive' : 'card.archive'), onClick: onArchive, children: [_jsx(ArchiveGlyph, {}), _jsx("span", { children: t(item.archived ? 'card.unarchive' : 'card.archive') })] }), _jsx("span", { className: css.cardActions, children: _jsxs("button", { type: "button", className: open ? `${css.chevron} ${css.chevronOpen}` : css.chevron, title: open ? t('card.collapse') : t('card.expand'), "aria-label": open ? t('card.collapseDetails') : t('card.expandDetails'), "aria-expanded": open, onClick: onToggle, children: [_jsx(ChevronGlyph, {}), _jsx("span", { children: open ? t('card.collapseDetails') : t('card.expandDetails') })] }) })] })] })] }), _jsx("div", { className: open ? `${css.detailWrap} ${css.detailOpen}` : css.detailWrap, children: _jsxs("div", { className: css.detail, children: [_jsx("div", { className: css.completionDivider, children: t('completion.title') }), item.completion === undefined
                            ? _jsx(CompletionEmpty, { t: t })
                            : _jsx(Completion, { item: item, t: t }), (pending || item.status === 'in_progress') && (_jsx("p", { className: css.detailHint, children: t(pending ? 'writeback.pending' : 'writeback.hintRunning') }))] }) })] }));
}
/**
 * The expanded area with nothing written back yet (§9.31).
 *
 * One icon, no sentence: the divider above it already says 待办总结, so a line of
 * copy underneath only restates the heading and the rule. The words survive as
 * the icon's accessible name, which is where they still earn their keep.
 */
function CompletionEmpty({ t }) {
    return (_jsx("div", { className: css.detailEmpty, role: "img", "aria-label": t('detail.noCompletion'), children: _jsxs("svg", { width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", "aria-hidden": "true", children: [_jsx("rect", { x: "3", y: "4.5", width: "18", height: "15", rx: "4", stroke: "currentColor", strokeWidth: "1.3" }), _jsx("path", { d: "M3 9.5h18M7.5 14h7", stroke: "currentColor", strokeWidth: "1.3", strokeLinecap: "round" })] }) }));
}
/** The structured write-back summary, once one exists. */
function Completion({ item, t }) {
    const completion = item.completion;
    if (completion === undefined)
        return null;
    return (_jsxs(_Fragment, { children: [_jsx("p", { className: css.completionSummary, children: completion.summary }), _jsxs("div", { className: css.completionBlock, children: [_jsx("p", { className: css.completionBlockTitle, children: t('completion.implementationPath') }), _jsx("ol", { className: css.completionSteps, children: completion.implementationPath.map((step, index) => (_jsx("li", { children: step }, `${String(index)}:${step}`))) })] }), completion.changedFiles.length > 0 && (_jsxs("div", { className: css.completionBlock, children: [_jsx("p", { className: css.completionBlockTitle, children: t('completion.changedFiles') }), _jsx("ul", { className: css.completionList, children: completion.changedFiles.map(file => (_jsxs("li", { className: css.completionRow, children: [_jsx("span", { className: css.filePath, children: file.path }), _jsx("span", { className: css.filePurpose, children: file.purpose })] }, file.path))) })] })), completion.verification.length > 0 && (_jsxs("div", { className: css.completionBlock, children: [_jsx("p", { className: css.completionBlockTitle, children: t('completion.verification') }), _jsx("ul", { className: css.completionList, children: completion.verification.map(entry => (_jsxs("li", { className: css.completionRow, children: [_jsx("span", { className: css.verifyCmd, children: entry.command }), _jsx("span", { className: `${css.verifyResult} ${entry.result === 'passed' ? css.verifyPassed : entry.result === 'failed' ? css.verifyFailed : css.verifySkipped}`, children: t(`verify.${entry.result}`) }), entry.note !== undefined && entry.note !== '' && (_jsx("span", { className: css.filePurpose, children: entry.note }))] }, entry.command))) })] })), completion.completedBy !== 'model' && (_jsx("p", { className: css.completionBy, children: t('completion.by', { who: t(`writer.${completion.completedBy}`) }) }))] }));
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
const DESC_LINE_HEIGHT = 19;
const DESC_MAX_LINES = 2;
function InlineField({ className, value, placeholder, multiline, onChange, onCommit, onCancel }) {
    const ref = useRef(null);
    const done = useRef(false);
    useEffect(() => {
        const node = ref.current;
        if (node === null)
            return;
        node.focus();
        node.setSelectionRange(node.value.length, node.value.length);
    }, []);
    /**
     * `rows={1}` in the render below is load-bearing here: `scrollHeight` never
     * reports less than the element's own height, so the browser's default two rows
     * would pin a one-line description at two lines and the field would jump on
     * every click. Measuring before paint keeps that from being visible.
     */
    useLayoutEffect(() => {
        const node = ref.current;
        if (node === null || !multiline)
            return;
        const cap = DESC_LINE_HEIGHT * DESC_MAX_LINES;
        node.style.height = 'auto';
        node.style.height = `${Math.max(DESC_LINE_HEIGHT, Math.min(cap, node.scrollHeight))}px`;
    }, [multiline, value]);
    const finish = (commit) => {
        if (done.current)
            return;
        done.current = true;
        if (commit)
            onCommit(value);
        else
            onCancel();
    };
    const shared = {
        className,
        value,
        placeholder,
        ref: ref,
        onChange: (event) => { onChange(event.target.value); },
        onBlur: () => { finish(true); },
        onKeyDown: (event) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                finish(false);
                return;
            }
            if (event.key === 'Enter' && (!multiline || event.shiftKey)) {
                event.preventDefault();
                finish(true);
            }
        },
    };
    return multiline
        ? _jsx("textarea", { ...shared, rows: 1 })
        : _jsx("input", { ...shared, type: "text" });
}
/** The new-item card: one field, because Enter means "commit this field" here too. */
function Composer({ t, onCommit, onCancel }) {
    const [title, setTitle] = useState('');
    return (_jsxs(_Fragment, { children: [_jsx(InlineField, { className: `${css.field} ${css.fieldTitle}`, value: title, placeholder: t('edit.titlePlaceholder'), multiline: false, onChange: setTitle, onCommit: onCommit, onCancel: onCancel }), _jsx("p", { className: css.editHint, children: t('edit.hint') })] }));
}
/** Render the workbench tab's chip title: a checklist glyph before the label. */
export function WorkbenchTabTitle(props) {
    return (_jsxs(_Fragment, { children: [_jsx(ChecklistGlyph, { className: css.titleIcon }), props.t('tab.title')] }));
}
function ChecklistGlyph({ className }) {
    return (_jsxs("svg", { className: className, width: "14", height: "14", viewBox: "0 0 16 16", fill: "none", "aria-hidden": "true", children: [_jsx("rect", { x: "2", y: "2.5", width: "4", height: "4", rx: "1", stroke: "currentColor", strokeWidth: "1.2" }), _jsx("rect", { x: "2", y: "9.5", width: "4", height: "4", rx: "1", stroke: "currentColor", strokeWidth: "1.2" }), _jsx("path", { d: "M8.5 4.5h5.5M8.5 11.5h5.5", stroke: "currentColor", strokeWidth: "1.4", strokeLinecap: "round" })] }));
}
function SearchGlyph() {
    return (_jsxs("svg", { width: "13", height: "13", viewBox: "0 0 16 16", fill: "none", "aria-hidden": "true", children: [_jsx("circle", { cx: "7", cy: "7", r: "4.5", stroke: "currentColor", strokeWidth: "1.4" }), _jsx("path", { d: "M10.5 10.5 14 14", stroke: "currentColor", strokeWidth: "1.4", strokeLinecap: "round" })] }));
}
function PlusGlyph() {
    return (_jsx("svg", { width: "14", height: "14", viewBox: "0 0 16 16", fill: "none", "aria-hidden": "true", children: _jsx("path", { d: "M8 3.2v9.6M3.2 8h9.6", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" }) }));
}
/**
 * The disclosure chevron.
 *
 * It points down, because the control it sits on says "展开详情": the direction
 * is the promise the label makes, and a right-pointing chevron would read as
 * "next" instead. The open state rotates the *glyph* 180° — never the button,
 * whose rounded hover and press surface must not spin (§9.18).
 */
function ChevronGlyph() {
    return (_jsx("svg", { width: "13", height: "13", viewBox: "0 0 16 16", fill: "none", "aria-hidden": "true", children: _jsx("path", { d: "m3.6 6.2 4.4 4.4 4.4-4.4", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" }) }));
}
/**
 * The project line's calendar, and the card's date fact.
 *
 * Drawn in the hand-cut 16 box the rest of these glyphs use, at the weight of
 * `.metaLabel` beside it, so the meta line reads as one sentence rather than as
 * an icon with a caption bolted on.
 */
function CalendarGlyph() {
    return (_jsxs("svg", { width: "15", height: "15", viewBox: "0 0 16 16", fill: "none", "aria-hidden": "true", children: [_jsx("rect", { x: "2.3", y: "3.6", width: "11.4", height: "10", rx: "2.6", stroke: "currentColor", strokeWidth: "1.4" }), _jsx("path", { d: "M2.3 6.9h11.4M5.8 2.4v2.3M10.2 2.4v2.3", stroke: "currentColor", strokeWidth: "1.4", strokeLinecap: "round" })] }));
}
/**
 * The finished pill's badge: a filled disc with a knocked-out check.
 *
 * The disc is the pill's own ink, so the two are one colour; the check is
 * knocked out in the surface colour (`--wb-on-accent`), which is what keeps it
 * legible in either theme without a second palette.
 */
function CheckBadgeGlyph() {
    return (_jsxs("svg", { width: "12", height: "12", viewBox: "0 0 16 16", fill: "none", "aria-hidden": "true", children: [_jsx("circle", { cx: "8", cy: "8", r: "6.9", fill: "currentColor" }), _jsx("path", { d: "m5 8.2 2 2 4-4.2", stroke: "var(--wb-on-accent)", strokeWidth: "1.7", strokeLinecap: "round", strokeLinejoin: "round" })] }));
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
function SendGlyph() {
    return (_jsx("svg", { width: "14", height: "14", viewBox: "0 0 1024 1024", fill: "currentColor", "aria-hidden": "true", children: _jsx("path", { d: "M826.709333 142.336a32 32 0 0 1 46.72 32.128l-78.293333 656.981333a32 32 0 0 1-44.672 25.472l-202.069333-89.130666-106.965334 108.074666a32 32 0 0 1-54.442666-18.133333L386.688 853.333333v-158.805333l-250.453333-131.669333a32 32 0 0 1-4.053334-54.144l4.010667-2.474667z m-28.629333 123.434667l-342.186667 429.397333a32.085333 32.085333 0 0 1-5.12 5.12l-0.085333 75.221333 67.712-68.394666a32 32 0 0 1 31.018667-8.405334l4.650666 1.664 182.613334 80.512 61.397333-515.114666z m-91.562667 12.202666L219.818667 534.485333l198.912 104.618667 287.786666-361.130667z" }) }));
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
function SummaryGlyph() {
    return (_jsxs("svg", { width: "13", height: "13", viewBox: "0 0 16 16", fill: "none", "aria-hidden": "true", children: [_jsx("rect", { x: "3.1", y: "2.2", width: "9.8", height: "11.6", rx: "2.3", stroke: "currentColor", strokeWidth: "1.4" }), _jsx("path", { d: "M5.8 6.1h4.4M5.8 9.7h2.9", stroke: "currentColor", strokeWidth: "1.4", strokeLinecap: "round" })] }));
}
/**
 * Archive: a box with its lid laid flat and an arrow dropping into it (§9.31).
 *
 * Drawn at the same 13px/stroke-1.4 weight as the row's other glyphs, so the
 * control that replaced delete does not read as a different kind of thing.
 */
function ArchiveGlyph() {
    return (_jsxs("svg", { width: "13", height: "13", viewBox: "0 0 16 16", fill: "none", "aria-hidden": "true", children: [_jsx("rect", { x: "2.4", y: "3", width: "11.2", height: "3.1", rx: "1", stroke: "currentColor", strokeWidth: "1.3", strokeLinejoin: "round" }), _jsx("path", { d: "M3.5 6.1v5.4a1.4 1.4 0 0 0 1.4 1.4h6.2a1.4 1.4 0 0 0 1.4-1.4V6.1", stroke: "currentColor", strokeWidth: "1.3", strokeLinecap: "round", strokeLinejoin: "round" }), _jsx("path", { d: "M8 8.2v3.4M6.5 10.1L8 11.6l1.5-1.5", stroke: "currentColor", strokeWidth: "1.3", strokeLinecap: "round", strokeLinejoin: "round" })] }));
}
/** The empty completion state: a sheet with nothing written on it (§9.31). */
function EmptyGlyph() {
    return (_jsxs("svg", { className: css.emptyGlyph, width: "28", height: "28", viewBox: "0 0 24 24", fill: "none", "aria-hidden": "true", children: [_jsx("rect", { x: "3", y: "4.5", width: "18", height: "15", rx: "4", stroke: "currentColor", strokeWidth: "1.3" }), _jsx("path", { d: "M3 9.5h18M7.5 14h7", stroke: "currentColor", strokeWidth: "1.3", strokeLinecap: "round" })] }));
}
//# sourceMappingURL=WorkbenchTab.js.map