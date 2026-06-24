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

    const portableTargetAnnotation = portable.querySelector('[data-eubr]')
    expect(portableTargetAnnotation.className).toBe('app-eubr-annotation')
    expect(portableTargetAnnotation.getAttribute('data-eubr-articles')).toBe(
      'Article 59'
    )
    expect(portableTargetAnnotation.getAttribute('data-eubr-title')).toContain(
      'Separate collection target'
    )

    const recyclingAnnotation = results.querySelector(
      '[data-eubr-articles="Article 71 and Annex XII"]'
    )
    expect(recyclingAnnotation).not.toBeNull()

    expect(
      portable.querySelector('[data-eubr="portable-avg"]').getAttribute(
        'data-eubr-articles'
      )
    ).toBe('Article 59(3)')
    expect(
      portable.querySelector('[data-eubr="portable-required"]')
    ).not.toBeNull()
    expect(portable.querySelectorAll('[data-eubr]')).toHaveLength(3)

    const industrial = globalThis.document.querySelector(
      '[data-ni-obligation-stream="industrial"]'
    )
    expect(industrial.textContent).toContain('Take-back')
    expect(industrial.querySelectorAll('[data-eubr]')).toHaveLength(1)
    expect(industrial.textContent).toContain('All returned')
    expect(industrial.textContent).toContain('—')

    expect(results.textContent).toContain('Met')
  })

  test('seeds sample data when the seed query param is present', () => {
    const result = initNiObligation(globalThis.document, {
      location: { search: '?seed' }
    })

    expect(result.hasData).toBe(true)
    expect(result.bprn).toBe('NIP1000001')
    expect(result.periods.map((p) => p.period)).toEqual(['2028', '2027', '2026'])
    expect(
      globalThis.document.querySelector('[data-ni-obligation-results]').hidden
    ).toBe(false)
  })
})
