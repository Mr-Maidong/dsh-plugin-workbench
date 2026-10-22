/**
 * The write-back state machine (DESIGN.md §4.5), as a pure decision.
 *
 * Kept out of `index.ts` because it is the part of the Host worth testing on its
 * own: the three edges are the entire rule, and a rule that can only be reached
 * through a storage domain is a rule that ends up verified by hand. The service
 * calls this twice per request — once against a read, once inside the write
 * queue — and the second call is the one that decides (see `WorkbenchEdgeLost`).
 *
 * Status is the only input, and deliberately so. Nothing here reads a clock, a
 * workspace, or a whole record: `updateAt` belongs to the writer, and ownership
 * belongs to `mutate`, so neither can leak into the rule and make it untestable.
 *
 * @module dsh-plugin-workbench/state
 */
import type { WorkItemStatus } from './types.ts';
/**
 * What one `requestComplete` call must do to the record it names.
 *
 * A discriminated union rather than a pair of booleans, because the caller must
 * not be able to honour `expectedUpdateAt` on an edge that is not allowed to
 * write: only `advance` compares versions, which is what keeps a retry from
 * conflicting with the very write it is retrying (§4.5).
 */
export type RequestCompletePlan = 
/** The one writing edge: `open → in_progress`. */
{
    readonly kind: 'advance';
}
/**
 * The retry edge: already `in_progress`, so nothing is written at all — not
 * even `updateAt`. Writing it would let repeated presses forge recency, and
 * the item is already in the state the caller is asking for.
 */
 | {
    readonly kind: 'retry';
}
/**
 * No such edge. `done` is irreversible (§4.5): no user action and no model tool
 * reopens a completed item, so the only honest answer is a refusal.
 */
 | {
    readonly kind: 'refuse';
    readonly message: string;
};
/**
 * Decide which edge a record is on.
 * @param status - the status as of the caller's read, or as of its queue slot.
 * @returns the plan for that edge.
 */
export declare function planRequestComplete(status: WorkItemStatus): RequestCompletePlan;
//# sourceMappingURL=state.d.ts.map