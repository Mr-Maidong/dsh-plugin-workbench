/**
 * The write-back state machine's three edges (DESIGN.md §4.5).
 *
 * The rule is pure, so it is tested directly instead of through a storage domain:
 * what has to stay pinned is that only `open` writes, that a repeat request writes
 * nothing at all, and that `done` has no edge. Those three are exactly what a user
 * can observe — the status becomes 进行中, pressing again does not move anything,
 * and a finished item cannot be pushed back.
 *
 * Runs on Node's built-in runner (`pnpm test`), against the built artifact, so the
 * rule is checked as shipped rather than as typed.
 */
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { planRequestComplete } from '../lib/state.js'

describe('write-back state machine', () => {
  it('advances the one writable edge', () => {
    assert.deepEqual(planRequestComplete('open'), { kind: 'advance' })
  })

  it('turns a repeated request into a retry that writes nothing', () => {
    // `retry`, not `advance`: the service returns on this plan before it reaches
    // `mutate`, which is what leaves `updateAt` still — the retry edge of §4.5,
    // and the reason pressing twice cannot forge recency or conflict with itself.
    assert.deepEqual(planRequestComplete('in_progress'), { kind: 'retry' })
  })

  it('refuses the edge that does not exist', () => {
    const plan = planRequestComplete('done')
    assert.equal(plan.kind, 'refuse')
    assert.ok(plan.kind === 'refuse' && plan.message !== '', 'a refusal carries the reason it reports')
  })

  it('gives each status exactly one plan, with only `open` writing', () => {
    // A census rather than a repeat of the three cases above: it is the claim the
    // service depends on when it re-decides the plan inside the write queue.
    const kinds = (['open', 'in_progress', 'done'] as const).map(status => planRequestComplete(status).kind)
    assert.deepEqual(kinds, ['advance', 'retry', 'refuse'])
  })
})
