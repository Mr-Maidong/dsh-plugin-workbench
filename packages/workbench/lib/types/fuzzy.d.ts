/**
 * Fuzzy scoring for the workbench `search` Remote (DESIGN.md §4.2).
 *
 * Pure and dependency-free: `search` scores an in-memory snapshot of the domain,
 * so nothing here touches storage, a Context, or a Remote. That is why it is its
 * own module rather than a private method on the service — the ranking rules are
 * the part of search most worth pinning down in a test, and they can be tested
 * without a service, a domain, or a browser.
 */
/** The fields scoring reads. A caller projects a record down to these. */
export interface SearchableItem {
    readonly title: string;
    readonly desc: string;
    readonly tag: string;
}
/**
 * Tier scores.
 *
 * The three tiers are *ranked*, not merely weighted. DESIGN.md §4.2 makes the
 * prefix hit the highest tier, the substring hit the next, and the subsequence
 * hit the lowest, which means any prefix hit must outrank any substring hit and
 * any substring hit must outrank any subsequence hit. That can only hold if the
 * tiers occupy disjoint score bands:
 *
 *   tier 1  {100}       title starts with the word
 *   tier 2  {15,30,50}  substring, with title > desc > tag
 *   tier 3  {5}         subsequence (command-palette style)
 *
 * The band widths are deliberate headroom, not padding: a new substring field
 * can be ranked without renumbering anything, as long as it stays inside tier 2.
 * Renumbering is what would break the ranking, so the gaps protect the invariant
 * rather than merely decorating it.
 */
export declare const SCORE_PREFIX = 100;
/** Substring in the title — the strongest tier-2 position. */
export declare const SCORE_SUBSTRING_TITLE = 50;
/** Substring in the description. */
export declare const SCORE_SUBSTRING_DESC = 30;
/** Substring in the tag — the weakest tier-2 position. */
export declare const SCORE_SUBSTRING_TAG = 15;
/** Every word's characters appear in order, but not adjacently. */
export declare const SCORE_SUBSEQUENCE = 5;
/** No word hit this item, so it is not a result at all. */
export declare const SCORE_MISS = 0;
/**
 * Split a query into folded words.
 *
 * An empty result means "no filter", which is the opposite of "matches
 * nothing": DESIGN.md §4.1 makes an omitted or empty `query` return everything.
 * Callers must therefore branch on the *word list* being empty before treating
 * `SCORE_MISS` as a rejection.
 * @param query - raw query text.
 * @returns lower-cased words with surrounding whitespace runs collapsed away.
 */
export declare function queryWords(query: string): readonly string[];
/**
 * Score one item against a whole query.
 *
 * Words are combined with AND (DESIGN.md §4.2): every word must hit, and each
 * contributes its own best tier to the total. One miss anywhere excludes the
 * item, so the loop returns early rather than accumulating a partial score that
 * the caller would then have to interpret.
 *
 * Sorting is deliberately not done here. The caller orders by score descending
 * and then `updateAt` descending, and a stable sort over a pre-sorted snapshot
 * is how that tie-break is expressed.
 * @param query - raw query text; empty means no filter.
 * @param item - the projected record.
 * @returns the summed score, or {@link SCORE_MISS}. Note that an empty query
 * returns {@link SCORE_MISS} for every item — read {@link queryWords} to tell
 * "no filter" apart from "no match".
 */
export declare function scoreItem(query: string, item: SearchableItem): number;
//# sourceMappingURL=fuzzy.d.ts.map