/**
 * The workbench tab guardian: when a reconcile opens the tab, and when it must not.
 *
 * The guardian stands in for a platform feature that does not exist — a tab type
 * cannot declare itself unclosable — so its behaviour IS the ruling. `open:
 * false` is not "nothing happened"; it is "the sidebar stays exactly as the user
 * left it", which is the whole difference between a permanent tab and a sidebar
 * that reopens itself. Each guard is asserted on its own because each one fails
 * differently and silently: a collapsed column is a sidebar that opens by
 * itself, an empty pane is a session that loses 开始 for good, and a missing kind
 * check is a tab that steals focus on every unrelated commit.
 *
 * The wiring is driven through a fake controller face, which is how the two
 * properties a live GUI would hide get asserted: opening converges instead of
 * looping, and a disposed guardian is silent.
 *
 * Runs against `src/` rather than `lib/`: this is client wiring, and the client
 * bundle imports React, CSS, and the Remote. `guard.ts` has no runtime imports
 * at all, which is what makes that possible.
 */
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { WORKBENCH_KIND } from '../src/client/definition.ts'
import { guardWorkbenchTab, ruleWorkbenchTab } from '../src/client/guard.ts'
import type { WorkbenchTabScreen, WorkbenchTabSidebar } from '../src/client/guard.ts'

/** The ordinary screen: 开始 seeded in an expanded column. */
function screen(overrides: Partial<WorkbenchTabScreen> = {}): WorkbenchTabScreen {
  return { expanded: true, kinds: ['guide'], ...overrides }
}

describe('ruleWorkbenchTab', () => {
  it('opens beside the seeded guide', () => {
    assert.deepEqual(ruleWorkbenchTab(screen(), WORKBENCH_KIND), { open: true })
  })

  it('leaves a collapsed column closed', () => {
    // Opening a tab expands the column, so this is the rule that keeps the
    // plugin from opening the sidebar on the user's behalf.
    assert.deepEqual(ruleWorkbenchTab(screen({ expanded: false }), WORKBENCH_KIND), { open: false })
  })

  it('leaves an unseeded pane to the seed', () => {
    // Racing the seed for the empty root pane would cost the session its guide.
    assert.deepEqual(ruleWorkbenchTab(screen({ kinds: [] }), WORKBENCH_KIND), { open: false })
  })

  it('does nothing without an on-screen session', () => {
    assert.deepEqual(ruleWorkbenchTab(undefined, WORKBENCH_KIND), { open: false })
  })

  it('does not open a second copy', () => {
    assert.deepEqual(
      ruleWorkbenchTab(screen({ kinds: ['guide', WORKBENCH_KIND] }), WORKBENCH_KIND),
      { open: false },
    )
  })

  it('does not open a second copy of a floated tab', () => {
    // `tabsIn` reports every pane, so a floated or dropped copy still counts.
    assert.deepEqual(
      ruleWorkbenchTab(screen({ kinds: [WORKBENCH_KIND, 'guide'] }), WORKBENCH_KIND),
      { open: false },
    )
  })

  it('matches the kind exactly', () => {
    assert.deepEqual(
      ruleWorkbenchTab(screen({ kinds: ['guide', `${WORKBENCH_KIND}-notes`] }), WORKBENCH_KIND),
      { open: true },
    )
  })
})

/** One fake controller face, plus the handles a test pulls to move the sidebar. */
function fakeSidebar(initial: {
  onScreen?: boolean
  expanded?: boolean
  kinds?: readonly string[]
}) {
  const listeners = new Set<() => void>()
  const state = {
    onScreen: initial.onScreen ?? true,
    expanded: initial.expanded ?? true,
    kinds: [...(initial.kinds ?? ['guide'])],
  }
  const opened: string[] = []
  const failures: string[] = []
  let refuseOpen = false

  /** The real store commits a new page set on open, so an open re-enters the guardian. */
  const publish = (): void => {
    for (const listener of [...listeners]) listener()
  }

  const subscribe = (listener: () => void): (() => void) => {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }

  const sidebar: WorkbenchTabSidebar = {
    onScreen: () => (state.onScreen ? { expanded: state.expanded, kinds: [...state.kinds] } : undefined),
    openOnScreen: kind => {
      if (refuseOpen) throw new Error('session store is not adopted')
      opened.push(kind)
      if (!state.kinds.includes(kind)) state.kinds.push(kind)
      publish()
    },
    tabs: { subscribe },
    mounted: { subscribe },
  }

  return {
    sidebar,
    state,
    opened,
    failures,
    publish,
    refuseOpen: () => {
      refuseOpen = true
    },
    listenerCount: () => listeners.size,
  }
}

/** Let the guardian's scheduled microtask run, and whatever it schedules in turn. */
async function settle(): Promise<void> {
  await null
  await null
}

describe('guardWorkbenchTab', () => {
  it('opens the tab when the sidebar seeds its first page', async () => {
    // The user's first expansion: the pane is empty, the store seeds 开始, that
    // commit publishes, and the workbench arrives beside it in the same beat.
    const fake = fakeSidebar({ kinds: [] })
    const stop = guardWorkbenchTab(fake.sidebar, WORKBENCH_KIND, message => {
      fake.failures.push(message)
    })
    await settle()
    assert.deepEqual(fake.opened, [], 'the seed has not happened yet')

    fake.state.kinds.push('guide')
    fake.publish()
    await settle()

    assert.deepEqual(fake.opened, [WORKBENCH_KIND])
    assert.deepEqual(fake.state.kinds, ['guide', WORKBENCH_KIND])
    stop()
  })

  it('reopens the tab after the user closes it', async () => {
    const fake = fakeSidebar({ kinds: ['guide', WORKBENCH_KIND] })
    const stop = guardWorkbenchTab(fake.sidebar, WORKBENCH_KIND, message => {
      fake.failures.push(message)
    })
    await settle()
    assert.deepEqual(fake.opened, [], 'already open: nothing to do')

    fake.state.kinds = ['guide']
    fake.publish()
    await settle()

    assert.deepEqual(fake.opened, [WORKBENCH_KIND])
    stop()
  })

  it('stays out of a collapsed sidebar', async () => {
    const fake = fakeSidebar({ expanded: false, kinds: ['guide'] })
    const stop = guardWorkbenchTab(fake.sidebar, WORKBENCH_KIND, message => {
      fake.failures.push(message)
    })
    await settle()
    fake.publish()
    await settle()
    assert.deepEqual(fake.opened, [])
    stop()
  })

  it('converges instead of looping', async () => {
    // Every open republishes the inventory, which re-enters the guardian. The
    // second pass must find the kind present and stop.
    const fake = fakeSidebar({ kinds: ['guide'] })
    const stop = guardWorkbenchTab(fake.sidebar, WORKBENCH_KIND, message => {
      fake.failures.push(message)
    })
    await settle()
    fake.publish()
    await settle()

    assert.equal(fake.opened.length, 1)
    stop()
  })

  it('stays quiet after disposal', async () => {
    const fake = fakeSidebar({ kinds: ['guide'] })
    const stop = guardWorkbenchTab(fake.sidebar, WORKBENCH_KIND, message => {
      fake.failures.push(message)
    })
    await settle()
    stop()
    assert.equal(fake.listenerCount(), 0, 'both subscriptions are released')

    fake.state.kinds = ['guide']
    fake.publish()
    await settle()
    assert.deepEqual(fake.opened, [WORKBENCH_KIND], 'and nothing new opens')
  })

  it('reports a failed open instead of throwing', async () => {
    const fake = fakeSidebar({ kinds: ['guide'] })
    fake.refuseOpen()
    const stop = guardWorkbenchTab(fake.sidebar, WORKBENCH_KIND, message => {
      fake.failures.push(message)
    })
    await settle()

    assert.equal(fake.failures.length, 1)
    assert.match(fake.failures[0] ?? '', /could not open/)
    stop()
  })
})
