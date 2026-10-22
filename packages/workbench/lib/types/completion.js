/**
 * Decide whether a completion may be written for one record.
 *
 * Two rules meet here, and they are about different things. The *status* is
 * terminal: writing a completion is the only transition into `done` and nothing
 * assigns a status back (DESIGN.md §4.5), so this never re-opens an item. The
 * *record* is last-wins: a later call for the same item replaces the earlier one
 * (DESIGN.md §12.2), and the replacement may only add — a submission that drops
 * a file the earlier record names, or a command it ran, is refused, because a
 * record of fact must never become less true than it was.
 *
 * Archiving is deliberately not a refusal: an archived item's workspace is gone,
 * but the item is still a live record and the write-back is still the only thing
 * that can finish it (DESIGN.md §4.7).
 * @param record - the record as of the queue slot.
 * @param input - the completion the model submitted.
 * @returns the plan the caller must follow.
 */
export function planCompletion(record, input) {
    const earlier = record.completion;
    if (earlier === undefined)
        return { kind: 'write', replaced: false };
    const dropped = droppedEntries(earlier, input);
    if (dropped.files.length > 0 || dropped.commands.length > 0) {
        return { kind: 'refuse', message: droppedEntriesMessage(earlier, dropped) };
    }
    return { kind: 'write', replaced: true };
}
/**
 * Stamp the model's input into a stored completion.
 *
 * The two stamped fields are the executor's, never the model's: a model that
 * could name its own `completedAt` could also claim a human marked the item done.
 * @param input - the validated fields the model submitted.
 * @param at - the instant to stamp; injectable so the decision is testable.
 * @returns the completion as the record stores it.
 */
export function completionFromInput(input, at = new Date().toISOString()) {
    return {
        summary: input.summary,
        implementationPath: input.implementationPath,
        changedFiles: input.changedFiles,
        verification: input.verification,
        completedAt: at,
        completedBy: 'model',
    };
}
/**
 * The model-facing refusal for empty fields, or `undefined` when the input is usable.
 *
 * The tool schema already types every field, so this is the content check the
 * schema cannot express: a whitespace-only summary is a write-back that records
 * nothing while claiming to be one.
 * @param input - the raw submitted fields.
 * @returns the error message, or `undefined` when they may be recorded.
 */
export function completionInputError(input) {
    if (input.summary.trim() === '') {
        return 'workbench_complete requires a non-empty summary: it is the only thing the user reads back';
    }
    return undefined;
}
/**
 * Entries an earlier completion carries that the submitted one would drop.
 *
 * Changed-file paths and verification commands are facts about what the task
 * did, so a replacement keeps every one of them; implementation steps are prose
 * and are not compared (DESIGN.md §4.4). A later call that quietly omits a file
 * would leave the record *less* true than before, which is the one direction a
 * record of fact must never move.
 * @param earlier - the completion already stored for this item.
 * @param next - the lists this call submits.
 * @returns the dropped paths and commands, each empty when nothing is dropped.
 */
export function droppedEntries(earlier, next) {
    const paths = new Set(next.changedFiles.map(file => file.path));
    const commands = new Set(next.verification.map(item => item.command));
    return {
        files: earlier.changedFiles.filter(file => !paths.has(file.path)).map(file => file.path),
        commands: earlier.verification.filter(item => !commands.has(item.command)).map(item => item.command),
    };
}
/**
 * The refusal for a call that would drop recorded entries.
 * @param earlier - the completion already stored for this item.
 * @param dropped - the paths and commands the submitted record omits.
 * @returns the model-facing message, naming only the lists that lost entries.
 */
export function droppedEntriesMessage(earlier, dropped) {
    const missing = [];
    if (dropped.files.length > 0)
        missing.push(`files ${dropped.files.join(', ')}`);
    if (dropped.commands.length > 0)
        missing.push(`commands ${dropped.commands.join(', ')}`);
    return `workbench_complete would drop entries the earlier record for this item carries: ${missing.join('; ')}. Pass the whole-task record — a replacement keeps every file the task changed and every command it ran. The earlier record, written at ${earlier.completedAt}, said: ${earlier.summary}`;
}
//# sourceMappingURL=completion.js.map