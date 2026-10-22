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
export function writeBackPrompt(record) {
    return `工作项「${record.title}」（id ${record.id}）已经执行。请调用 workbench_complete，把这条工作项从开始到现在的完整成果（整体方案、实现路径、修改文件与验证结果，含后续追加的修正）一次性写回；不要只写最后一轮改动，也不要重新执行任务。`;
}
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
export async function queueWriteBack(readSessions, sessionId, record) {
    try {
        const session = readSessions()?.binding(sessionId)?.session;
        if (session === undefined)
            return { ok: false, sessionMissing: true };
        const result = await session.prompt([{ type: 'text', text: writeBackPrompt(record) }], 'queue');
        return result.ok ? { ok: true } : { ok: false, message: result.error?.message ?? '' };
    }
    catch (cause) {
        return { ok: false, message: cause instanceof Error ? cause.message : String(cause) };
    }
}
//# sourceMappingURL=write-back.js.map