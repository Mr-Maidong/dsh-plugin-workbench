/**
 * The write-back's second half: the prompt text and the queue call that carries it.
 *
 * The pane's part of this flow is one notice, so the call itself is the only
 * thing that can fail invisibly: by the time it runs the Host has already moved
 * the item to `in_progress`, and a card whose model was never asked looks exactly
 * like a card whose model is still reading. The wiring was therefore checked the
 * only way it can be — by driving the call through a fake sessions service rather
 * than by looking for its text in the mount. Each branch is asserted on its own,
 * because all of them are states in which nothing reaches the model and only one
 * of them is a defect: no service at all, an identity with no live session, a
 * service read that throws, an accepted turn, and a refused one.
 *
 * Runs against `src/` rather than `lib/`: this module's only import is a type,
 * which is what makes that possible without React, a DOM, or the Remote.
 */
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { queueWriteBack, writeBackPrompt } from '../src/client/write-back.ts'
import type { PromptableSession, WriteBackSessionsSource } from '../src/client/write-back.ts'
import type { WorkItemRecord } from '../src/types.ts'

/** One turn as the fake queue received it, so the call itself can be asserted. */
interface QueuedTurn {
  readonly content: readonly { readonly type: 'text'; readonly text: string }[]
  readonly mode: string
}

/** An item to write back: the prompt names it by id and title, so both matter. */
const item: WorkItemRecord = {
  id: '2855e7e4-408f-420a-9cdd-fce5c4c74c96',
  workspaceId: '1e07a497-5987-4ccd-bc1e-0ec8156db055',
  workspacePath: 'D:\\Workbase\\dsh-plugins\\dsh-plugin-workbench',
  title: '继续P3开发',
  desc: '',
  tag: 'DSH插件',
  status: 'in_progress',
  archived: false,
  updateAt: '2026-10-15T08:20:00.000Z',
  createdAt: '2026-10-12T15:26:52.991Z',
}

/**
 * A composition whose queue records what it was asked to send.
 *
 * @param reply - what the session's `prompt` answers: acceptance, or the
 * business error a live Host would return for a refused turn.
 * @param turns - collects every prompt this composition receives.
 * @param bound - whether `binding` finds a live session for the identity, which
 * is the one thing an identity cannot tell you on its own.
 * @returns a source thunk of the kind the pane's mount supplies.
 */
function composing(
  reply: Awaited<ReturnType<PromptableSession['prompt']>>,
  turns: QueuedTurn[],
  bound = true,
): WriteBackSessionsSource {
  const session: PromptableSession = {
    prompt: async (content, mode) => {
      turns.push({ content, mode })
      return reply
    },
  }
  return () => ({ binding: () => (bound ? { session } : undefined) })
}

describe('writeBackPrompt', () => {
  it('names the item both ways, and asks for the whole task', () => {
    const prompt = writeBackPrompt(item)
    // The tool identifies the item by the id the prompt spells out; the title is
    // there because one session can be asked about several items.
    assert.ok(prompt.includes(item.id))
    assert.ok(prompt.includes(item.title))
    assert.ok(prompt.includes('workbench_complete'))
    // A write-back records work that is already done; asking for the last round
    // only would file a partial record under a completion that claims otherwise.
    assert.ok(prompt.includes('不要只写最后一轮改动'))
    assert.ok(prompt.includes('不要重新执行任务'))
    assert.ok(!prompt.includes('\n'), 'the turn is one line, so the queue row stays one line')
  })
})

describe('queueWriteBack', () => {
  it('sends the prompt through the session own turn queue', async () => {
    const turns: QueuedTurn[] = []
    const queued = await queueWriteBack(composing({ ok: true }, turns), item.id, item)
    assert.deepEqual(queued, { ok: true })
    assert.equal(turns.length, 1, 'exactly one turn: §11.4 forbids asking twice for one summary')
    assert.deepEqual(turns[0]!.content, [{ type: 'text', text: writeBackPrompt(item) }])
    // `steer` would interrupt whatever the session is doing, and a write-back is
    // never urgent enough to cut a running turn short.
    assert.equal(turns[0]!.mode, 'queue')
  })

  it('reports a missing session instead of sending the turn anywhere else', async () => {
    const turns: QueuedTurn[] = []
    const queued = await queueWriteBack(composing({ ok: true }, turns, false), item.id, item)
    assert.deepEqual(queued, { ok: false, sessionMissing: true })
    assert.equal(turns.length, 0, 'a session that is not there must not fall back to another queue')
  })

  it('reports a composition with no sessions service at all', async () => {
    // The sessions service is declared structurally because the package that
    // provides it is not a dependency; `ctx.get` answers `undefined` when the
    // composition carries none, and this is where that lands.
    const queued = await queueWriteBack(() => undefined, item.id, item)
    assert.deepEqual(queued, { ok: false, sessionMissing: true })
  })

  it('reports a service read that throws, instead of throwing past the pane', async () => {
    // This is the shape the call actually failed in before §9.23: cordis throws
    // `cannot get property "sessions" without inject` on an undeclared read, and
    // that throw escaped the click handler as an unhandled rejection with the
    // control left pending. The glue catches it where it happens.
    const queued = await queueWriteBack(() => {
      throw new Error('cannot get property "sessions" without inject')
    }, item.id, item)
    assert.deepEqual(queued, { ok: false, message: 'cannot get property "sessions" without inject' })
  })

  it('carries the Host refusal to the pane, message and all', async () => {
    const turns: QueuedTurn[] = []
    const queued = await queueWriteBack(
      composing({ ok: false, error: { message: 'session is closed' } }, turns),
      item.id,
      item,
    )
    assert.deepEqual(queued, { ok: false, message: 'session is closed' })
    assert.equal(turns.length, 1, 'the attempt is what the refusal answers')
  })

  it('reports an empty message rather than inventing one', async () => {
    // The pane renders its own text around this message; a guessed one here would
    // be the plugin writing a Host error it never saw.
    const queued = await queueWriteBack(composing({ ok: false }, []), item.id, item)
    assert.deepEqual(queued, { ok: false, message: '' })
  })
})
