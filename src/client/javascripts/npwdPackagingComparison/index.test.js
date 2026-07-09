// @vitest-environment jsdom
import { describe, expect, test } from 'vitest'

import { applyFilter, runComparisonFilter } from './index.js'

const buildPage = () => {
  const wrapper = document.createElement('div')
  wrapper.innerHTML = `
    <div data-comparison-filter hidden>
      <input type="radio" name="classification-filter" value="all" checked />
      <input type="radio" name="classification-filter" value="common" />
      <input type="radio" name="classification-filter" value="shared" />
      <input type="radio" name="classification-filter" value="unique" />
    </div>
    <div data-comparison-section>
      <h2>Area A</h2>
      <table>
        <tbody>
          <tr data-classification="common"><td>a</td></tr>
          <tr data-classification="shared"><td>b</td></tr>
        </tbody>
      </table>
    </div>
    <div data-comparison-section>
      <h2>Area B</h2>
      <table>
        <tbody>
          <tr data-classification="unique"><td>c</td></tr>
        </tbody>
      </table>
    </div>
  `
  return wrapper
}

describe('applyFilter', () => {
  test('shows all rows and sections when value is "all"', () => {
    const doc = buildPage()
    applyFilter(doc, 'all')
    const rows = doc.querySelectorAll('tr[data-classification]')
    expect([...rows].every((row) => row.hidden === false)).toBe(true)
    expect(
      [...doc.querySelectorAll('[data-comparison-section]')].every(
        (s) => s.hidden === false
      )
    ).toBe(true)
  })

  test('hides non-matching rows and empties a section', () => {
    const doc = buildPage()
    applyFilter(doc, 'common')
    const [sectionA, sectionB] = doc.querySelectorAll(
      '[data-comparison-section]'
    )
    expect(
      sectionA.querySelector('[data-classification="common"]').hidden
    ).toBe(false)
    expect(
      sectionA.querySelector('[data-classification="shared"]').hidden
    ).toBe(true)
    expect(sectionA.hidden).toBe(false)
    expect(sectionB.hidden).toBe(true)
  })
})

describe('runComparisonFilter', () => {
  test('reveals the filter and applies the checked value on load', () => {
    const doc = buildPage()
    runComparisonFilter(doc)
    expect(doc.querySelector('[data-comparison-filter]').hidden).toBe(false)
    expect(doc.querySelectorAll('tr[data-classification]')[0].hidden).toBe(
      false
    )
  })

  test('re-applies the filter when a radio changes', () => {
    const doc = buildPage()
    runComparisonFilter(doc)
    const unique = doc.querySelector('input[value="unique"]')
    doc.querySelector('input[value="all"]').checked = false
    unique.checked = true
    unique.dispatchEvent(new window.Event('change'))
    expect(doc.querySelector('[data-classification="common"]').hidden).toBe(
      true
    )
    expect(doc.querySelector('[data-classification="unique"]').hidden).toBe(
      false
    )
  })

  test('defaults to "all" when no radio is checked', () => {
    const doc = buildPage()
    doc.querySelector('input[value="all"]').checked = false
    runComparisonFilter(doc)
    expect(doc.querySelector('[data-classification="shared"]').hidden).toBe(
      false
    )
  })

  test('does nothing when the filter container is absent', () => {
    const doc = document.createElement('div')
    doc.innerHTML =
      '<div data-comparison-section><table><tbody><tr data-classification="common"></tr></tbody></table></div>'
    expect(() => runComparisonFilter(doc)).not.toThrow()
    expect(doc.querySelector('tr').hidden).toBe(false)
  })
})
