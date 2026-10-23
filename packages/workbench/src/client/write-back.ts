/**
 * The write-back request: the prompt text and the queue call that carries it
 * (DESIGN.md §11.3).
 *
 * Client-side on purpose. The plugin's two halves share *types* — both projects
 * compile `types.ts`, because a type-only import emits nothing — but not values:
 * each half owns its own emit tree under `lib/`, so a runtime import across the
 * halves collides on the declaration output. Only this half needs the prompt,
 * because only this half queues the user turn the prompt opens.
 *
 * Both the text and the call live here rather than inline in the mount, because
 * this module's only import is a type: the call can then be driven without
 * React, a DOM, or the Remote. That is worth a module of its own because a
 * write-back that never reaches the model is invisible — the Host has already
 * moved the item to `in_progress`, so a card whose model was never asked looks
 * exactly like a card whose model is still reading (see `tests/write-back.spec.ts`).
 *
 * @module dsh-plugin-workbench/client/write-back
 */
// The self-referencing specifier, not a relative path into the host half's
// sources: this project emits under `lib/types` too, so importing `src/types.ts`
// would both pull it into the browser program and emit a second `lib/types/types.d.ts`
// over the declaration this mapping reads (see tsconfig.web.json).
import type { WorkItemRecord } from 'dsh-plugin-workbench/types'

/**
 * The user message that asks the model for one item's completion.
 *
 * It is sent as an ordinary user turn through the session's own queue, so it is
 * logged like anything else the user types and the model reads exactly this text.
 * The id is spelled out because the tool echoes it back to identify the item; the
 * title is there because a session can be asked about several items and the model
 * should not have to look the id up. The instruction not to re-execute the task is
 * what keeps a write-back from turning into a second implementation pass — the
 * point is to *record* work that is already done.
 * @param record - the item the user asked about.
 * @returns the message text.
 */
export function writeBackPrompt(record: WorkItemRecord): string {
  return `工作项「${record.title}」（id ${record.id}）已经执行。请调用 workbench_complete，把这条工作项从开始到现在的完整成果（整体方案、实现路径与修改文件，含后续追加的修正）一次性写回；不要只写最后一轮改动，也不要重新执行任务。`
}

/** What the mount reports back about one queued write-back turn. */
export type WriteBackQueued =
  | { readonly ok: true }
  | { readonly ok: false; readonly sessionMissing?: boolean; readonly message?: string }

/** The session's ordinary turn queue, as the write-back uses it. */
export interface PromptableSession {
  /**
   * @param content - the parts of one user turn; the write-back sends a single text part.
   * @param mode - always `'queue'`: a write-back appends a turn and never interrupts one.
   * @returns acceptance, or the business error the user is shown.
   */
  prompt(content: readonly { readonly type: 'text'; readonly text: string }[], mode: 'queue'): Promise<
    { readonly ok: true } | { readonly ok: false; readonly error?: { readonly message: string } }
  >
}

/**
 * The Client's sessions service, declared structurally.
 *
 * `ctx.sessions` is real — the Client's own Service catalog lists it under that
 * key, "the sessions-service face injected as `ctx.sessions`" — but the package
 * that augments `Context` with it (`@deepseek-ai/dsh-api-session-controller`) is
 * not a dependency of this plugin, so the property carries no static type here
 * and the shape is copied from that package's published declaration:
 * `binding(id)` borrows the *live* session for an identity, and `prompt` is the
 * session's ordinary turn queue. Only these members are read.
 */
export interface WriteBackSessions {
  /**
   * @param id - the session identity whose queue should receive the turn.
   * @returns the live session, or `undefined` when that identity holds none.
   */
  binding(id: string): { readonly session: PromptableSession } | undefined
}

/** Where the glue finds the sessions service: read at call time, not captured. */
export type WriteBackSessionsSource = () => WriteBackSessions | undefined

/**
 * Queue the user turn that asks the model for one item's completion.
 *
 * The second half of the write-back (§11.3). It is called only after the Host
 * accepted the request, so the item is already `in_progress` when the model reads
 * it. An absent service, an identity with no live session, or a service read that
 * throws degrades to a refusal rather than a rejection: a retry cannot produce
 * the missing session, and the pane still has to tell the user something.
 *
 * The service arrives as a source rather than as a value because a cordis
 * context *throws* on an undeclared property — `cannot get property "sessions"
 * without inject` — instead of answering `undefined`, and that throw used to
 * happen inside the click handler: an unhandled rejection, with the control left
 * pending forever (§9.23). Reading it here, inside the glue's own guard, turns
 * that failure into the report the pane already knows how to show.
 *
 * @param readSessions - where the sessions service is found at call time.
 * @param sessionId - the session whose queue receives the prompt.
 * @param record - the item the user asked about.
 * @returns whether the turn was queued, and why not when it was not.
 */
export async function queueWriteBack(
  readSessions: WriteBackSessionsSource,
  sessionId: string,
  record: WorkItemRecord,
): Promise<WriteBackQueued> {
  try {
    const session = readSessions()?.binding(sessionId)?.session
    if (session === undefined) return { ok: false, sessionMissing: true }
    const result = await session.prompt([{ type: 'text', text: writeBackPrompt(record) }], 'queue')
    return result.ok ? { ok: true } : { ok: false, message: result.error?.message ?? '' }
  } catch (cause) {
    return { ok: false, message: cause instanceof Error ? cause.message : String(cause) }
  }
}
