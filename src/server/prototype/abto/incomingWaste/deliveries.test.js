import {
  computeVariance,
  formatTonnes,
  getDeliveries,
  getDeliveryById
} from './deliveries.js'

describe('abto incoming waste deliveries', () => {
  test('formatTonnes formats to 3 decimal places', () => {
    expect(formatTonnes(12.5)).toBe('12.500')
    expect(formatTonnes(0)).toBe('0.000')
  })

  test('computeVariance reports a negative variance within tolerance', () => {
    const variance = computeVariance({
      reportedTonnes: 100,
      measuredTonnes: 95
    })

    expect(variance.varianceTonnes).toBe(-5)
    expect(variance.variancePercent).toBe(-5)
    expect(variance.exceedsThreshold).toBe(false)
  })

  test('computeVariance flags a negative variance beyond the threshold', () => {
    const variance = computeVariance({
      reportedTonnes: 100,
      measuredTonnes: 70
    })

    expect(variance.varianceTonnes).toBe(-30)
    expect(variance.variancePercent).toBe(-30)
    expect(variance.exceedsThreshold).toBe(true)
  })

  test('computeVariance flags a positive variance beyond the threshold', () => {
    const variance = computeVariance({
      reportedTonnes: 100,
      measuredTonnes: 130
    })

    expect(variance.varianceTonnes).toBe(30)
    expect(variance.variancePercent).toBe(30)
    expect(variance.exceedsThreshold).toBe(true)
  })

  test('computeVariance does not flag a variance exactly at the threshold', () => {
    const variance = computeVariance({
      reportedTonnes: 100,
      measuredTonnes: 80
    })

    expect(variance.variancePercent).toBe(-20)
    expect(variance.exceedsThreshold).toBe(false)
  })

  test('getDeliveries returns the seeded deliveries', () => {
    const deliveries = getDeliveries()

    expect(Array.isArray(deliveries)).toBe(true)
    expect(deliveries.length).toBeGreaterThan(0)
    expect(deliveries[0]).toHaveProperty('id')
    expect(deliveries[0]).toHaveProperty('reportedTonnes')
    expect(deliveries[0]).toHaveProperty('measuredTonnes')
  })

  test('getDeliveryById returns the matching delivery', () => {
    const [firstDelivery] = getDeliveries()

    expect(getDeliveryById(firstDelivery.id)).toEqual(firstDelivery)
  })

  test('getDeliveryById returns null when no delivery matches', () => {
    expect(getDeliveryById('not-a-real-id')).toBeNull()
  })
})
