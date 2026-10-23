/**
 * Specs for the change pipeline: the Host's bus and the Client's follower
 * (DESIGN.md §9.36).
 *
 * Both halves are tested without a wire. The bus is a plain class, and the
 * follower takes its stream opener, its timer, and its panes as arguments —
 * which is the reason `followChanges` is a free function rather than a closure
 * inside `mount.ts`. Retrying and coalescing are the two places where a silent
 * bug looks exactly like "nothing has changed yet", so neither is left to be
 * observed in a browser.
 */
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { WorkbenchChanges } from '../lib/types/changes.js'
import { followChanges } from '../lib/types/client/changes.js'
import type { ChangeTarget } from '../lib/types/client/changes.js'
import type { WorkbenchChange } from '../lib/types/types.js'

/** Take the next queued value from a stream, or fail rather than hang. */
function next(iterator: AsyncIterator<WorkbenchChange>, ms = 500): Promise<WorkbenchChange> {
  let timer: ReturnType<typeof setTimeout> | undefined
  const timeout = new Promise<never>((_resolve, reject) => {
    timer = setTimeout(() => { reject(new Error(`no notice within ${ms}ms`)) }, ms)
  })
  return Promise.race([iterator.next().then((result) => {
    assert.equal(result.done, false, 'the stream ended early')
    return result.value as WorkbenchChange
  }), timeout]).finally(() => { clearTimeout(timer) })
}

/** Let already-queued microtasks and immediates run. */
const settle = (): Promise<void> => new Promise(resolve => setImmediate(resolve))

/** Wait until `check` passes, failing the test rather than hanging. */
async function until(check: () => boolean): Promise<void> {
  for (let tick = 0; tick < 100 && !check(); tick += 1) await settle()
  assert.ok(check(), 'the condition never became true')
}

describe('WorkbenchChanges', () => {
  it('delivers a published write to an open watcher', async () => {
    const changes = new WorkbenchChanges()
    const iterator = changes.watch(new AbortController().signal)[Symbol.asyncIterator]()
    changes.publish('w1', '2024-01-01T00:00:00.000Z')
    assert.deepEqual(await next(iterator), {
      workspaceId: 'w1',
      revision: 1,
      at: '2024-01-01T00:00:00.000Z',
    })
  })

  it('numbers notices in order across workspaces', async () => {
    const changes = new WorkbenchChanges()
    const iterator = changes.watch(new AbortController().signal)[Symbol.asyncIterator]()
    changes.publish('a')
    changes.publish('b')
    const first = await next(iterator)
    const second = await next(iterator)
    assert.deepEqual([first.workspaceId, second.workspaceId], ['a', 'b'])
    assert.ok(second.revision > first.revision, 'the revision must increase with every notice')
  })

  it('coalesces a burst for one workspace into its newest notice', async () => {
    const changes = new WorkbenchChanges()
    const iterator = changes.watch(new AbortController().signal)[Symbol.asyncIterator]()
    // Three writes before the watcher reads once: it needs to hear "re-read",
    // not "re-read three times", and the newest notice is the one that says the
    // list as it now stands is stale.
    changes.publish('w1')
    changes.publish('w1')
    changes.publish('w1', '2024-01-01T00:00:00.000Z')
    const only = await next(iterator)
    assert.equal(only.revision, 3)
    assert.equal(only.at, '2024-01-01T00:00:00.000Z')
  })

  it('keeps every workspace in a burst rather than only the last', async () => {
    const changes = new WorkbenchChanges()
    const iterator = changes.watch(new AbortController().signal)[Symbol.asyncIterator]()
    changes.publish('a')
    changes.publish('b')
    changes.publish('a')
    // Two workspaces changed; coalescing is per workspace, so `b` survives a
    // second write to `a`.
    const seen = new Set<string>()
    seen.add((await next(iterator)).workspaceId)
    seen.add((await next(iterator)).workspaceId)
    assert.deepEqual([...seen].sort(), ['a', 'b'])
  })

  it('ignores an empty workspace, which no record can belong to', async () => {
    const changes = new WorkbenchChanges()
    const iterator = changes.watch(new AbortController().signal)[Symbol.asyncIterator]()
    changes.publish('')
    changes.publish('w1')
    assert.equal((await next(iterator)).workspaceId, 'w1', 'only the named workspace arrives')
  })

  it('removes a watcher the moment its carrier aborts', async () => {
    const changes = new WorkbenchChanges()
    const controller = new AbortController()
    const iterator = changes.watch(controller.signal)[Symbol.asyncIterator]()
    assert.equal(changes.watcherCount, 1)
    controller.abort()
    assert.deepEqual(await iterator.next(), { done: true, value: undefined })
    // A closed watcher left in the set would keep a parked generator alive for
    // as long as the Host runs — one leak per closed pane.
    assert.equal(changes.watcherCount, 0)
    changes.publish('w1')
    assert.equal(changes.watcherCount, 0)
  })

  it('serves two watchers the same notice', async () => {
    const changes = new WorkbenchChanges()
    const one = changes.watch(new AbortController().signal)[Symbol.asyncIterator]()
    const two = changes.watch(new AbortController().signal)[Symbol.asyncIterator]()
    changes.publish('w1')
    assert.equal((await next(one)).revision, 1)
    assert.equal((await next(two)).revision, 1)
  })
})

describe('followChanges', () => {
  /** A pane that records the refreshes it was asked for. */
  function pane(workspaceId: string, reloaded: string[]): ChangeTarget {
    return { workspaceId, refresh: () => reloaded.push(workspaceId) }
  }

  it('re-reads only the pane showing the workspace that changed', async () => {
    const controller = new AbortController()
    const reloaded: string[] = []
    let deliver: ((change: WorkbenchChange) => void) | undefined
    let opened = false
    const running = followChanges({
      open: () => (async function* (): AsyncIterable<WorkbenchChange> {
        opened = true
        const change = await new Promise<WorkbenchChange | undefined>(resolve => { deliver = resolve })
        if (change !== undefined) yield change
        await new Promise<void>(resolve => { controller.signal.addEventListener('abort', () => { resolve() }) })
      })(),
      targets: () => [pane('w1', reloaded), pane('w2', reloaded), pane('', reloaded)],
      signal: controller.signal,
      wait: () => Promise.resolve(),
    })
    await until(() => opened)
    deliver?.({ workspaceId: 'w1', revision: 1, at: '2024-01-01T00:00:00.000Z' })
    await until(() => reloaded.length > 0)
    // An unset pane (`''`) is never a target: nothing is on screen to re-read.
    assert.deepEqual(reloaded, ['w1'])
    controller.abort()
    assert.equal(await running, 'aborted')
  })

  it('re-reads every pane after a reconnect, because notices from the gap are gone', async () => {
    const controller = new AbortController()
    const reloaded: string[] = []
    let opens = 0
    const running = followChanges({
      open: () => {
        opens += 1
        // The first generation dies at once; the second parks until abort.
        if (opens === 1) {
          return (async function* (): AsyncIterable<WorkbenchChange> {
            throw new Error('carrier went away')
          })()
        }
        return (async function* (): AsyncIterable<WorkbenchChange> {
          await new Promise<void>(resolve => { controller.signal.addEventListener('abort', () => { resolve() }) })
        })()
      },
      targets: () => [pane('w1', reloaded)],
      signal: controller.signal,
      onError: () => {},
      wait: () => Promise.resolve(),
    })
    await until(() => opens === 2)
    // The first open is not a reconnect; the second is, and it must re-read.
    assert.deepEqual(reloaded, ['w1'])
    controller.abort()
    assert.equal(await running, 'aborted')
  })

  it('gives up after a bounded number of failures instead of retrying forever', async () => {
    const controller = new AbortController()
    let opens = 0
    const errors: string[] = []
    const outcome = await followChanges({
      open: () => {
        opens += 1
        return (async function* (): AsyncIterable<WorkbenchChange> {
          throw new Error(`offline ${opens}`)
        })()
      },
      targets: () => [],
      signal: controller.signal,
      onError: error => errors.push((error as Error).message),
      wait: () => Promise.resolve(),
    })
    assert.equal(outcome, 'gave-up')
    assert.equal(opens, 9, 'one attempt plus eight retries')
    assert.equal(errors.length, 9, 'every failure reaches the log')
  })

  it('stops without another attempt once the plugin is disposed', async () => {
    const controller = new AbortController()
    let opens = 0
    const running = followChanges({
      open: () => {
        opens += 1
        return (async function* (): AsyncIterable<WorkbenchChange> {
          throw new Error('offline')
        })()
      },
      targets: () => [],
      signal: controller.signal,
      wait: () => { controller.abort(); return Promise.resolve() },
    })
    assert.equal(await running, 'aborted')
    assert.equal(opens, 1)
  })
})
