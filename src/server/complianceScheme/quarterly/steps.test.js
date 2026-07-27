import {
  STEPS,
  MEMBER_STEPS,
  STEP_ORDER,
  QUARTERS,
  isKnownStep,
  isKnownMemberStep,
  isKnownQuarter,
  parseCategoryIds
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

  test('MEMBER_STEPS market-data toPatch produces a marketData object for the given ids', () => {
    const patch = MEMBER_STEPS['market-data'].toPatch(
      { portable: '1.5', industrial: '2.5', automotive: '3.5' },
      ['portable', 'industrial', 'automotive']
    )
    expect(patch.marketData).toEqual({
      portable: '1.5',
      industrial: '2.5',
      automotive: '3.5'
    })
  })

  test('MEMBER_STEPS waste-data toPatch keys only the supplied ids', () => {
    const patch = MEMBER_STEPS['waste-data'].toPatch(
      { portable: '0.5', industrial: '0.25', lmt: '9' },
      ['portable', 'lmt']
    )
    expect(patch.wasteData).toEqual({ portable: '0.5', lmt: '9' })
  })

  test('parseCategoryIds reads a comma-separated list or falls back to defaults', () => {
    expect(parseCategoryIds({ categoryIds: 'portable,lmt' })).toEqual([
      'portable',
      'lmt'
    ])
    expect(parseCategoryIds({})).toEqual([
      'portable',
      'industrial',
      'automotive'
    ])
  })

  test('buildSchema validates the supplied ids and rejects a missing one', () => {
    const schema = MEMBER_STEPS['market-data'].buildSchema(['portable', 'lmt'])
    expect(schema.validate({ portable: '1', lmt: '2' }).error).toBeUndefined()
    expect(schema.validate({ portable: '1' }).error).toBeDefined()
  })

  test('buildMessages falls back to a generic message for unknown ids', () => {
    const messages = MEMBER_STEPS['market-data'].buildMessages(
      { portable: 'Enter portable tonnes', generic: 'Enter the tonnes' },
      ['portable', 'lmt']
    )
    expect(messages.portable.required).toBe('Enter portable tonnes')
    expect(messages.lmt.required).toBe('Enter the tonnes')
  })
})
