/**
 * The snapshot store's stability promise to `useSyncExternalStore` (DESIGN.md §9.24).
 *
 * `WorkbenchTab` subscribes with `store.getSnapshot` as-is, so every read of an
 * unseen ActiveWorkSpace must return ONE object: two different `blank(...)`s of the
 * same shape are a "store change" in React's eyes, and the pane then re-renders
 * itself past the nesting limit and dies as React #185 — with the placeholder face
 * of a crashed slot on screen and no user action anywhere near it (§9.24).
 *
 * Runs on Node's built-in runner (`pnpm test`), against the built artifact, so the
 * promise is checked as shipped rather than as typed.
 */
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { WorkbenchStore } from '../lib/types/client/store.js'

/** A gateway that answers a settled empty search and throws elsewhere. */
const gateway = {
  search: async request => ({
    items: [],
    total: 0,
    counts: { all: 0, active: 0, done: 0, archived: 0 },
  }),
  create: async request => { throw new Error('spec: unused') },
  setDesc: async request => { throw new Error('spec: unused') },
  update: async request => { throw new Error('spec: unused') },
  archive: async request => { throw new Error('spec: unused') },
  requestComplete: async request => { throw new Error('spec: unused') },
  delete: async request => { throw new Error('spec: unused') },
}

describe('snapshot identity', () => {
  it('seeds an unseen workspace with one stable snapshot', () => {
    // Two reads of a snapshot the store has not loaded yet: the fallback MUST
    // cache its empty seed, not mint a fresh `blank(...)` per call (§9.24).
    const store = new WorkbenchStore(gateway)
    assert.equal(store.getSnapshot(), store.getSnapshot())
  })

  it('keeps one identity across a workspace switch while the load is in flight', async () => {
    // The switch publishes an idle snapshot before `load()`'s first await; the
    // window between the publish and the settle must still read as one object.
    const store = new WorkbenchStore(gateway)
    assert.equal(store.getSnapshot(), store.getSnapshot())
    const switching = store.setWorkspace('1e07a497')
    assert.equal(store.getSnapshot(), store.getSnapshot())
    await switching
    assert.equal(store.getSnapshot(), store.getSnapshot())
  })

  it('returns the settled snapshot with the same identity', async () => {
    const store = new WorkbenchStore(gateway)
    await store.setWorkspace('1e07a497')
    assert.equal(store.getSnapshot(), store.getSnapshot())
  })
})
