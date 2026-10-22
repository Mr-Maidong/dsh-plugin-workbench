/**
 * Ranking rules for the workbench `search` Remote (DESIGN.md §4.2).
 *
 * These assertions exist because the ranking is an *order*, not a formula: the
 * design fixes three tiers (prefix > substring > subsequence) and an ordering
 * inside tier two (title > desc > tag), and every one of those relations is
 * invisible in a hand-written score table. A later edit that renumbers the
 * constants can silently invert a ranking while every individual score still
 * looks reasonable, so the relations are asserted directly and the constants
 * are only ever compared against each other.
 *
 * Runs against the built `lib/` output for the same reason the Remote contract
 * test does: that is the artifact that ships.
 */
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  SCORE_MISS, SCORE_PREFIX, SCORE_SUBSEQUENCE, SCORE_SUBSTRING_DESC,
  SCORE_SUBSTRING_TAG, SCORE_SUBSTRING_TITLE, queryWords, scoreItem,
} from '../lib/fuzzy.js'

/** Project a bare record down to the three fields scoring reads. */
const item = (title: string, desc = '', tag = '') => ({ title, desc, tag })

describe('fuzzy scoring', () => {
  it('ranks a title prefix as the top tier', () => {
    assert.equal(scoreItem('work', item('workbench')), SCORE_PREFIX)
  })

  it('ranks a substring below a prefix, strongest field first', () => {
    assert.equal(scoreItem('bench', item('workbench')), SCORE_SUBSTRING_TITLE)
    assert.equal(scoreItem('bench', item('probe it', 'the bench')), SCORE_SUBSTRING_DESC)
    assert.equal(scoreItem('bench', item('probe it', 'nothing', 'workbench')), SCORE_SUBSTRING_TAG)
  })

  it('takes the strongest field rather than summing across fields', () => {
    // The title hit is also a substring of the description; counting both would
    // make one strong hit look like two.
    assert.equal(scoreItem('bench', item('workbench', 'the bench')), SCORE_SUBSTRING_TITLE)
  })

  it('ranks a subsequence below every substring, as the bottom tier', () => {
    // `wbn` is not adjacent in "workbench", so only the command-palette match
    // can explain a hit here.
    assert.equal(scoreItem('wbn', item('workbench')), SCORE_SUBSEQUENCE)
  })

  it('keeps the tiers in disjoint bands so their order cannot invert', () => {
    const prefix = scoreItem('work', item('workbench'))
    const substring = scoreItem('bench', item('workbench'))
    const subsequence = scoreItem('wbn', item('workbench'))

    assert.ok(prefix > substring, `prefix ${prefix} must outrank substring ${substring}`)
    assert.ok(substring > subsequence, `substring ${substring} must outrank subsequence ${subsequence}`)
    assert.ok(subsequence > SCORE_MISS, `subsequence ${subsequence} must be a hit`)

    // The same two relations stated on the constants, so a renumbering that
    // keeps the sample items working still fails when it breaks the bands.
    assert.ok(SCORE_PREFIX > SCORE_SUBSTRING_TITLE)
    assert.ok(SCORE_SUBSTRING_TITLE > SCORE_SUBSTRING_DESC)
    assert.ok(SCORE_SUBSTRING_DESC > SCORE_SUBSTRING_TAG)
    assert.ok(SCORE_SUBSTRING_TAG > SCORE_SUBSEQUENCE)
    assert.ok(SCORE_SUBSEQUENCE > SCORE_MISS)
  })

  it('folds case on both the query and the fields', () => {
    assert.equal(scoreItem('WORK', item('WorkBench')), SCORE_PREFIX)
    assert.equal(scoreItem('WbN', item('WorkBench')), SCORE_SUBSEQUENCE)
  })

  it('requires every word of a multi-word query', () => {
    // AND, not OR: each word contributes its own best tier.
    assert.equal(scoreItem('work bench', item('workbench')), SCORE_PREFIX + SCORE_SUBSTRING_TITLE)
    // One miss rejects the item outright rather than returning the partial sum.
    assert.equal(scoreItem('work zzz', item('workbench')), SCORE_MISS)
  })

  it('separates "no filter" from "no match" by the word list', () => {
    const subject = item('workbench')
    assert.deepEqual(queryWords(''), [])
    assert.deepEqual(queryWords('   '), [])

    // Both cases score SCORE_MISS, so the score alone cannot tell them apart —
    // only the word list can. The search implementation branches on exactly this.
    assert.equal(scoreItem('', subject), SCORE_MISS)
    assert.equal(scoreItem('zzz', subject), SCORE_MISS)
    assert.equal(queryWords('').length, 0)
    assert.equal(queryWords('zzz').length, 1)
  })
})
