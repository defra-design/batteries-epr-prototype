import { describe, expect, test } from 'vitest'

import {
  averagePlacedOnMarket,
  calculateObligation,
  calculatePeriod,
  collectionRate,
  parseTonnes
} from './calculator.js'

describe('parseTonnes', () => {
  test('parses numeric strings', () => {
    expect(parseTonnes('12.5')).toBe(12.5)
  })

  test('falls back to 0 for non-numeric input', () => {
    expect(parseTonnes(undefined)).toBe(0)
    expect(parseTonnes('abc')).toBe(0)
  })
})

describe('collectionRate', () => {
  const thresholds = [
    { from: 2023, rate: 0.45 },
    { from: 2027, rate: 0.63 },
    { from: 2030, rate: 0.73 }
  ]

  test('selects the highest threshold that applies in the year', () => {
    expect(collectionRate(thresholds, 2028)).toBe(0.63)
  })

  test('returns null before any threshold applies', () => {
    expect(collectionRate(thresholds, 2020)).toBeNull()
  })
})

describe('averagePlacedOnMarket', () => {
  test('averages over the year and the two preceding years', () => {
    const index = {
      2026: { pomPortable: 100 },
      2025: { pomPortable: 200 },
      2024: { pomPortable: 300 }
    }
    expect(averagePlacedOnMarket(index, 'pomPortable', 2026)).toEqual({
      average: 200,
      yearsAveraged: 3
    })
  })

  test('counts only the years that have data', () => {
    const index = {
      2026: { pomPortable: 100 },
      2025: { pomPortable: 200 }
    }
    expect(averagePlacedOnMarket(index, 'pomPortable', 2026)).toEqual({
      average: 150,
      yearsAveraged: 2
    })
  })

  test('returns zero when no years have data', () => {
    expect(averagePlacedOnMarket({}, 'pomPortable', 2026)).toEqual({
      average: 0,
      yearsAveraged: 0
    })
  })
})

describe('calculatePeriod', () => {
  test('applies a collection target to portable and take-back to the rest', () => {
    const result = calculatePeriod({
      period: '2026',
      reference: 'NI-AR-100001',
      placedOnMarket: {
        pomPortable: '100',
        pomIndustrial: '50',
        pomEv: '30',
        pomAutomotive: '20'
      },
      collection: {
        colPortable: '10',
        colIndustrial: '50',
        colEv: '30',
        colAutomotive: '5'
      },
      recyclingEfficiency: {
        reLeadAcid: '85',
        reLithium: '60',
        reNickelCadmium: '90'
      }
    })

    const portable = result.streams.find((s) => s.key === 'portable')
    expect(portable.model).toBe('collection-target')
    expect(portable.ratePercent).toBe(45)
    expect(portable.averagePlacedOnMarket).toBe(100)
    expect(portable.yearsAveraged).toBe(1)
    expect(portable.requiredCollection).toBe(45)
    expect(portable.shortfall).toBe(35)
    expect(portable.status).toBe('shortfall')

    expect(portable.legislation.articles).toBe('Article 59')
    expect(portable.averageLegislation.articles).toBe('Article 59(3)')
    expect(portable.requiredLegislation.articles).toBe('Article 59')
    expect(portable.requiredLegislation.summary).toContain('45%')

    const lmt = result.streams.find((s) => s.key === 'lmt')
    expect(lmt.model).toBe('collection-target')
    expect(lmt.status).toBe('not-yet')
    expect(lmt.targetLabel).toBe('Not yet in force')
    expect(lmt.requiredCollection).toBeNull()
    expect(lmt.shortfall).toBeNull()
    expect(lmt.legislation.articles).toBe('Article 60')
    expect(lmt.averageLegislation.articles).toBe('Article 60(3)')
    expect(lmt.requiredLegislation).toBeNull()

    const industrial = result.streams.find((s) => s.key === 'industrial')
    expect(industrial.model).toBe('take-back')
    expect(industrial.averagePlacedOnMarket).toBeNull()
    expect(industrial.requiredCollection).toBeNull()
    expect(industrial.shortfall).toBeNull()
    expect(industrial.status).toBe('take-back')
    expect(industrial.averageLegislation).toBeNull()
    expect(industrial.requiredLegislation).toBeNull()

    const ev = result.streams.find((s) => s.key === 'electricVehicle')
    expect(ev.model).toBe('take-back')
    expect(ev.status).toBe('take-back')
    expect(ev.legislation.articles).toBe('Article 61')

    const lithium = result.recycling.find((r) => r.key === 'lithium')
    expect(lithium.status).toBe('shortfall')
    expect(lithium.legislation.articles).toBe('Article 71 and Annex XII')

    expect(result.totals.requiredCollection).toBe(45)
    expect(result.totals.shortfall).toBe(35)
    expect(result.reference).toBe('NI-AR-100001')
    expect(result.compliant).toBe(false)
  })

  test('applies the Article 60 LMT target once it is in force', () => {
    const result = calculatePeriod({
      period: '2028',
      placedOnMarket: { pomLmt: '100' },
      collection: { colLmt: '40' }
    })

    const lmt = result.streams.find((s) => s.key === 'lmt')
    expect(lmt.status).toBe('shortfall')
    expect(lmt.ratePercent).toBe(51)
    expect(lmt.requiredCollection).toBe(51)
    expect(lmt.shortfall).toBe(11)
  })

  test('treats missing sections as empty and can be fully compliant', () => {
    const result = calculatePeriod({
      period: '2026',
      placedOnMarket: { pomPortable: '100' },
      collection: { colPortable: '45' },
      recyclingEfficiency: {
        reLeadAcid: '80',
        reLithium: '65',
        reNickelCadmium: '80'
      }
    })

    const portable = result.streams.find((s) => s.key === 'portable')
    expect(portable.status).toBe('met')
    expect(result.totals.shortfall).toBe(0)
    expect(result.reference).toBeNull()
    expect(result.compliant).toBe(true)
  })

  test('defaults every section when the annual return is bare', () => {
    const result = calculatePeriod({ period: '2026' })

    expect(result.totals.placedOnMarket).toBe(0)
    expect(result.totals.requiredCollection).toBe(0)
    expect(result.recycling.every((r) => r.status === 'shortfall')).toBe(true)
  })
})

describe('calculateObligation', () => {
  test('averages placed-on-market across submitted periods', () => {
    const result = calculateObligation({
      registration: { bprn: 'NIP1234567', producerRoute: 'self' },
      annualReturns: [
        { period: '2025', placedOnMarket: { pomPortable: '300' } },
        {
          period: '2026',
          placedOnMarket: { pomPortable: '100' },
          collection: { colPortable: '50' }
        }
      ]
    })

    expect(result.periods.map((p) => p.period)).toEqual(['2026', '2025'])

    const portable2026 = result.periods[0].streams.find(
      (s) => s.key === 'portable'
    )
    expect(portable2026.averagePlacedOnMarket).toBe(200)
    expect(portable2026.yearsAveraged).toBe(2)
    expect(portable2026.requiredCollection).toBe(90)
    expect(portable2026.placedOnMarket).toBe(100)
  })

  test('handles a missing registration and no returns', () => {
    const result = calculateObligation({
      registration: null,
      annualReturns: []
    })

    expect(result.bprn).toBeNull()
    expect(result.producerRoute).toBeNull()
    expect(result.hasData).toBe(false)
    expect(result.periods).toEqual([])
  })
})
