/** How long a keystroke waits before it becomes a query. */
const QUERY_DEBOUNCE_MS = 250;
/** An empty snapshot for a workspace nothing has loaded yet. */
function blank(workspaceId) {
    return {
        workspaceId,
        query: '',
        filter: 'all',
        phase: 'idle',
        items: [],
        total: 0,
        counts: { all: 0, active: 0, done: 0, archived: 0 },
        error: null,
    };
}
/** Which tier total a record contributes to; mirrors the Host's `search` tally. */
function tierOf(item) {
    if (item.archived)
        return 'archived';
    return item.status === 'done' ? 'done' : 'active';
}
/**
 * Move one record's contribution into or out of the tier totals.
 *
 * Local writes are merged into the snapshot rather than re-queried (refresh
 * tier 1), so the counts have to move with them or the filter row would keep
 * advertising the totals it had before the write.
 * @param counts - totals before the change.
 * @param item - the record being added or removed.
 * @param delta - `1` when the record appears, `-1` when it goes away.
 * @returns the adjusted totals.
 */
function tally(counts, item, delta) {
    const tier = tierOf(item);
    const moved = (value) => Math.max(0, value + delta);
    return {
        // `all` is the non-archived total, so archiving leaves it alone.
        all: tier === 'archived' ? counts.all : moved(counts.all),
        active: tier === 'active' ? moved(counts.active) : counts.active,
        done: tier === 'done' ? moved(counts.done) : counts.done,
        archived: tier === 'archived' ? moved(counts.archived) : counts.archived,
    };
}
/** Translate a filter tier into the Host's filter fields. */
export function filterToRequest(filter) {
    switch (filter) {
        // The three daily tiers. `active` covers both unfinished statuses; `done` is
        // the third; none of them may show an archived item.
        case 'active':
            return { status: ['open', 'in_progress'], archived: 'exclude' };
        case 'done':
            return { status: ['done'], archived: 'exclude' };
        // The history tier: an archived item is shown whatever its status, because
        // archiving records where an item came from, not how far it got.
        case 'archived':
            return { archived: 'only' };
        case 'all':
            return { archived: 'exclude' };
    }
}
/** Replace one record in a list, leaving the list untouched when it holds none. */
function replace(items, next) {
    const at = items.findIndex(item => item.id === next.id);
    if (at < 0)
        return items;
    const copy = items.slice();
    copy[at] = next;
    return copy;
}
/**
 * Snapshot store for the workbench pane.
 *
 * One snapshot per workspace, kept in a map, so returning to a workspace shows
 * the list it had rather than an empty one while the query is in flight
 * (DESIGN.md §5.5).
 */
export class WorkbenchStore {
    gateway;
    cache = new Map();
    listeners = new Set();
    activeId = '';
    queryTimer;
    /**
     * Bumped on every load; a response whose generation is stale is dropped.
     *
     * Without this, switching workspace quickly can let a slow answer for the
     * previous workspace overwrite the new one — the classic out-of-order load.
     */
    generation = 0;
    /** @param gateway - the Remote calls this store drives. */
    constructor(gateway) {
        this.gateway = gateway;
    }
    /**
     * @returns the active workspace's snapshot; never undefined.
     *
     * The fallback must NOT build an uncached `blank(...)` per call: React's
     * `useSyncExternalStore` compares the value it saw at the last render with the
     * value it reads at the next commit, and a fresh object every read is a
     * "store changed" in its eyes even when nothing published — the pane then
     * re-renders itself forever and dies as React #185 (§9.24). Seeding the empty
     * snapshot into the cache gives every `activeId` one stable identity, and the
     * later `setWorkspace`'s merge (`patch`) reads and rewrites that same entry.
     */
    getSnapshot = () => {
        const cached = this.cache.get(this.activeId);
        if (cached !== undefined)
            return cached;
        const seeded = blank(this.activeId);
        this.cache.set(this.activeId, seeded);
        return seeded;
    };
    /** @param listener - called on any change to the active snapshot. @returns unsubscribe. */
    subscribe = (listener) => {
        this.listeners.add(listener);
        return () => { this.listeners.delete(listener); };
    };
    /** The workspace every call is currently scoped to. */
    get workspaceId() {
        return this.activeId;
    }
    /** Stop the pending query timer. */
    dispose() {
        if (this.queryTimer !== undefined)
            clearTimeout(this.queryTimer);
        this.listeners.clear();
    }
    /**
     * Point the pane at a workspace, loading it when its snapshot is not ready.
     * @param workspaceId - workspace to show; `''` clears the pane.
     */
    setWorkspace(workspaceId) {
        if (workspaceId === this.activeId)
            return;
        this.activeId = workspaceId;
        this.publish();
        const cached = this.cache.get(workspaceId);
        // A cached snapshot is shown at once, then refreshed: it is a starting point,
        // not an authority, since another session may have written since it was taken.
        if (cached !== undefined && cached.phase === 'ready')
            void this.load();
        else if (workspaceId !== '')
            void this.load();
    }
    /**
     * Set the query text and schedule a reload.
     * @param query - raw search text.
     */
    setQuery(query) {
        const current = this.getSnapshot();
        if (current.query === query)
            return;
        this.patch({ query });
        if (this.queryTimer !== undefined)
            clearTimeout(this.queryTimer);
        this.queryTimer = setTimeout(() => { this.queryTimer = undefined; void this.load(); }, QUERY_DEBOUNCE_MS);
    }
    /**
     * Switch filter tier and reload at once: a click is deliberate, unlike a
     * keystroke, so it should not wait.
     * @param filter - tier to show.
     */
    setFilter(filter) {
        if (this.getSnapshot().filter === filter)
            return;
        this.patch({ filter });
        void this.load();
    }
    /** Reload the active workspace, keeping the current list on screen meanwhile. */
    async refresh() {
        await this.load();
    }
    /**
     * Create an item in the active workspace and show it without a re-query.
     * @param title - non-blank title; the Host trims and rejects a blank one.
     * @param desc - initial description.
     * @param tag - initial tag.
     * @returns the Host's result union, for the caller to report.
     */
    async create(title, desc, tag) {
        const result = await this.gateway.create({
            workspaceId: this.activeId, title, desc, tag,
        });
        if (result.code === 'ok')
            this.admit(result.item);
        return result;
    }
    /**
     * Replace an item's description.
     * @param item - the item being edited; its `updateAt` is the compare-and-swap token.
     * @param desc - new description.
     * @returns the Host's result union.
     */
    async setDesc(item, desc) {
        if (desc === item.desc)
            return { code: 'ok', item };
        const result = await this.gateway.setDesc({
            id: item.id, workspaceId: this.activeId, desc, expectedUpdateAt: item.updateAt,
        });
        await this.settle(result);
        return result;
    }
    /**
     * Replace an item's title and/or tag.
     * @param item - the item being edited; its `updateAt` is the compare-and-swap token.
     * @param next - the fields to change.
     * @returns the Host's result union.
     */
    async update(item, next) {
        if (next.title === item.title && next.tag === item.tag)
            return { code: 'ok', item };
        const result = await this.gateway.update({
            id: item.id, workspaceId: this.activeId, expectedUpdateAt: item.updateAt,
            ...(next.title === undefined ? {} : { title: next.title }),
            ...(next.tag === undefined ? {} : { tag: next.tag }),
        });
        await this.settle(result);
        return result;
    }
    /**
     * Ask the Host to write this item back: the `open → in_progress` edge, or its
     * retry (DESIGN.md §4.5).
     *
     * No summary is written here and none is faked. On the retry edge the Host
     * returns the record untouched, so a second press neither conflicts with the
     * first nor refreshes the item's clock — which is why nothing in this call has
     * to special-case a repeat.
     * @param item - the item to push; its `updateAt` is the compare-and-swap token.
     * @returns the Host's result union.
     */
    async requestComplete(item) {
        const result = await this.gateway.requestComplete({
            id: item.id, workspaceId: this.activeId, expectedUpdateAt: item.updateAt,
        });
        await this.settle(result);
        return result;
    }
    /**
     * Delete an item for good. Archiving is a different thing (DESIGN.md §4.7).
     * @param id - item to remove.
     * @returns the Host's result union.
     */
    async remove(id) {
        const result = await this.gateway.delete({ id, workspaceId: this.activeId });
        if (result.code === 'ok') {
            const current = this.getSnapshot();
            const gone = current.items.find(item => item.id === id);
            this.patch({
                items: current.items.filter(item => item.id !== id),
                total: Math.max(0, current.total - 1),
                counts: gone === undefined ? current.counts : tally(current.counts, gone, -1),
            });
        }
        return result;
    }
    /**
     * Apply a write result to the snapshot.
     *
     * With no query in force the returned record is merged directly. With one, the
     * write may have changed whether the item still matches, and only the Host can
     * say, so a refresh runs instead.
     * @param result - the write's result union.
     */
    async settle(result) {
        if (result.code !== 'ok')
            return;
        if (this.getSnapshot().query !== '') {
            await this.load();
            return;
        }
        this.admit(result.item);
    }
    /** Merge a created or changed record into the active list, in place. */
    admit(item) {
        const current = this.getSnapshot();
        const known = current.items.some(existing => existing.id === item.id);
        this.patch({
            items: known ? replace(current.items, item) : [item, ...current.items],
            total: known ? current.total : current.total + 1,
            // A field edit cannot move a record between tiers, so only an arrival
            // changes the totals; `adoptConflict` handles the case where it did.
            counts: known ? current.counts : tally(current.counts, item, 1),
        });
    }
    /**
     * Install the Host's version of a record after a conflict.
     *
     * The user's edit lost, but the pane must not keep showing the stale copy it
     * was editing — otherwise the next attempt fails the same way. The Host
     * returns the winning record precisely so this can happen.
     * @param item - the record the Host reports as current.
     */
    adoptConflict(item) {
        const current = this.getSnapshot();
        const previous = current.items.find(existing => existing.id === item.id);
        if (previous === undefined)
            return;
        this.patch({
            items: replace(current.items, item),
            // The winning record may have moved tier — a model write-back completes an
            // item, which takes it out of `active` — so retally both sides.
            counts: tally(tally(current.counts, previous, -1), item, 1),
        });
    }
    /** Read the active workspace from the Host. */
    async load() {
        const workspaceId = this.activeId;
        if (workspaceId === '')
            return;
        const generation = ++this.generation;
        const current = this.getSnapshot();
        this.patch({ phase: current.phase === 'ready' ? 'ready' : 'loading' });
        try {
            const value = await this.gateway.search({
                workspaceId,
                query: current.query,
                ...filterToRequest(current.filter),
            });
            if (generation !== this.generation)
                return;
            this.patch({
                phase: 'ready',
                items: value.items,
                total: value.total,
                counts: value.counts,
                error: null,
            });
        }
        catch (error) {
            if (generation !== this.generation)
                return;
            this.patch({ phase: 'error', error: describe(error) });
        }
    }
    /** Merge a partial change into the active snapshot and notify. */
    patch(change) {
        const next = { ...this.getSnapshot(), ...change };
        this.cache.set(this.activeId, next);
        this.publish();
    }
    /** Wake every subscriber. */
    publish() {
        for (const listener of this.listeners)
            listener();
    }
}
/** Turn a thrown value into the shape the error banner renders. */
export function describe(error) {
    if (typeof error === 'object' && error !== null) {
        const candidate = error;
        const message = typeof candidate.message === 'string' && candidate.message !== ''
            ? candidate.message
            : String(error);
        return { code: typeof candidate.code === 'string' ? candidate.code : 'unknown', message };
    }
    return { code: 'unknown', message: String(error) };
}
/**
 * Render items as a Markdown checklist, for the tab menu's copy action.
 * @param items - records to render, in the order shown.
 * @returns a Markdown document, one bullet per item.
 */
export function toMarkdown(items) {
    if (items.length === 0)
        return '';
    const lines = items.map(item => {
        const box = item.status === 'done' ? '[x]' : '[ ]';
        const tag = item.tag === '' ? '' : ` \`${item.tag}\``;
        const archived = item.archived ? ' _(archived)_' : '';
        const head = `- ${box} **${item.title}**${tag}${archived}`;
        if (item.desc === '')
            return head;
        // Indent the body so it stays inside the bullet rather than becoming a
        // second paragraph that visually leaves the item.
        return `${head}\n${item.desc.split('\n').map(line => `  ${line}`).join('\n')}`;
    });
    return `${lines.join('\n')}\n`;
}
//# sourceMappingURL=store.js.map