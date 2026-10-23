/**
 * The status artwork (§9.42): the generated todo and done seals ship as WebP
 * alpha masks instead of fixed-colour images, so their ink keeps following the
 * theme.
 *
 * Like the field-metrics spec, this reads the stylesheet and the component
 * source rather than rendering: what can silently regress is the mask contract
 * (16px inside the 20px slot, `currentColor` as the fill) and the two files,
 * not their pixels.
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'

/** Comments are stripped first: they contain braces and semicolons. */
const css = readFileSync(new URL('../src/client/WorkbenchTab.module.css', import.meta.url), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '')
const markup = readFileSync(new URL('../src/client/WorkbenchTab.tsx', import.meta.url), 'utf8')

/** Every declaration of one rule, keyed by property. */
function rule(selector: string): Record<string, string> {
  const at = css.indexOf(`\n${selector} {`)
  assert.notEqual(at, -1, `${selector} has no rule`)
  const body = css.slice(css.indexOf('{', at) + 1, css.indexOf('}', at))
  const out: Record<string, string> = {}
  for (const declaration of body.split(';')) {
    const colon = declaration.indexOf(':')
    if (colon > 0) out[declaration.slice(0, colon).trim()] = declaration.slice(colon + 1).trim()
  }
  return out
}

describe('the generated status marks', () => {
  it('ships both seals as WebP files', () => {
    for (const name of ['mark-todo.webp', 'mark-done.webp']) {
      const bytes = readFileSync(new URL(`../src/client/assets/${name}`, import.meta.url))
      assert.equal(bytes.subarray(0, 4).toString('ascii'), 'RIFF', `${name} is not a RIFF file`)
      assert.equal(bytes.subarray(8, 12).toString('ascii'), 'WEBP', `${name} is not WebP`)
      assert.ok(bytes.length > 1024, `${name} is suspiciously small`)
    }
  })

  it('paints them as masks so the theme owns the ink', () => {
    const glyph = rule('.markGlyph')
    assert.equal(glyph.display, 'block')
    assert.equal(glyph.width, '16px')
    assert.equal(glyph.height, '16px')
    assert.equal(glyph.background, 'currentColor')
    assert.equal(glyph['mask-size'], 'contain')
    assert.equal(glyph['mask-repeat'], 'no-repeat')
    assert.equal(glyph['mask-position'], 'center')
    // The finished seal is solid artwork; a halo behind it would double the
    // silhouette that the image already carries.
    const done = rule('.markDone')
    assert.equal(done.color, 'var(--wb-accent)')
    assert.ok(!('background' in done), 'the finished seal carries its own fill')
  })

  it('keeps the in-progress dot and the 20px slot', () => {
    assert.equal(rule('.mark').width, '20px')
    assert.equal(rule('.markDot').width, '9px')
    assert.ok(markup.includes('glyphMask(doneMark)'), 'the done seal must be masked')
    assert.ok(markup.includes('glyphMask(todoMark)'), 'the todo seal must be masked')
    assert.ok(markup.includes("item.status === 'in_progress'"), 'in progress keeps its CSS dot')
    assert.ok(markup.includes("css.markBusy"), 'the composer still draws the busy mark')
  })
})
