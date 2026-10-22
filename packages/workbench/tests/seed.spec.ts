/**
 * The fill text's shape.
 *
 * Filling inserts a work item into the composer's draft and never submits (§9.6).
 * The only part of that with a shape is this text: the title carrying the item's
 * labelled handle, then the description. It is pinned here because the message is
 * also how the agent is told which record it is about — the number has to be
 * there, it has to be the same one the card carries, and it has to be labelled
 * rather than left to read as prose (§9.22).
 */
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { seedText, shortNumber } from '../lib/types/client/seed.js'

const ITEM = { id: '7f3a9c2e-4b1d-4f8a-9c3e-2f6a8b1d4e7f', title: '实现登录页', desc: '先做表单' }

describe('composer seed text', () => {
  it('carries the short number in a labelled handle behind the title', () => {
    assert.equal(seedText(ITEM), '实现登录页（待办ID：#7f3a9c2e）\n先做表单')
  })

  it('keeps the handle on a title-only item', () => {
    assert.equal(seedText({ ...ITEM, desc: '' }), '实现登录页（待办ID：#7f3a9c2e）')
  })

  it('trims both fields before numbering', () => {
    assert.equal(
      seedText({ ...ITEM, title: '  实现登录页  ', desc: '  先做表单  ' }),
      '实现登录页（待办ID：#7f3a9c2e）\n先做表单',
    )
  })

  it('says the number once, and never without its label', () => {
    // A bare number is what the label replaced: it read as part of the sentence
    // rather than as a handle the model can match against a record.
    const seeded = seedText(ITEM)
    assert.equal(seeded.split('7f3a9c2e').length - 1, 1, 'the number appears exactly once')
    assert.ok(seeded.includes('（待办ID：#7f3a9c2e）'), 'and always inside the handle')
  })

  it('stands the description alone when there is no title to number', () => {
    assert.equal(seedText({ ...ITEM, title: '   ' }), '先做表单')
  })

  it('says nothing at all for an item with neither field', () => {
    assert.equal(seedText({ ...ITEM, title: '', desc: '' }), '')
  })

  it('takes the first eight characters, which is a UUID first group', () => {
    assert.equal(shortNumber(ITEM.id), '7f3a9c2e')
    assert.equal(shortNumber(ITEM.id).length, 8)
  })
})
