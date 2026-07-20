// @vitest-environment jsdom
import { beforeEach, describe, expect, test } from 'vitest'

import {
  CATEGORIES,
  TARGET_PERCENTAGES,
  COLLECTION_TARGET_PERCENTAGES,
  buildObligation,
  resolveTargets
} from './obligation.js'
import { storage } from '../storage-adapter.js'

beforeEach(() => {
  globalThis.localStorage.clear()
})

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

  test('COLLECTION_TARGET_PERCENTAGES holds a percentage for each category', () => {
    for (const c of CATEGORIES) {
      expect(COLLECTION_TARGET_PERCENTAGES[c]).toBeGreaterThan(0)
      expect(COLLECTION_TARGET_PERCENTAGES[c]).toBeLessThanOrEqual(1)
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

  test('sums quarterly member market data across the year and applies the target', () => {
    const quarterly = [
      {
        memberData: [
          {
            memberId: 'm-1',
            marketData: { portable: '60', industrial: '200', automotive: '30' }
          },
          {
            memberId: 'm-2',
            marketData: { portable: '40', industrial: '0', automotive: '20' }
          }
        ]
      },
      {
        memberData: [
          {
            memberId: 'm-1',
            marketData: { portable: '50', industrial: '0', automotive: '50' }
          }
        ]
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

  test('applies the collection target alongside the recycling target', () => {
    const quarterly = [
      {
        memberData: [
          {
            memberId: 'm-1',
            marketData: { portable: '150', industrial: '0', automotive: '0' }
          }
        ]
      }
    ]
    const { rows } = buildObligation({ quarterly, evidence: [] })
    const portable = rows.find((r) => r.category === 'portable')

    expect(portable.collectionTargetPercent).toBe(45)
    expect(portable.collectionObligation).toBeCloseTo(150 * 0.45)
    expect(portable.targetPercent).toBe(45)
    expect(portable.obligation).toBeCloseTo(150 * 0.45)
  })

  test('uses supplied targets in place of the defaults', () => {
    const quarterly = [
      {
        memberData: [
          {
            memberId: 'm-1',
            marketData: { portable: '100', industrial: '0', automotive: '0' }
          }
        ]
      }
    ]
    const targets = {
      recycling: { portable: 0.6, industrial: 0.5, automotive: 0.5 },
      collection: { portable: 0.3, industrial: 1, automotive: 1 }
    }
    const { rows } = buildObligation({ quarterly, evidence: [], targets })
    const portable = rows.find((r) => r.category === 'portable')

    expect(portable.targetPercent).toBe(60)
    expect(portable.obligation).toBeCloseTo(100 * 0.6)
    expect(portable.collectionTargetPercent).toBe(30)
    expect(portable.collectionObligation).toBeCloseTo(100 * 0.3)
  })

  test('only accepted evidence counts toward fulfilment', () => {
    const quarterly = [
      {
        memberData: [
          {
            memberId: 'm-1',
            marketData: { portable: '100', industrial: '0', automotive: '0' }
          }
        ]
      }
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

  test('builds rows for a supplied category list, defaulting missing targets to zero', () => {
    const quarterly = [
      {
        memberData: [
          {
            memberId: 'm-1',
            marketData: { portable: '100', lmt: '40' }
          }
        ]
      }
    ]
    const { rows } = buildObligation({
      quarterly,
      evidence: [],
      categoryIds: ['portable', 'lmt']
    })
    expect(rows.map((r) => r.category)).toEqual(['portable', 'lmt'])
    const lmt = rows.find((r) => r.category === 'lmt')
    expect(lmt.placed).toBe(40)
    expect(lmt.targetPercent).toBe(0)
    expect(lmt.obligation).toBe(0)
    expect(lmt.collectionObligation).toBe(0)
  })

  test('missing tonnes fields are treated as zero', () => {
    const quarterly = [
      { memberData: [{ memberId: 'm-1', marketData: { portable: undefined } }] }
    ]
    const evidence = [{ category: 'portable', status: 'accepted' }]
    const { rows } = buildObligation({ quarterly, evidence })
    const portable = rows.find((r) => r.category === 'portable')
    expect(portable.placed).toBe(0)
    expect(portable.accepted).toBe(0)
  })
})

describe('resolveTargets', () => {
  test('falls back to the default constants when no agency is given', () => {
    expect(resolveTargets(null)).toEqual({
      recycling: TARGET_PERCENTAGES,
      collection: COLLECTION_TARGET_PERCENTAGES
    })
  })

  test('falls back to defaults when the agency has no stored targets', () => {
    expect(resolveTargets('EA')).toEqual({
      recycling: TARGET_PERCENTAGES,
      collection: COLLECTION_TARGET_PERCENTAGES
    })
  })

  test("converts a regulator's stored whole-percent targets to fractions", () => {
    storage.saveRegulatorTargets('EA', {
      collection: { portable: 45, industrial: 100, automotive: 100 },
      recycling: { portable: 60, industrial: 50, automotive: 50 }
    })
    expect(resolveTargets('EA')).toEqual({
      collection: { portable: 0.45, industrial: 1, automotive: 1 },
      recycling: { portable: 0.6, industrial: 0.5, automotive: 0.5 }
    })
  })
})
