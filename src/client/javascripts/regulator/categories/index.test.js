// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import {
  moveItem,
  runRegulatorCategories,
  serialiseCategories,
  slugify
} from './index.js'
import { storage } from '../../storage-adapter.js'

const rowCopy = {
  nameLabel: 'Category name',
  moveUpAction: 'Move up',
  moveDownAction: 'Move down',
  removeAction: 'Remove'
}

const buildDom = (payload) => {
  document.body.innerHTML = `
    <p data-testid="regulator-categories-agency" hidden></p>
    <form data-testid="regulator-categories-form">
      <div id="category-rows"></div>
      <button type="button" data-testid="regulator-categories-add">Add</button>
      <input type="hidden" name="categoriesJson" id="categoriesJson" />
    </form>
    <ol data-testid="regulator-categories-history"></ol>
    <script id="page-payload" type="application/json">${JSON.stringify(payload)}</script>
  `
}

const hydratePayload = (extra = {}) => ({
  view: 'categories',
  target: 'hydrate',
  rowCopy,
  auditCopy: { empty: 'No changes yet.' },
  ...extra
})

const rows = () => document.querySelectorAll('[data-testid="category-row"]')
const submitJson = () => {
  document
    .querySelector('[data-testid="regulator-categories-form"]')
    .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
  return JSON.parse(document.querySelector('#categoriesJson').value)
}

beforeEach(() => {
  globalThis.localStorage.clear()
  storage.seedDemoData()
})

afterEach(() => {
  globalThis.localStorage.clear()
})

describe('pure helpers', () => {
  test('slugify makes a stable id from a label', () => {
    expect(slugify('  LMT Batteries! ')).toBe('lmt-batteries')
  })

  test('moveItem swaps neighbours and leaves boundaries untouched', () => {
    expect(moveItem(['a', 'b', 'c'], 0, 1)).toEqual(['b', 'a', 'c'])
    expect(moveItem(['a', 'b', 'c'], 2, 1)).toEqual(['a', 'b', 'c'])
    expect(moveItem(['a', 'b', 'c'], 0, -1)).toEqual(['a', 'b', 'c'])
  })

  test('serialiseCategories fills ids and drops blank rows', () => {
    expect(
      serialiseCategories([
        { id: 'portable', label: 'Portable batteries' },
        { id: '', label: 'LMT batteries' },
        { id: '', label: '   ' }
      ])
    ).toEqual([
      {
        id: 'portable',
        label: 'Portable batteries',
        shortLabel: 'Portable batteries'
      },
      {
        id: 'lmt-batteries',
        label: 'LMT batteries',
        shortLabel: 'LMT batteries'
      }
    ])
  })
})

describe('runRegulatorCategories', () => {
  test('redirects to sign-in when no agency is selected', () => {
    const assign = vi.fn()
    buildDom(hydratePayload())
    expect(runRegulatorCategories(document, { assign })).toBe(
      'redirected-to-sign-in'
    )
    expect(assign).toHaveBeenCalledWith('/regulator/sign-in')
  })

  test('escapes special characters in category labels when rendering rows', () => {
    storage.setCurrentAgencyCode('EA')
    storage.saveRegulatorCategories('EA', [
      { id: 'portable', label: 'A & B <cells>', shortLabel: 'A & B' }
    ])
    buildDom(hydratePayload())
    runRegulatorCategories(document)
    const input = document.querySelector('[data-testid="category-label"]')
    expect(input.value).toBe('A & B <cells>')
  })

  test('hydrates rows from the seeded defaults and shows the agency name', () => {
    storage.setCurrentAgencyCode('EA')
    buildDom(hydratePayload())
    expect(runRegulatorCategories(document)).toBe('hydrated')

    const label = document.querySelector(
      '[data-testid="regulator-categories-agency"]'
    )
    expect(label.hidden).toBe(false)
    expect(label.textContent).toBe('Environment Agency')
    expect(rows().length).toBe(3)
    expect(
      document.querySelectorAll('[data-testid="category-label"]')[0].value
    ).toBe('Portable batteries')
  })

  test('renaming a category is reflected on submit', () => {
    storage.setCurrentAgencyCode('EA')
    buildDom(hydratePayload())
    runRegulatorCategories(document)

    const firstInput = document.querySelectorAll(
      '[data-testid="category-label"]'
    )[0]
    firstInput.value = 'Portable cells'
    firstInput.dispatchEvent(new Event('input', { bubbles: true }))

    const serialised = submitJson()
    expect(serialised[0]).toEqual({
      id: 'portable',
      label: 'Portable cells',
      shortLabel: 'Portable cells'
    })
  })

  test('adding a category appends a new row and serialises a slugged id', () => {
    storage.setCurrentAgencyCode('EA')
    buildDom(hydratePayload())
    runRegulatorCategories(document)

    document.querySelector('[data-testid="regulator-categories-add"]').click()
    expect(rows().length).toBe(4)
    const newInput = document.querySelectorAll(
      '[data-testid="category-label"]'
    )[3]
    newInput.value = 'LMT batteries'
    newInput.dispatchEvent(new Event('input', { bubbles: true }))

    const serialised = submitJson()
    expect(serialised).toHaveLength(4)
    expect(serialised[3]).toEqual({
      id: 'lmt-batteries',
      label: 'LMT batteries',
      shortLabel: 'LMT batteries'
    })
  })

  test('removing a category drops its row', () => {
    storage.setCurrentAgencyCode('EA')
    buildDom(hydratePayload())
    runRegulatorCategories(document)

    document.querySelectorAll('[data-testid="category-remove"]')[1].click()
    expect(rows().length).toBe(2)
    const ids = submitJson().map((category) => category.id)
    expect(ids).toEqual(['portable', 'automotive'])
  })

  test('moving a category down reorders the list', () => {
    storage.setCurrentAgencyCode('EA')
    buildDom(hydratePayload())
    runRegulatorCategories(document)

    document.querySelectorAll('[data-testid="category-down"]')[0].click()
    const ids = submitJson().map((category) => category.id)
    expect(ids).toEqual(['industrial', 'portable', 'automotive'])
  })

  test('moving a category up reorders the list', () => {
    storage.setCurrentAgencyCode('EA')
    buildDom(hydratePayload())
    runRegulatorCategories(document)

    document.querySelectorAll('[data-testid="category-up"]')[1].click()
    const ids = submitJson().map((category) => category.id)
    expect(ids).toEqual(['industrial', 'portable', 'automotive'])
  })

  test('ignores stray input and click events without a row index', () => {
    storage.setCurrentAgencyCode('EA')
    buildDom(hydratePayload())
    runRegulatorCategories(document)

    const container = document.querySelector('#category-rows')
    container.dispatchEvent(new Event('input', { bubbles: true }))
    container.dispatchEvent(new Event('click', { bubbles: true }))
    expect(rows().length).toBe(3)
  })

  test('renders a recent-changes preview scoped to the agency', () => {
    storage.setCurrentAgencyCode('EA')
    storage.saveRegulatorCategories(
      'EA',
      [
        { id: 'portable', label: 'Portable batteries', shortLabel: 'Portable' },
        { id: 'lmt', label: 'LMT batteries', shortLabel: 'LMT' }
      ],
      'Priya Shah'
    )
    buildDom(hydratePayload())
    runRegulatorCategories(document)
    const items = document.querySelectorAll('[data-testid="audit-entry"]')
    expect(items.length).toBeGreaterThan(0)
  })

  test('persists the submitted categories and returns to the page', () => {
    storage.setCurrentAgencyCode('NRW')
    const assign = vi.fn()
    const categories = [
      { id: 'portable', label: 'Portable batteries', shortLabel: 'Portable' },
      { id: 'lmt', label: 'LMT batteries', shortLabel: 'LMT' }
    ]
    buildDom({ view: 'categories', target: 'persist', categories })
    expect(runRegulatorCategories(document, { assign })).toBe('saved')
    expect(assign).toHaveBeenCalledWith('/regulator/categories?saved=1')
    expect(storage.getRegulatorCategories('NRW')).toEqual(categories)
  })
})
