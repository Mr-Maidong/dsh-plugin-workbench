/**
 * Write-back decisions and copy for the `workbench_complete` path (DESIGN.md §11).
 *
 * Pure by construction: every function here takes a record or the model's raw
 * input and returns a value, so the write-back's judgement calls — may this item
 * be completed, what does the executor stamp, is an entry about to be dropped,
 * what does the request prompt say — are testable without a Host, a session, or
 * a tool registry.
 *
 * @module dsh-plugin-workbench/completion
 */
import type { WorkItemRecord, WorkbenchCompletion, WorkbenchCompletionInput } from './types.ts';
/**
 * What one `workbench_complete` call must do to the record it names.
 *
 * `replaced` distinguishes a first record from one that overwrote an earlier
 * record for the same item; the caller reports it back to the model so a
 * partial rewrite is visible as one instead of silently losing the whole-task
 * framing.
 */
export type CompletionPlan = {
    readonly kind: 'write';
    readonly replaced: boolean;
} | {
    readonly kind: 'refuse';
    readonly message: string;
};
/**
 * Decide whether a completion may be written for one record.
 *
 * Two rules meet here, and they are about different things. The *status* is
 * terminal: writing a completion is the only transition into `done` and nothing
 * assigns a status back (DESIGN.md §4.5), so this never re-opens an item. The
 * *record* is last-wins: a later call for the same item replaces the earlier one
 * (DESIGN.md §12.2), and the replacement may only add — a submission that drops
 * a file the earlier record names is refused, because a record of fact must never
 * become less true than it was. Verification is not part of that check: the tool
 * no longer records it, so a legacy record's commands are history, not a fact the
 * new submission can be asked to repeat.
 *
 * Archiving is deliberately not a refusal: an archived item's workspace is gone,
 * but the item is still a live record and the write-back is still the only thing
 * that can finish it (DESIGN.md §4.7).
 * @param record - the record as of the queue slot.
 * @param input - the completion the model submitted.
 * @returns the plan the caller must follow.
 */
export declare function planCompletion(record: WorkItemRecord, input: WorkbenchCompletionInput): CompletionPlan;
/**
 * Stamp the model's input into a stored completion.
 *
 * The two stamped fields are the executor's, never the model's: a model that
 * could name its own `completedAt` could also claim a human marked the item done.
 * @param input - the validated fields the model submitted.
 * @param at - the instant to stamp; injectable so the decision is testable.
 * @returns the completion as the record stores it.
 */
export declare function completionFromInput(input: WorkbenchCompletionInput, at?: string): WorkbenchCompletion;
/**
 * The model-facing refusal for empty fields, or `undefined` when the input is usable.
 *
 * The tool schema already types every field, so this is the content check the
 * schema cannot express: a whitespace-only summary is a write-back that records
 * nothing while claiming to be one.
 * @param input - the raw submitted fields.
 * @returns the error message, or `undefined` when they may be recorded.
 */
export declare function completionInputError(input: WorkbenchCompletionInput): string | undefined;
/** The completion lists one call submits, as the drop check reads them. */
export interface CompletionEntries {
    readonly changedFiles: readonly {
        readonly path: string;
    }[];
}
/**
 * Entries an earlier completion carries that the submitted one would drop.
 *
 * Changed-file paths are facts about what the task did, so a replacement keeps
 * every one of them; implementation steps are prose and are not compared
 * (DESIGN.md §4.4). A later call that quietly omits a file would leave the record
 * *less* true than before, which is the one direction a record of fact must never
 * move. Legacy verification entries are not compared: the tool stopped recording
 * them, so they cannot be a required part of a replacement.
 * @param earlier - the completion already stored for this item.
 * @param next - the lists this call submits.
 * @returns the dropped paths, empty when nothing is dropped.
 */
export declare function droppedEntries(earlier: WorkbenchCompletion, next: CompletionEntries): {
    readonly files: readonly string[];
};
/**
 * The refusal for a call that would drop recorded entries.
 * @param earlier - the completion already stored for this item.
 * @param dropped - the paths the submitted record omits.
 * @returns the model-facing message naming the files that lost entries.
 */
export declare function droppedEntriesMessage(earlier: WorkbenchCompletion, dropped: {
    readonly files: readonly string[];
}): string;
//# sourceMappingURL=completion.d.ts.map