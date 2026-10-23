/**
 * The write-back completion: its pure decisions, its prompt, and the wiring the
 * two halves have to keep (DESIGN.md §11, §9.19).
 *
 * The decisions are tested directly, because they are exactly what a user can
 * observe of a write-back: what the record ends up saying, and whether a second
 * call is allowed to say less than the first. The wiring tests read the sources
 * as text — the same way `motion.spec.ts` reads its CSS — because what has to stay
 * pinned there is a shape no unit test can see: which half queues the turn, in
 * which order, and that the completion is written to the Host's record rather than
 * pushed onto the session log.
 *
 * Runs on Node's built-in runner (`pnpm test`), against the built artifacts.
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'
import { fileURLToPath } from 'node:url'
import {
  completionFromInput, completionInputError, droppedEntries, planCompletion,
} from '../lib/types/completion.js'
import { writeBackPrompt } from '../lib/types/client/write-back.js'
import { CLIENT_DEPS } from '../lib/types/client/deps.js'
import type { WorkItemRecord, WorkbenchCompletion, WorkbenchCompletionInput } from '../lib/types/types.js'

/** Read one source file of this package, relative to `tests/`. */
function source(relative: string): string {
  return readFileSync(fileURLToPath(new URL(`../${relative}`, import.meta.url)), 'utf8')
}

/** A stored record, with only the fields one test cares about spelled out. */
function record(overrides: Partial<WorkItemRecord> = {}): WorkItemRecord {
  return {
    id: 'item-1',
    workspaceId: 'ws-1',
    workspacePath: 'D:\\ws',
    title: '把写回链路接上',
    desc: '',
    tag: '',
    status: 'open',
    archived: false,
    archivedAt: undefined,
    updateAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  } as WorkItemRecord
}

/** A completion the model submitted, covering one file. */
function submitted(overrides: Partial<WorkbenchCompletionInput> = {}): WorkbenchCompletionInput {
  return {
    summary: '接上了写回链路。',
    implementationPath: ['先在 Host 注册工具', '再在客户端排队提示词'],
    changedFiles: [{ path: 'packages/workbench/src/completion.ts', purpose: '写回决策' }],
    ...overrides,
  }
}

/** A completion already stored on a record. */
function stored(overrides: Partial<WorkbenchCompletion> = {}): WorkbenchCompletion {
  return {
    ...submitted(),
    completedAt: '2026-01-01T01:00:00.000Z',
    completedBy: 'model',
    ...overrides,
  }
}

describe('completion decisions', () => {
  it('stamps the executor fields itself, from the clock it is given', () => {
    // `completedBy` and `completedAt` are the two fields a model must not be able
    // to choose: it could otherwise claim its own record was written by a person,
    // or that it finished earlier than it did.
    assert.deepEqual(completionFromInput(submitted(), '2026-02-03T04:05:06.000Z'), {
      ...submitted(),
      completedAt: '2026-02-03T04:05:06.000Z',
      completedBy: 'model',
    })
  })

  it('refuses a write-back whose summary records nothing', () => {
    assert.notEqual(completionInputError(submitted({ summary: '   ' })), undefined)
    assert.equal(completionInputError(submitted()), undefined)
  })

  it('writes the first completion of an item', () => {
    assert.deepEqual(planCompletion(record({ status: 'open' }), submitted()), { kind: 'write', replaced: false })
  })

  it('replaces an earlier record that still covers every file', () => {
    // Last-wins on the record (§12.2): the status is terminal, the summary is not,
    // so a later call may complete the prose without losing the facts.
    const earlier = stored()
    const plan = planCompletion(
      record({ status: 'done', completion: earlier }),
      submitted({ summary: '接上了写回链路，并补了规格测试。' }),
    )
    assert.deepEqual(plan, { kind: 'write', replaced: true })
  })

  it('never writes verification, including when replacing a legacy record', () => {
    // The retired field stays readable on old records but is not part of what a
    // write-back stores; a replacement may therefore omit it without a refusal.
    assert.ok(!('verification' in completionFromInput(submitted(), '2026-02-03T04:05:06.000Z')))
    const legacy = {
      ...stored(),
      verification: [{ command: 'pnpm test', result: 'passed' as const }],
    }
    assert.deepEqual(
      planCompletion(record({ status: 'done', completion: legacy }), submitted()),
      { kind: 'write', replaced: true },
    )
  })

  it('refuses a replacement that would drop a recorded file', () => {
    const earlier = stored()
    const plan = planCompletion(record({ status: 'done', completion: earlier }), submitted({
      changedFiles: [],
    }))
    assert.equal(plan.kind, 'refuse')
    // The refusal names what was dropped and the record it came from, so the model
    // can see what it forgot instead of guessing at the missing half.
    assert.ok(plan.kind === 'refuse' && plan.message.includes('packages/workbench/src/completion.ts'))
    assert.ok(plan.kind === 'refuse' && plan.message.includes(earlier.completedAt))
  })

  it('does not treat an archived item as unwritable', () => {
    // §4.7: archiving follows the workspace, not the work. An archived item is
    // still the user's record, and a write-back is still the only way to finish it.
    assert.deepEqual(
      planCompletion(record({ archived: true }), submitted()),
      { kind: 'write', replaced: false },
    )
  })

  it('compares only facts, and reports only what is missing', () => {
    const earlier = stored()
    const none = droppedEntries(earlier, submitted({ summary: '别的措辞' }))
    assert.deepEqual(none, { files: [] })
    const some = droppedEntries(earlier, {
      changedFiles: [],
    })
    assert.deepEqual(some.files, ['packages/workbench/src/completion.ts'])
  })

  it('asks for the whole task, naming the item the tool echoes back', () => {
    const prompt = writeBackPrompt(record({ id: 'item-42', title: '接上写回链路' }))
    assert.ok(prompt.includes('item-42'), 'the tool identifies the item by the id in this prompt')
    assert.ok(prompt.includes('接上写回链路'))
    assert.ok(prompt.includes('workbench_complete'))
    assert.ok(prompt.includes('不要重新执行任务'), 'a write-back records work, it does not redo it')
    assert.ok(!prompt.includes('验证结果'), 'verification is no longer part of the record (§11)')
  })
})

describe('write-back wiring', () => {
  const host = source('src/index.ts')
  const tab = source('src/client/WorkbenchTab.tsx')
  const mount = source('src/client/mount.ts')
  const locales = source('src/client/locales.ts')
  const css = source('src/client/WorkbenchTab.module.css')

  it('writes the completion into the record, and appends nothing to the log', () => {
    // The design's first sketch pushed a `workbench/item-complete` session event
    // and rebuilt the status from a projection (§11.6). A session event type
    // declared outside this repository is absent from the generated
    // `KNOWN_SESSION_EVENT_TYPES`, and the persistence read path refuses to load a
    // log carrying an unknown type that is not marked `ignorable` — a marker
    // `Session.append()` cannot set. So the tool writes the record, which is the
    // durable authority anyway (§13.2), and this test is what makes that a
    // deliberate choice rather than a silent one.
    assert.ok(host.includes("name: 'workbench_complete'"))
    assert.ok(host.includes("status: 'done' as const"))
    assert.ok(host.includes('concludeTurn()'), 'the write-back is what the turn was queued for')
    assert.ok(!host.includes('workbench/item-complete'))
    assert.ok(!host.includes('sessionProjections'))
  })

  it('guards the completion with the version the request observed', () => {
    // §11.4: the tool carries no version — the model has no way to know one — so
    // both edges of the user's request arm the Host against the version the user
    // clicked. The advance edge re-stamps `updateAt` as it writes; the retry edge
    // writes nothing, so it arms with the version it just read.
    assert.ok(host.includes('this.armWriteBack(request.id, result.item.updateAt)'))
    assert.ok(host.includes('this.armWriteBack(request.id, observed.updateAt)'))
    assert.ok(host.includes('expectedUpdateAt'))
  })

  it('queues the prompt only after the Host accepted the request', () => {
    const request = tab.indexOf('await store.requestComplete(item)')
    const queue = tab.indexOf('await queueWriteBack(props.sessionId, item)')
    assert.ok(request > 0 && queue > 0, 'both halves of the write-back are present')
    assert.ok(request < queue, 'a request the Host refused must not reach the model')
    assert.ok(tab.includes('disabled={pending}'), 'a second click cannot queue the same prompt twice')
  })

  it('wires the pane to the write-back glue the other spec drives', () => {
    // The queue call itself is driven in tests/write-back.spec.ts, which is the
    // only way its behaviour can be checked — looking for its text here is what
    // let the second half ship unverified. What only this file can see is that
    // the pane's mount delegates to that module instead of carrying a second copy
    // of the lookup, and that the service it hands over is one the plugin has
    // declared: §9.23's defect was a legal-looking read that cordis rejects.
    assert.ok(mount.includes('queueWriteBack('), 'the queue call is delegated, not inlined')
    assert.ok(!mount.includes('binding('), 'the lookup belongs to the module the tests drive')
    assert.ok(
      CLIENT_DEPS.includes('sessions'),
      'ctx.get("sessions") resolves only for a declared service',
    )
    assert.ok(mount.includes("ctx.get('sessions')"), 'read non-strictly, like remote.workbench above it')
    assert.ok(!mount.includes('as unknown as'), 'a double cast is what hid the declaration gap')
  })

  it('watches for the answer without depending on live store state', () => {
    // The pane once crashed with a render loop (React #185): the effect that
    // watched for the completion both *read* the store's live snapshot as a
    // dependency and refreshed the store from inside itself, so every store
    // change re-armed it and it refreshed again. The watch is therefore keyed on
    // the item id alone and reads the record inside its own callback, which the
    // dependency list below is the whole guard for.
    assert.ok(tab.includes('WRITE_BACK_INTERVAL_MS'), 'the watch is a bounded timer')
    assert.ok(tab.includes('WRITE_BACK_TICKS'), 'and it gives up rather than watching forever')
    assert.ok(tab.includes('}, [writeBack, store])'), 'nothing store-derived may be a dependency')
    assert.ok(!tab.includes('props.useSession'), 'the session snapshot was the loop, not a signal')
  })

  it('names every write-back string in both locales', () => {
    for (const key of [
      'writeback.request', 'writeback.retry', 'writeback.pending',
      'writeback.hintRunning', 'writeback.failed',
      'writeback.noSession',
    ]) {
      const occurrences = locales.split(`'${key}'`).length - 1
      assert.equal(occurrences, 2, `${key} must be spelled in both zh and en`)
    }
    // §9.25: a finished card narrates nothing about the write-back — its status
    // word and completion record already say it — so the hint key itself is
    // retired, not merely unreferenced, and must not quietly come back.
    assert.ok(!locales.includes('writeback.hintDone'), 'the done narration is retired (§9.25)')
    // §9.31.9: same for the idle hint under an untouched item's expanded area.
    assert.ok(!locales.includes('writeback.hintQueued'), 'the queued narration is retired (§9.31.9)')
  })

  it('draws the hint, and holds the pending pulse still under reduced motion', () => {
    assert.ok(css.includes('.detailHint {'))
    // §9.30 — the write-back control is a labelled button now, so its waiting
    // state is `.ghostBtnPending`.
    assert.ok(css.includes('.ghostBtnPending {'))
    assert.ok(css.includes('@keyframes wb-writeback-wait'))
    assert.ok(css.includes('animation: wb-writeback-wait'))
    // The pulse is the only motion this state adds. The *last* word on the class wins,
    // so that declaration is the one that has to be the reduced-motion branch: a
    // branch written earlier would be overridden by the base rule below it.
    const lastWord = css.lastIndexOf('.ghostBtnPending {')
    assert.ok(
      css.slice(lastWord, lastWord + 120).includes('animation: none'),
      'the pending state needs a reduced-motion branch that switches the pulse off',
    )
  })

  it('shows each 全部 group whenever its own tier has items (§9.26)', () => {
    // 全部 has two groups; §5.4 pins only the *headings* to "both groups exist".
    // The old guard drew the finished group only beside a live one, so a
    // workspace whose every work item was finished showed 全部 as blank.
    assert.ok(
      tab.includes("snapshot.filter === 'all' && done.length > 0 && ("),
      'the finished group draws on its own, not only beside a live one',
    )
    assert.ok(
      !tab.includes('done.length > 0 && active.length > 0'),
      'the old both-groups guard is what hid the finished list (§9.26)',
    )
  })
})
