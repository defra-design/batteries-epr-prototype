import { describe, expect, test } from 'vitest'

import { FEE_SCHEDULE, feeForRoute } from './fees.js'

describe('feeForRoute', () => {
  test('returns the small-producer fee', () => {
    expect(feeForRoute('smallProducer')).toBe(FEE_SCHEDULE.smallProducer)
  })

  test('returns the direct-registrant fee', () => {
    expect(feeForRoute('directRegistrant')).toBe(FEE_SCHEDULE.directRegistrant)
  })

  test('falls back to the direct-registrant fee for an unknown route', () => {
    expect(feeForRoute(undefined)).toBe(FEE_SCHEDULE.directRegistrant)
    expect(feeForRoute('mystery')).toBe(FEE_SCHEDULE.directRegistrant)
  })
})
