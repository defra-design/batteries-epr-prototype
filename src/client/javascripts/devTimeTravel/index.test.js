// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import {
  performTimeTravel,
  performClearTimeTravel,
  wireTimeTravelButton
} from './index.js'
import { storage, STORAGE_KEYS } from '../storage-adapter.js'

let assignSpy
let location

beforeEach(() => {
  globalThis.localStorage.clear()
  assignSpy = vi.fn()
  location = { assign: assignSpy }
  document.body.innerHTML = ''
})

afterEach(() => {
  globalThis.localStorage.clear()
})

const renderForm = (defaultYear = 2030, includeClear = true) => {
  document.body.innerHTML = `
    <input data-testid="dev-time-travel-year" value="${defaultYear}" />
    <button data-testid="dev-time-travel-confirm">Travel</button>
    ${
      includeClear
        ? '<button data-testid="dev-time-travel-clear">Clear</button>'
        : ''
    }
    <p data-testid="dev-time-travel-status"></p>
    <p data-testid="dev-time-travel-current"></p>
  `
}

describe('performTimeTravel', () => {
  test('stores the target year and redirects home', () => {
    performTimeTravel(2030, location)
    expect(globalThis.localStorage.getItem(STORAGE_KEYS.timeTravelTargetYear)).toBe(
      '2030'
    )
    expect(assignSpy).toHaveBeenCalledWith('/')
  })
})

describe('performClearTimeTravel', () => {
  test('clears the target year and redirects home', () => {
    storage.setTimeTravelToYear(2030)
    performClearTimeTravel(location)
    expect(
      globalThis.localStorage.getItem(STORAGE_KEYS.timeTravelTargetYear)
    ).toBeNull()
    expect(assignSpy).toHaveBeenCalledWith('/')
  })
})

describe('wireTimeTravelButton', () => {
  test('returns false when the confirm button is missing', () => {
    document.body.innerHTML = ''
    expect(wireTimeTravelButton(document, location)).toBe(false)
  })

  test('returns false when the year input is missing', () => {
    document.body.innerHTML = `<button data-testid="dev-time-travel-confirm">Go</button>`
    expect(wireTimeTravelButton(document, location)).toBe(false)
  })

  test('travels when the year is valid', () => {
    renderForm(2030)
    expect(wireTimeTravelButton(document, location)).toBe(true)
    document.querySelector('[data-testid="dev-time-travel-confirm"]').click()

    expect(
      globalThis.localStorage.getItem(STORAGE_KEYS.timeTravelTargetYear)
    ).toBe('2030')
    expect(assignSpy).toHaveBeenCalledWith('/')
  })

  test('shows a status message and skips travel when the year is out of range', () => {
    renderForm(1)
    expect(wireTimeTravelButton(document, location)).toBe(true)
    document.querySelector('[data-testid="dev-time-travel-confirm"]').click()

    expect(assignSpy).not.toHaveBeenCalled()
    expect(
      document.querySelector('[data-testid="dev-time-travel-status"]')
        .textContent
    ).toContain('four-digit year')
  })

  test('still skips travel when no status element is present', () => {
    document.body.innerHTML = `
      <input data-testid="dev-time-travel-year" value="1" />
      <button data-testid="dev-time-travel-confirm">Go</button>
    `
    expect(wireTimeTravelButton(document, location)).toBe(true)
    document.querySelector('[data-testid="dev-time-travel-confirm"]').click()
    expect(assignSpy).not.toHaveBeenCalled()
  })

  test('renders current target year when one is set', () => {
    storage.setTimeTravelToYear(2030)
    renderForm(2030)
    wireTimeTravelButton(document, location)
    expect(
      document.querySelector('[data-testid="dev-time-travel-current"]')
        .textContent
    ).toContain('2030')
  })

  test('renders "real time" message when no target is set', () => {
    renderForm(2030)
    wireTimeTravelButton(document, location)
    expect(
      document.querySelector('[data-testid="dev-time-travel-current"]')
        .textContent
    ).toContain('real time')
  })

  test('clear button clears the target and redirects', () => {
    storage.setTimeTravelToYear(2030)
    renderForm(2030)
    wireTimeTravelButton(document, location)
    document.querySelector('[data-testid="dev-time-travel-clear"]').click()
    expect(
      globalThis.localStorage.getItem(STORAGE_KEYS.timeTravelTargetYear)
    ).toBeNull()
    expect(assignSpy).toHaveBeenCalledWith('/')
  })

  test('skips clear-button wiring when the clear button is absent', () => {
    renderForm(2030, false)
    expect(wireTimeTravelButton(document, location)).toBe(true)
  })
})
