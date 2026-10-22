/**
 * Headless reproduction rig for the workbench tab, against the REAL React the
 * desktop build ships (18.3.1, development) and the REAL compiled client modules
 * from `lib/types/client/` — no mocks for our own code, only for the Host seams
 * (gateway, workspace list, locale, tab visibility, sessions).
 *
 * Drives the pane through the sequences a reload can hit and reports what React
 * would throw in production as "Maximum update depth exceeded" (#185):
 * in the development build that failure arrives as a console error with the full
 * component stack, which is exactly the evidence the minified page swallowed.
 *
 * Exit code 0 = no loop anywhere; 1 = a loop was seen (with its captured stack).
 *
 * Run:
 *   node --import=file:///D:/Workbase/dsh-plugins/dsh-plugin-workbench/repro/register-hooks.mjs ^
 *        D:\Workbase\dsh-plugins\dsh-plugin-workbench\repro\harness.mjs
 * (NODE_ENV=development; `--import` takes a file:// URL, not a bare Windows path.)
 */
import { createRequire } from 'node:module'

const PLUGIN = 'D:/Workbase/dsh-plugins/dsh-plugin-workbench'
const DSH = 'D:/Workbase/deepseek-harness'

const requirePlugin = createRequire(`${PLUGIN}/packages/workbench/lib/types/client/x.js`)
const requireDSH = createRequire(`${DSH}/package.json`)
const requireWeb = createRequire(`${DSH}/apps/web/package.json`)

// One React, before anything else loads: the loader sends the compiled modules'
// imports here, so these require calls and the ESM imports below share instances.
const React = requireWeb('react')
const { createRoot } = requireWeb('react-dom/client')

// --- DOM environment -------------------------------------------------------
const { JSDOM } = requireDSH('jsdom')
const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
  url: 'http://localhost/',
  pretendToBeVisual: true,
})
// Node 24 seeds some web globals itself (navigator et al.) with getter-only
// properties; only overwrite what actually needs overwriting, and skip the rest.
const defineGlobal = (key, value) => {
  try {
    Object.defineProperty(globalThis, key, { value, configurable: true, writable: true })
  } catch { globalThis[key] = value }
}
defineGlobal('window', dom.window)
defineGlobal('document', dom.window.document)
defineGlobal('navigator', dom.window.navigator)
for (const key of ['HTMLElement', 'Element', 'Node', 'MouseEvent', 'focus', 'getComputedStyle']) {
  if (dom.window[key] !== undefined) defineGlobal(key, dom.window[key])
}
// The scheduler prefers the window channel when one exists; keep it consistent.
defineGlobal('MessageChannel', dom.window.MessageChannel)

// --- console capture -------------------------------------------------------
const errors = []
const originalError = console.error
let printed = 0
console.error = (...args) => {
  const text = args.map(a => (typeof a === 'string' ? a : String(a))).join(' ')
  errors.push(text)
  if (printed < 8) {
    printed += 1
    originalError(...args) // full formatted warning + component stack, once each
  }
}

// --- load the REAL compiled modules ----------------------------------------
const { WorkbenchTab } = await import('file:///D:/Workbase/dsh-plugins/dsh-plugin-workbench/packages/workbench/lib/types/client/WorkbenchTab.js')
const { WorkbenchStore } = await import('file:///D:/Workbase/dsh-plugins/dsh-plugin-workbench/packages/workbench/lib/types/client/store.js')
const { queueWriteBack } = await import('file:///D:/Workbase/dsh-plugins/dsh-plugin-workbench/packages/workbench/lib/types/client/write-back.js')
const { zh } = await import('file:///D:/Workbase/dsh-plugins/dsh-plugin-workbench/packages/workbench/lib/types/client/locales.js')

// --- Host seams -------------------------------------------------------------
const SESSION = 'session-945b2035'
const WORKSPACE = 'ws-1'

/** One record, `in_progress` exactly like the live item under test. */
const record = {
  id: '2855e7e4-408f-420a-9cdd-fce5c4c74c96',
  workspaceId: WORKSPACE,
  workspacePath: 'D:\\Workbase\\dsh-plugins\\dsh-plugin-workbench',
  title: '继续P3开发',
  desc: '',
  tag: 'DSH插件',
  status: 'in_progress',
  archived: false,
  updateAt: '2026-10-15T01:44:14.402Z',
  createdAt: '2026-10-12T15:26:52.991Z',
}

/** What the gateway currently answers `search` with; the harness flips it. */
let shelf = [[{ ...record }]]
const gateway = {
  search: async request => {
    const items = shelf[shelfIndex(request.status)] ?? []
    return { items, total: items.length, counts: { all: items.length, active: items.filter(i => i.status !== 'done').length, done: items.filter(i => i.status === 'done').length, archived: 0 } }
  },
  create: async () => { throw new Error('harness: create not driven') },
  setDesc: async request => ({ code: 'ok', item: { ...record } }),
  update: async request => ({ code: 'ok', item: { ...record } }),
  requestComplete: async request => {
    // §4.5 retry edge on an `in_progress` item: idempotent, no write.
    const copy = { ...record }
    if (copy.status === 'open') { copy.status = 'in_progress' }
    return { code: 'ok', item: copy }
  },
  delete: async () => { throw new Error('harness: delete not driven') },
}
function shelfIndex(statuses) {
  // The fake Host serves one tier: the active list with each record's real status.
  return statuses?.[0] === 'done' ? 1 : 0
}

/** The snapshot that useSyncExternalStore reads; replaced (new object) on publish. */
let wsSnapshot = { items: [] }
const wsListeners = new Set()
const workspaces = {
  getSnapshot: () => wsSnapshot,
  subscribe: listener => { wsListeners.add(listener); return () => wsListeners.delete(listener) },
}
const publishWorkspaces = items => {
  wsSnapshot = { items: items.map(item => ({ ...item, sessionIds: [...item.sessionIds] })) }
  for (const listener of wsListeners) listener()
}

/** The workbench store for the pane's session — the real class, real merge rules. */
const store = new WorkbenchStore(gateway)

/** The write-back's queue face, stubbed one level below §9.23's glue. */
const queue = { prompts: [], reply: { ok: true } }
const readSessions = () => ({
  binding: () => ({
    session: {
      prompt: async (content, mode) => {
        queue.prompts.push({ content: content.map(part => part.text), mode })
        return queue.reply
      },
    },
  }),
})

// --- locale ------------------------------------------------------------------
const t = (key, vars) => {
  const nested = key.split('.').reduce((node, part) => (node ?? {})[part], zh)
  let text = typeof nested === 'string' ? nested : `⟨${key}⟩`
  if (text.includes('{') && vars !== undefined) {
    text = text.replace(/\{(\w+)\}/g, (_, name) => String(vars?.[name] ?? `⟨${name}⟩`))
  }
  return text
}

// --- mount -------------------------------------------------------------------
let tabVisible = true
let forceParent = () => {}
const Parent = () => {
  const [tick, setTick] = React.useState(0)
  forceParent = () => setTick(value => value + 1)
  return React.createElement(WorkbenchTab, {
    sessionId: SESSION,
    useTabInfo: () => ({ tab: { visible: tabVisible } }),
    storeFor: () => store,
    workspaces,
    requestWriteBack: (sessionId, item) => queueWriteBack(readSessions, sessionId, item),
    reportCopyFailure: message => console.error('harness copy failure:', message),
    t,
    key: tick, // remounts the pane as a caller-visible state change would
  })
}

const flush = ms => new Promise(resolve => { window.setTimeout(resolve, ms) })
const sniff = label => {
  const noise = text => text.includes('react redirect:') || text.includes('re redirect')
  const loop = errors.filter(text => !noise(text) && (text.includes('Maximum update depth') || text.includes('getSnapshot')))
  const unique = [...new Set(errors.filter(text => !noise(text)).map(text => text.split('\n')[0].slice(0, 120)))]
  console.log(`\n[${label}] re-renders done. console.error entries: ${errors.length}`)
  for (const line of unique) console.log(`   · ${line}`)
  return loop
}

const root = createRoot(document.getElementById('root'))
root.render(React.createElement(Parent))
await flush(400)
let loops = sniff('mount (no workspace row yet)')

// --- A: the conversation's workspace appears (the follow flips) --------------
publishWorkspaces([{ workspaceId: WORKSPACE, path: 'D:\\x', title: '工作区', sessionIds: [SESSION] }])
await flush(500)
loops = loops.concat(sniff('workspace row arrives'))

// --- B: the session leaves the workspace (follow flips to '') ---------------
publishWorkspaces([])
await flush(700)
loops = loops.concat(sniff('workspace row removed (follow → "")'))

// --- C: click the write-back with the item visible --------------------------
publishWorkspaces([{ workspaceId: WORKSPACE, path: 'D:\\x', title: '工作区', sessionIds: [SESSION] }])
await flush(900) // load() lands, the item card paints
const candidates = [...document.querySelectorAll('button')].map((b, i) => ({ i, text: (b.textContent ?? '').trim(), aria: b.getAttribute('aria-label') ?? b.getAttribute('title') ?? '' }))
console.log(`   buttons: ${candidates.map(c => `[${c.i}]${c.text || c.aria}`).join(' ')}`)
const writeBackButton = [...document.querySelectorAll('button')].find(b => {
  const joined = `${b.textContent ?? ''} ${b.getAttribute('aria-label') ?? ''} ${b.getAttribute('title') ?? ''} ${b.outerHTML}`
  return joined.includes('待办') || joined.includes('writeback')
})
if (writeBackButton !== undefined) { writeBackButton.click() } else { console.log('   (click step skipped: no 待办 button found)') }
await flush(2500) // the watcher ticks immediately, then once more
loops = loops.concat(sniff('write-back click'))

root.unmount()
await flush(200)

console.log(`\n=== verdict: ${loops.length === 0 ? 'NO loop reproduced' : `LOOP REPRODUCED (${loops.length} entries)`} ===`)
if (loops.length !== 0) {
  for (const line of loops.slice(0, 4)) console.log('LOOP STACK:\n' + line.slice(0, 1200))
  process.exitCode = 1
}
console.log(`queue.prompts: ${queue.prompts.length ? 'queued — ' + String(queue.prompts[0].content[0]).slice(0, 90) : 'none'}`)
console.log(`zh type: ${typeof zh}; top-level keys: ${typeof zh === 'object' && zh !== null ? Object.keys(zh).length : '—'}`)
