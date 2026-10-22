/**
 * Regression guard for the pane's first render.
 *
 * `ctx.workspaces.list` is a service whose `getSnapshot()` and `subscribe()` are
 * prototype methods that read `this`, while React calls a `useSyncExternalStore`
 * pair with no receiver. Handing the service over unchanged therefore threw
 * `Cannot read properties of undefined (reading 'refreshSnapshot')` — and it
 * survived `tsc`, because `getSnapshot(): { ... }` is a satisfied method
 * signature. Only a runtime test pins the binding down.
 */
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { bindWorkspaceSource, workspaceOfSession } from '../lib/types/client/workspace-source.js'
import type { WorkspaceListItem, WorkspaceListSource } from '../lib/types/client/workspace-source.js'

/** Stand-in for the Client's list: prototype methods that read `this`. */
class ServiceLike implements WorkspaceListSource {
  readonly items: readonly WorkspaceListItem[] = [
    { workspaceId: 'w1', path: 'D:/w', title: 'w', sessionIds: ['s1'] },
  ]

  readonly listeners = new Set<() => void>()

  refreshCount = 0

  /** Mirrors the controller's own private step, which is what read `this`. */
  refreshSnapshot(): void {
    this.refreshCount += 1
  }

  getSnapshot(): { readonly items: readonly WorkspaceListItem[] } {
    this.refreshSnapshot()
    return { items: this.items }
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }
}

describe('workspace source binding', () => {
  it('reproduces the hazard: the raw service throws without its receiver', () => {
    const raw = new ServiceLike()
    const unbound = raw.getSnapshot
    assert.throws(() => unbound(), { name: 'TypeError' })
  })

  it('keeps getSnapshot working after the receiver is lost', () => {
    const raw = new ServiceLike()
    const bound = bindWorkspaceSource(raw)
    const detached = bound.getSnapshot
    assert.deepEqual(detached(), { items: raw.items })
    assert.equal(raw.refreshCount, 1)
  })

  it('keeps subscribe and its unsubscriber working after the receiver is lost', () => {
    const raw = new ServiceLike()
    const bound = bindWorkspaceSource(raw)
    const detached = bound.subscribe
    let hits = 0
    const off = detached(() => {
      hits += 1
    })
    for (const listener of raw.listeners) listener()
    assert.equal(hits, 1)
    off()
    assert.equal(raw.listeners.size, 0)
  })

  it('forwards the live items rather than a copy taken at bind time', () => {
    const raw = new ServiceLike()
    const before = bindWorkspaceSource(raw)
    ;(raw.items as WorkspaceListItem[]).push({ workspaceId: 'w2', path: 'D:/x', title: 'x', sessionIds: [] })
    assert.equal(before.getSnapshot().items.length, 2)
  })
})

describe('workspace following', () => {
  const items: readonly WorkspaceListItem[] = [
    { workspaceId: 'w1', path: 'D:/one', title: 'one', sessionIds: ['s1', 's2'] },
    { workspaceId: 'w2', path: 'D:/two', title: 'two', sessionIds: ['s3'] },
  ]

  it('follows a conversation into its workspace', () => {
    assert.equal(workspaceOfSession(items, 's3'), 'w2')
  })

  it('takes the row order when a session appears in more than one workspace', () => {
    // `sessionIds` is the workspace's membership list, so one session listed twice
    // is the list contradicting itself; the first row wins and this records that.
    const overlapping: readonly WorkspaceListItem[] = [
      ...items,
      { workspaceId: 'w3', path: 'D:/three', title: 'three', sessionIds: ['s1'] },
    ]
    assert.equal(workspaceOfSession(overlapping, 's1'), 'w1')
  })

  it('never falls back to a workspace the conversation is not in', () => {
    // The pane names no workspace of its own, so a fallback would show work items
    // from somewhere the reader cannot identify. These three render an empty state.
    assert.equal(workspaceOfSession(items, 's9'), undefined)
    assert.equal(workspaceOfSession(items, undefined), undefined)
    assert.equal(workspaceOfSession([], 's1'), undefined)
  })
})
