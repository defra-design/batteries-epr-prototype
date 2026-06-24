// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, test } from 'vitest'

import { initNiObligation } from './index.js'
import { saveAnnualReturn, saveRegistration } from '../storage.js'

const MARKUP = `
  <p data-ni-obligation-empty>Submit an annual return to see your obligation.</p>
  <div data-ni-obligation-results hidden></div>
`

beforeEach(() => {
  globalThis.localStorage.clear()
  globalThis.document.body.innerHTML = MARKUP
})

afterEach(() => {
  globalThis.localStorage.clear()
})

describe('initNiObligation', () => {
  test('keeps the empty baseline when there are no annual returns', () => {
    const result = initNiObligation(globalThis.document)

    expect(result.hasData).toBe(false)
    expect(
      globalThis.document.querySelector('[data-ni-obligation-empty]').hidden
    ).toBe(false)
    expect(
      globalThis.document.querySelector('[data-ni-obligation-results]').hidden
    ).toBe(true)
  })

  test('renders an obligation table from the stored annual return', () => {
    saveRegistration({ bprn: 'NIP1234567', period: '2026' })
    saveAnnualReturn({
      period: '2026',
      reference: 'NI-AR-100001',
      placedOnMarket: {
        pomPortable: '100',
        pomLmt: '20',
        pomIndustrial: '40',
        pomAutomotive: '0'
      },
      collection: {
        colPortable: '10',
        colLmt: '0',
        colIndustrial: '40',
        colAutomotive: '0'
      },
      recyclingEfficiency: { reLeadAcid: '85', reLithium: '60', reNickelCadmium: '90' }
    })

    initNiObligation(globalThis.document)

    const results = globalThis.document.querySelector(
      '[data-ni-obligation-results]'
    )
    expect(results.hidden).toBe(false)
    expect(
      globalThis.document.querySelector('[data-ni-obligation-period="2026"]')
    ).not.toBeNull()

    const portable = globalThis.document.querySelector(
      '[data-ni-obligation-stream="portable"]'
    )
    expect(portable.textContent).toContain('Shortfall')
    expect(portable.textContent).toContain('45 t')

    const lmt = globalThis.document.querySelector(
      '[data-ni-obligation-stream="lmt"]'
    )
    expect(lmt.textContent).toContain('Not yet in force')

    const industrial = globalThis.document.querySelector(
      '[data-ni-obligation-stream="industrial"]'
    )
    expect(industrial.textContent).toContain('Take-back')
    expect(industrial.textContent).toContain('All returned')
    expect(industrial.textContent).toContain('—')

    expect(results.textContent).toContain('Met')
  })
})
