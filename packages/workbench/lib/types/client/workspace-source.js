/**
 * The Client Workspace list, adapted for `useSyncExternalStore`.
 *
 * `ctx.workspaces.list` is a `WorkspaceSource`, and its two members are
 * *prototype* methods that read `this`:
 *
 *     subscribe(listener) { this.listeners.add(listener); ... }
 *     getSnapshot() { this.refreshSnapshot(); return this.snapshotCache }
 *
 * React invokes a `useSyncExternalStore` pair with no receiver, so handing the
 * service object over unchanged throws `Cannot read properties of undefined
 * (reading 'refreshSnapshot')` on the pane's first render.
 *
 * The failure is invisible to `tsc`: `getSnapshot(): { ... }` is a satisfied
 * method signature, and nothing in the type system records that the method needs
 * its receiver. Binding belongs here, at the one boundary where the service
 * enters this plugin, rather than at each call site — this way the injected face
 * is receiver-independent by construction and no consumer has to remember.
 */
/**
 * Wrap a Workspace list so its methods survive being called without a receiver.
 * @param source - the Client's Workspace list, or any equivalent source.
 * @returns a source whose methods are receiver-independent.
 */
export function bindWorkspaceSource(source) {
    return {
        getSnapshot: () => source.getSnapshot(),
        // The unsubscribe closure the service returns captures `this` lexically from
        // this call, so it stays valid even though it outlives the receiver.
        subscribe: listener => source.subscribe(listener),
    };
}
/**
 * The workspace a pane showing this session follows (DESIGN.md §5.3).
 *
 * The pane carries no workspace picker, so this is the only way it can answer
 * "which workspace am I showing": the one the conversation it belongs to sits
 * in. That is the lookup `owningGroupKey` performs in `dsh-client-ui-workspace`
 * — a workspace row lists the sessions it holds — written out here rather than
 * taking that dependency for three lines.
 *
 * There is deliberately no fallback. A fallback would keep the pane populated
 * while it showed work items from a workspace nothing on screen names, which is
 * worse than empty: the reader cannot tell the two apart. A conversation in no
 * workspace is therefore a state the pane renders, not one it papers over.
 * @param items - the Client's Workspace rows.
 * @param sessionId - the session whose pane is asking.
 * @returns the owning workspace id, or undefined when the session is in none.
 */
export function workspaceOfSession(items, sessionId) {
    if (sessionId === undefined)
        return undefined;
    return items.find(item => item.sessionIds.includes(sessionId))?.workspaceId;
}
//# sourceMappingURL=workspace-source.js.map