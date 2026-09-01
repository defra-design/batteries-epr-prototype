// @vitest-environment jsdom
import { beforeEach, afterEach, describe, expect, test } from 'vitest'

import { storage } from '../../storage-adapter.js'
import { renderBrandConfirm, wireBrandAdd } from './brand-names.js'

beforeEach(() => {
  globalThis.localStorage.clear()
})

afterEach(() => {
  globalThis.localStorage.clear()
  document.body.innerHTML = ''
})

const addFormHtml = `
  <form>
    <div data-testid="brand-add-fields">
      <input name="brandNames" data-testid="brand-add-input">
    </div>
    <a href="#" data-testid="brand-add-another"></a>
  </form>
`

const confirmHtml = `
  <p data-testid="brand-confirm-check" hidden></p>
  <p data-testid="brand-confirm-empty" hidden></p>
  <dl data-testid="brand-confirm-list"></dl>
`

describe('wireBrandAdd', () => {
  test('returns false when the fields container is absent', () => {
    document.body.innerHTML = '<form></form>'
    expect(wireBrandAdd(document, {})).toBe(false)
  })

  test('creates an input per stored brand and fills them', () => {
    document.body.innerHTML = addFormHtml
    wireBrandAdd(document, { brandNames: ['Bunny Batteries', 'Power Paws'] })

    const inputs = document.querySelectorAll('input[name="brandNames"]')
    expect(inputs.length).toBe(2)
    expect(inputs[0].value).toBe('Bunny Batteries')
    expect(inputs[1].value).toBe('Power Paws')
  })

  test('the add-another link appends an empty input', () => {
    document.body.innerHTML = addFormHtml
    wireBrandAdd(document, {})

    document.querySelector('[data-testid="brand-add-another"]').click()
    expect(document.querySelectorAll('input[name="brandNames"]').length).toBe(2)
  })
})

describe('renderBrandConfirm', () => {
  test('renders a row with a working remove link per brand', () => {
    storage.savePrototypeSubmission({
      brandNames: ['Bunny Batteries', 'Power Paws']
    })
    document.body.innerHTML = confirmHtml

    expect(renderBrandConfirm(document, storage)).toBe(2)
    expect(
      document.querySelector('[data-testid="brand-confirm-check"]').hidden
    ).toBe(false)

    document.querySelector('[data-testid="brand-confirm-remove"]').click()
    expect(storage.getPrototypeSubmission().brandNames).toEqual(['Power Paws'])
    expect(
      document.querySelectorAll('[data-testid="brand-confirm-remove"]').length
    ).toBe(1)
  })

  test('shows the empty state when no brands are stored', () => {
    document.body.innerHTML = confirmHtml

    expect(renderBrandConfirm(document, storage)).toBe(0)
    expect(
      document.querySelector('[data-testid="brand-confirm-empty"]').hidden
    ).toBe(false)
    expect(
      document.querySelector('[data-testid="brand-confirm-check"]').hidden
    ).toBe(true)
  })
})
