import {
  STEPS,
  MEMBER_STEPS,
  STEP_ORDER,
  QUARTERS,
  isKnownStep,
  isKnownMemberStep,
  isKnownQuarter
} from './steps.js'

describe('quarterly/steps', () => {
  test('STEP_ORDER lists the four steps in sequence', () => {
    expect(STEP_ORDER).toEqual([
      'member-list',
      'check-answers',
      'declaration',
      'confirmation'
    ])
  })

  test('QUARTERS lists Q1..Q4', () => {
    expect(QUARTERS).toEqual(['Q1', 'Q2', 'Q3', 'Q4'])
  })

  test('isKnownStep and isKnownQuarter', () => {
    expect(isKnownStep('member-list')).toBe(true)
    expect(isKnownStep('market-data')).toBe(false)
    expect(isKnownStep('xxx')).toBe(false)
    expect(isKnownQuarter('Q1')).toBe(true)
    expect(isKnownQuarter('Q9')).toBe(false)
  })

  test('isKnownMemberStep recognises market-data and waste-data', () => {
    expect(isKnownMemberStep('market-data')).toBe(true)
    expect(isKnownMemberStep('waste-data')).toBe(true)
    expect(isKnownMemberStep('xxx')).toBe(false)
  })

  test('declaration toPatch sets status=submitted with submittedOn timestamp', () => {
    const patch = STEPS.declaration.toPatch({ declarationAccepted: 'yes' })
    expect(patch.status).toBe('submitted')
    expect(typeof patch.submittedOn).toBe('string')
  })

  test('MEMBER_STEPS market-data toPatch produces a marketData object', () => {
    const patch = MEMBER_STEPS['market-data'].toPatch({
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

  test('MEMBER_STEPS waste-data toPatch produces a wasteData object', () => {
    const patch = MEMBER_STEPS['waste-data'].toPatch({
      portable: '0.5',
      industrial: '0.25',
      automotive: '0.125'
    })
    expect(patch.wasteData.industrial).toBe('0.25')
  })
})
