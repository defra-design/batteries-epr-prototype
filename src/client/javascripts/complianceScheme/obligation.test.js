import {
  CATEGORIES,
  TARGET_PERCENTAGES,
  buildObligation
} from './obligation.js'

describe('obligation', () => {
  test('CATEGORIES are portable/industrial/automotive in order', () => {
    expect(CATEGORIES).toEqual(['portable', 'industrial', 'automotive'])
  })

  test('TARGET_PERCENTAGES holds a percentage for each category', () => {
    for (const c of CATEGORIES) {
      expect(TARGET_PERCENTAGES[c]).toBeGreaterThan(0)
      expect(TARGET_PERCENTAGES[c]).toBeLessThanOrEqual(1)
    }
  })

  test('returns zeros when no submissions or evidence exist', () => {
    const { rows, totals } = buildObligation({ quarterly: [], evidence: [] })
    expect(rows).toHaveLength(3)
    for (const row of rows) {
      expect(row.placed).toBe(0)
      expect(row.obligation).toBe(0)
      expect(row.accepted).toBe(0)
      expect(row.outstanding).toBe(0)
    }
    expect(totals).toEqual({
      placed: 0,
      obligation: 0,
      accepted: 0,
      outstanding: 0
    })
  })

  test('sums quarterly market data across the year and applies the target', () => {
    const quarterly = [
      {
        marketData: { portable: '100', industrial: '200', automotive: '50' }
      },
      {
        marketData: { portable: '50', industrial: '0', automotive: '50' }
      }
    ]
    const { rows } = buildObligation({ quarterly, evidence: [] })
    const portable = rows.find((r) => r.category === 'portable')
    const industrial = rows.find((r) => r.category === 'industrial')
    const automotive = rows.find((r) => r.category === 'automotive')

    expect(portable.placed).toBe(150)
    expect(portable.obligation).toBeCloseTo(150 * 0.45)
    expect(industrial.obligation).toBeCloseTo(200 * 0.5)
    expect(automotive.obligation).toBeCloseTo(100 * 0.5)
  })

  test('only accepted evidence counts toward fulfilment', () => {
    const quarterly = [
      { marketData: { portable: '100', industrial: '0', automotive: '0' } }
    ]
    const evidence = [
      { category: 'portable', status: 'accepted', tonnes: '20' },
      { category: 'portable', status: 'awaiting-acceptance', tonnes: '5' },
      { category: 'industrial', status: 'cancelled', tonnes: '999' }
    ]
    const { rows, totals } = buildObligation({ quarterly, evidence })
    const portable = rows.find((r) => r.category === 'portable')
    expect(portable.accepted).toBe(20)
    expect(portable.outstanding).toBeCloseTo(100 * 0.45 - 20)
    expect(totals.accepted).toBe(20)
  })

  test('missing tonnes fields are treated as zero', () => {
    const quarterly = [{ marketData: { portable: undefined } }]
    const evidence = [{ category: 'portable', status: 'accepted' }]
    const { rows } = buildObligation({ quarterly, evidence })
    const portable = rows.find((r) => r.category === 'portable')
    expect(portable.placed).toBe(0)
    expect(portable.accepted).toBe(0)
  })
})
