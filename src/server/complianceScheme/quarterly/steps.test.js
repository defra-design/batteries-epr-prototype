import { STEPS, STEP_ORDER, QUARTERS, isKnownStep, isKnownQuarter } from './steps.js'

describe('quarterly/steps', () => {
  test('STEP_ORDER lists the five steps in sequence', () => {
    expect(STEP_ORDER).toEqual([
      'market-data',
      'waste-data',
      'check-answers',
      'declaration',
      'confirmation'
    ])
  })

  test('QUARTERS lists Q1..Q4', () => {
    expect(QUARTERS).toEqual(['Q1', 'Q2', 'Q3', 'Q4'])
  })

  test('isKnownStep and isKnownQuarter', () => {
    expect(isKnownStep('market-data')).toBe(true)
    expect(isKnownStep('xxx')).toBe(false)
    expect(isKnownQuarter('Q1')).toBe(true)
    expect(isKnownQuarter('Q9')).toBe(false)
  })

  test('declaration toPatch sets status=submitted with submittedOn timestamp', () => {
    const patch = STEPS.declaration.toPatch({ declarationAccepted: 'yes' })
    expect(patch.status).toBe('submitted')
    expect(typeof patch.submittedOn).toBe('string')
  })

  test('market-data toPatch produces a marketData object', () => {
    const patch = STEPS['market-data'].toPatch({
      portable: '1.5',
      industrial: '2.5',
      automotive: '3.5'
    })
    expect(patch.marketData).toEqual({
      portable: '1.5',
      industrial: '2.5',
      automotive: '3.5'
    })
  })

  test('waste-data toPatch produces a wasteData object', () => {
    const patch = STEPS['waste-data'].toPatch({
      portable: '0.5',
      industrial: '0.25',
      automotive: '0.125'
    })
    expect(patch.wasteData.industrial).toBe('0.25')
  })
})
