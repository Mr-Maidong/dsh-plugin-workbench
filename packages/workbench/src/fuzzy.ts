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
  readonly title: string
  readonly desc: string
  readonly tag: string
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
export const SCORE_PREFIX = 100
/** Substring in the title — the strongest tier-2 position. */
export const SCORE_SUBSTRING_TITLE = 50
/** Substring in the description. */
export const SCORE_SUBSTRING_DESC = 30
/** Substring in the tag — the weakest tier-2 position. */
export const SCORE_SUBSTRING_TAG = 15
/** Every word's characters appear in order, but not adjacently. */
export const SCORE_SUBSEQUENCE = 5

/** No word hit this item, so it is not a result at all. */
export const SCORE_MISS = 0

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
export function queryWords(query: string): readonly string[] {
  return query.toLowerCase().split(/\s+/).filter(word => word !== '')
}

/**
 * Do `word`'s characters appear in `field` in order, not necessarily adjacently?
 *
 * This is the command-palette match and the weakest tier: it is what lets `wbn`
 * find `workbench`. Case folding happens in {@link queryWords} and at the call
 * site, so both operands are already lower-cased here.
 */
function isSubsequence(word: string, field: string): boolean {
  let cursor = 0
  for (const character of field) {
    // `word[cursor]` is `string | undefined` under noUncheckedIndexedAccess;
    // a character is never undefined, so running past the end simply stops
    // matching, and the length check below reports the outcome.
    if (character === word[cursor]) cursor += 1
    if (cursor === word.length) return true
  }
  return word.length === 0
}

/**
 * Score one already-folded word against one item.
 *
 * Checked strongest first and returned on the first hit, which is what makes
 * this "the word's best tier" rather than a sum of every tier it happens to
 * satisfy — a title prefix is also a title substring and also a subsequence,
 * and counting all three would turn one strong hit into a huge one.
 * @param word - folded word from {@link queryWords}.
 * @param item - the projected record.
 * @returns this word's contribution, or {@link SCORE_MISS} if it does not hit.
 */
function scoreWord(word: string, item: SearchableItem): number {
  const title = item.title.toLowerCase()
  if (title.startsWith(word)) return SCORE_PREFIX
  if (title.includes(word)) return SCORE_SUBSTRING_TITLE
  if (item.desc.toLowerCase().includes(word)) return SCORE_SUBSTRING_DESC
  if (item.tag.toLowerCase().includes(word)) return SCORE_SUBSTRING_TAG
  const desc = item.desc.toLowerCase()
  const tag = item.tag.toLowerCase()
  if (isSubsequence(word, title) || isSubsequence(word, desc) || isSubsequence(word, tag)) return SCORE_SUBSEQUENCE
  return SCORE_MISS
}

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
export function scoreItem(query: string, item: SearchableItem): number {
  const words = queryWords(query)
  if (words.length === 0) return SCORE_MISS
  let total = 0
  for (const word of words) {
    const score = scoreWord(word, item)
    if (score === SCORE_MISS) return SCORE_MISS
    total += score
  }
  return total
}
