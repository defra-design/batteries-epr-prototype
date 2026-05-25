import { describe, expect, test } from 'vitest'

import { STEPS, STEP_ORDER, isKnownStep } from './steps.js'

describe('operator annual return steps', () => {
  test('STEP_ORDER contains exactly 3 steps', () => {
    expect(STEP_ORDER).toEqual(['tonnages', 'declaration', 'confirmation'])
  })

  test('every step in STEP_ORDER is defined in STEPS', () => {
    for (const step of STEP_ORDER) {
      expect(STEPS[step]).toBeDefined()
    }
  })

  test('isKnownStep returns true for known steps', () => {
    expect(isKnownStep('tonnages')).toBe(true)
    expect(isKnownStep('declaration')).toBe(true)
    expect(isKnownStep('confirmation')).toBe(true)
  })

  test('isKnownStep returns false for unknown steps', () => {
    expect(isKnownStep('bogus')).toBe(false)
  })

  test('each form step has a schema and toPatch', () => {
    for (const step of STEP_ORDER.filter((s) => s !== 'confirmation')) {
      expect(STEPS[step].schema).toBeTruthy()
      expect(typeof STEPS[step].toPatch).toBe('function')
    }
  })

  test('confirmation step has no schema', () => {
    expect(STEPS.confirmation.schema).toBeNull()
  })

  test('step chains link correctly', () => {
    expect(STEPS.tonnages.next).toBe('declaration')
    expect(STEPS.declaration.next).toBe('confirmation')
    expect(STEPS.confirmation.next).toBeNull()
  })

  test('tonnages toPatch produces nested industrial and automotive structure', () => {
    const patch = STEPS.tonnages.toPatch({
      industrialAcceptedLeadAcid: '1.000',
      industrialAcceptedNickelCadmium: '2.000',
      industrialAcceptedOther: '3.000',
      industrialTreatedLeadAcid: '4.000',
      industrialTreatedNickelCadmium: '5.000',
      industrialTreatedOther: '6.000',
      automotiveAcceptedLeadAcid: '7.000',
      automotiveAcceptedNickelCadmium: '8.000',
      automotiveAcceptedOther: '9.000',
      automotiveTreatedLeadAcid: '10.000',
      automotiveTreatedNickelCadmium: '11.000',
      automotiveTreatedOther: '12.000'
    })

    expect(patch.status).toBe('in-progress')
    expect(patch.industrial.accepted).toEqual({
      leadAcid: '1.000',
      nickelCadmium: '2.000',
      other: '3.000'
    })
    expect(patch.industrial.treated).toEqual({
      leadAcid: '4.000',
      nickelCadmium: '5.000',
      other: '6.000'
    })
    expect(patch.automotive.accepted).toEqual({
      leadAcid: '7.000',
      nickelCadmium: '8.000',
      other: '9.000'
    })
    expect(patch.automotive.treated).toEqual({
      leadAcid: '10.000',
      nickelCadmium: '11.000',
      other: '12.000'
    })
  })

  test('declaration toPatch sets submitted status and submittedOn', () => {
    const patch = STEPS.declaration.toPatch({
      declarationAccepted: 'yes'
    })
    expect(patch.status).toBe('submitted')
    expect(patch.submittedOn).toBeTruthy()
  })

  test('confirmation toPatch returns empty patch', () => {
    expect(STEPS.confirmation.toPatch()).toEqual({})
  })

  test('confirmation fieldMessages returns empty object', () => {
    expect(STEPS.confirmation.fieldMessages()).toEqual({})
  })

  test('tonnages fieldMessages maps all 12 fields', () => {
    const errorContent = {
      industrialAcceptedLeadAcid: 'err1',
      industrialAcceptedNickelCadmium: 'err2',
      industrialAcceptedOther: 'err3',
      industrialTreatedLeadAcid: 'err4',
      industrialTreatedNickelCadmium: 'err5',
      industrialTreatedOther: 'err6',
      automotiveAcceptedLeadAcid: 'err7',
      automotiveAcceptedNickelCadmium: 'err8',
      automotiveAcceptedOther: 'err9',
      automotiveTreatedLeadAcid: 'err10',
      automotiveTreatedNickelCadmium: 'err11',
      automotiveTreatedOther: 'err12'
    }
    const result = STEPS.tonnages.fieldMessages(errorContent)
    expect(Object.keys(result)).toHaveLength(12)
    expect(result.industrialAcceptedLeadAcid).toBe('err1')
    expect(result.automotiveTreatedOther).toBe('err12')
  })

  test('declaration fieldMessages maps declarationAccepted', () => {
    const result = STEPS.declaration.fieldMessages({
      declarationAccepted: 'Must confirm'
    })
    expect(result.declarationAccepted).toBe('Must confirm')
  })

  test('tonnages schema validates valid values', () => {
    const valid = {
      industrialAcceptedLeadAcid: '1.000',
      industrialAcceptedNickelCadmium: '2.000',
      industrialAcceptedOther: '3.000',
      industrialTreatedLeadAcid: '4.000',
      industrialTreatedNickelCadmium: '5.000',
      industrialTreatedOther: '6.000',
      automotiveAcceptedLeadAcid: '7.000',
      automotiveAcceptedNickelCadmium: '8.000',
      automotiveAcceptedOther: '9.000',
      automotiveTreatedLeadAcid: '10.000',
      automotiveTreatedNickelCadmium: '11.000',
      automotiveTreatedOther: '12.000'
    }
    const { error } = STEPS.tonnages.schema.validate(valid)
    expect(error).toBeUndefined()
  })

  test('tonnages schema rejects invalid values', () => {
    const invalid = {
      industrialAcceptedLeadAcid: 'abc',
      industrialAcceptedNickelCadmium: '2.000',
      industrialAcceptedOther: '3.000',
      industrialTreatedLeadAcid: '4.000',
      industrialTreatedNickelCadmium: '5.000',
      industrialTreatedOther: '6.000',
      automotiveAcceptedLeadAcid: '7.000',
      automotiveAcceptedNickelCadmium: '8.000',
      automotiveAcceptedOther: '9.000',
      automotiveTreatedLeadAcid: '10.000',
      automotiveTreatedNickelCadmium: '11.000',
      automotiveTreatedOther: '12.000'
    }
    const { error } = STEPS.tonnages.schema.validate(invalid)
    expect(error).toBeDefined()
  })

  test('declaration schema validates valid input', () => {
    const { error } = STEPS.declaration.schema.validate({
      declarationAccepted: 'yes'
    })
    expect(error).toBeUndefined()
  })

  test('declaration schema rejects missing checkbox', () => {
    const { error } = STEPS.declaration.schema.validate({})
    expect(error).toBeDefined()
  })
})
