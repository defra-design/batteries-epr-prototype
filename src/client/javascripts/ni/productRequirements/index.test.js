// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, test } from 'vitest'

import { initNiProductRequirements } from './index.js'
import { saveRegistration } from '../storage.js'

const MARKUP = `
  <p data-ni-requirements-empty>Register to see your battery product requirements.</p>
  <div data-ni-requirements-results hidden></div>
`

beforeEach(() => {
  globalThis.localStorage.clear()
  globalThis.document.body.innerHTML = MARKUP
})

afterEach(() => {
  globalThis.localStorage.clear()
})

describe('initNiProductRequirements', () => {
  test('keeps the empty baseline when there is no registration', () => {
    const result = initNiProductRequirements(globalThis.document, {
      location: { search: '' }
    })

    expect(result.hasData).toBe(false)
    expect(
      globalThis.document.querySelector('[data-ni-requirements-results]').hidden
    ).toBe(true)
  })

  test('renders annotated sections for an applicable registration', () => {
    saveRegistration({
      bprn: 'NIP1000001',
      batteryCategories: { isElectricVehicle: true },
      carbonFootprint: {
        carbonFootprintValue: '12.4',
        performanceClass: 'B',
        recycledCobalt: '20',
        recycledLithium: '3'
      },
      batteryPassport: {
        passportCarrierId: 'BP-123',
        separateCollection: true,
        removability: 'yes'
      }
    })

    initNiProductRequirements(globalThis.document, { location: { search: '' } })

    const results = globalThis.document.querySelector(
      '[data-ni-requirements-results]'
    )
    expect(results.hidden).toBe(false)

    const cf = globalThis.document.querySelector(
      '[data-ni-requirements-section="carbonFootprint"]'
    )
    expect(
      cf
        .querySelector('[data-eubr-articles]')
        .getAttribute('data-eubr-articles')
    ).toBe('Articles 7 to 10')
    expect(cf.textContent).toContain('12.4 kg CO2e/kWh')

    const recycled = globalThis.document.querySelector(
      '[data-ni-requirements-section="recycledContent"]'
    )
    expect(recycled.textContent).toContain('minimum 16%')
    expect(recycled.textContent).toContain('Below')

    const passport = globalThis.document.querySelector(
      '[data-ni-requirements-section="batteryPassport"]'
    )
    expect(passport.textContent).toContain('BP-123')
    expect(passport.textContent).toContain('Provided')
  })

  test('shows a not-applicable note for a portable-only registration', () => {
    saveRegistration({
      batteryCategories: { isPortable: true },
      carbonFootprint: {},
      batteryPassport: {}
    })

    initNiProductRequirements(globalThis.document, { location: { search: '' } })

    const cf = globalThis.document.querySelector(
      '[data-ni-requirements-section="carbonFootprint"]'
    )
    expect(cf.textContent).toContain('Not applicable')
  })

  test('seeds sample data when the seed query param is present', () => {
    const result = initNiProductRequirements(globalThis.document, {
      location: { search: '?seed' }
    })

    expect(result.hasData).toBe(true)
    expect(result.bprn).toBe('NIP1000001')
  })
})
