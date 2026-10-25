/**
 * The tab chip's mark (§9.47).
 *
 * The chip used to lead with an inline SVG checklist whose strokes thinned to a
 * grey smudge at 14px. It now leads with generated full-colour artwork — the
 * layered workbench cards — drawn as an ordinary background image: a mask would
 * repaint the gradient with the chip's text colour and lose the colours.
 *
 * Reads the stylesheet, the component source, and the shipped file rather than
 * rendering: what can silently regress is the image contract and the asset, not
 * its pixels.
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

describe('the tab chip mark', () => {
  it('ships as a WebP file', () => {
    const bytes = readFileSync(new URL('../src/client/assets/tab-icon.webp', import.meta.url))
    assert.equal(bytes.subarray(0, 4).toString('ascii'), 'RIFF', 'tab-icon.webp is not a RIFF file')
    assert.equal(bytes.subarray(8, 12).toString('ascii'), 'WEBP', 'tab-icon.webp is not WebP')
    assert.ok(bytes.length > 1024, 'tab-icon.webp is suspiciously small')
  })

  it('fits the chip as a background image in a square box', () => {
    const icon = rule('.titleIcon')
    // §9.47: the mark keeps its own colours, so it is a plain background-image
    // the component sets - no mask, no currentColor repaint.
    assert.equal(icon['background-size'], 'contain')
    assert.equal(icon['background-repeat'], 'no-repeat')
    assert.equal(icon['background-position'], 'center')
    assert.ok(!icon['mask-size'] && !icon['-webkit-mask-size'], 'the colour mark must not be masked')
    // The box is 16px - the 14px the old glyph drew at read small - and the
    // lowered vertical align keeps the mark's optical centre where that 14px
    // box had it. No margin of its own: the tab lays the mark and label apart
    // with its own gap, and the mark is inline so it sits on the label's
    // baseline rather than in a flex row of its own.
    assert.equal(icon.width, '16px')
    assert.equal(icon.height, '16px')
    assert.equal(icon.display, 'inline-block')
    assert.ok(!icon['margin-right'], 'the chip has a gap; the mark adds no margin of its own')
    assert.equal(icon['vertical-align'], '-3px')
  })

  it('sets the artwork in the title, and no longer draws a glyph', () => {
    assert.ok(markup.includes('backgroundImage: `url(${tabIcon})`'), 'the colour mark must be inlined')
    assert.ok(markup.includes("import tabIcon from './assets/tab-icon.webp'"), 'the asset must be imported')
    assert.ok(!markup.includes('ChecklistGlyph'), 'the inline checklist glyph is gone')
    // The span is decorative: the label right beside it already names the tab.
    assert.ok(markup.includes('aria-hidden="true"'), 'the mark must stay out of the a11y tree')
  })
})
