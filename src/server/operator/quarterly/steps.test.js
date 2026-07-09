import {
  STEPS,
  STEP_ORDER,
  QUARTERS,
  isKnownStep,
  isKnownQuarter
} from './steps.js'

describe('operator quarterly/steps', () => {
  test('STEP_ORDER lists the three steps in sequence', () => {
    expect(STEP_ORDER).toEqual(['tonnages', 'declaration', 'confirmation'])
  })

  test('QUARTERS lists Q1..Q4', () => {
    expect(QUARTERS).toEqual(['Q1', 'Q2', 'Q3', 'Q4'])
  })

  test('isKnownStep recognises valid steps', () => {
    expect(isKnownStep('tonnages')).toBe(true)
    expect(isKnownStep('declaration')).toBe(true)
    expect(isKnownStep('confirmation')).toBe(true)
    expect(isKnownStep('xxx')).toBe(false)
  })

  test('isKnownQuarter recognises valid quarters', () => {
    expect(isKnownQuarter('Q1')).toBe(true)
    expect(isKnownQuarter('Q4')).toBe(true)
    expect(isKnownQuarter('Q9')).toBe(false)
  })

  test('tonnages toPatch returns accepted, treated and in-progress status', () => {
    const patch = STEPS.tonnages.toPatch({
      acceptedLeadAcid: '1.000',
      acceptedNickelCadmium: '2.000',
      acceptedOther: '3.000',
      treatedLeadAcid: '4.000',
      treatedNickelCadmium: '5.000',
      treatedOther: '6.000'
    })
    expect(patch.status).toBe('in-progress')
    expect(patch.accepted).toEqual({
      leadAcid: '1.000',
      nickelCadmium: '2.000',
      other: '3.000'
    })
    expect(patch.treated).toEqual({
      leadAcid: '4.000',
      nickelCadmium: '5.000',
      other: '6.000'
    })
  })

  test('declaration toPatch sets status=submitted with submittedOn timestamp', () => {
    const patch = STEPS.declaration.toPatch({ declarationAccepted: 'yes' })
    expect(patch.status).toBe('submitted')
    expect(typeof patch.submittedOn).toBe('string')
  })

  test('tonnages schema validates six tonne fields', () => {
    const { error } = STEPS.tonnages.schema.validate({
      acceptedLeadAcid: '1.000',
      acceptedNickelCadmium: '2.000',
      acceptedOther: '3.000',
      treatedLeadAcid: '4.000',
      treatedNickelCadmium: '5.000',
      treatedOther: '6.000'
    })
    expect(error).toBeUndefined()
  })

  test('tonnages schema rejects non-numeric values', () => {
    const { error } = STEPS.tonnages.schema.validate({
      acceptedLeadAcid: 'abc',
      acceptedNickelCadmium: '2',
      acceptedOther: '3',
      treatedLeadAcid: '4',
      treatedNickelCadmium: '5',
      treatedOther: '6'
    })
    expect(error).toBeDefined()
  })

  test('tonnages fieldMessages returns messages for all six fields', () => {
    const errorContent = {
      acceptedLeadAcid: 'req',
      acceptedLeadAcidFormat: 'fmt',
      acceptedNickelCadmium: 'req',
      acceptedNickelCadmiumFormat: 'fmt',
      acceptedOther: 'req',
      acceptedOtherFormat: 'fmt',
      treatedLeadAcid: 'req',
      treatedLeadAcidFormat: 'fmt',
      treatedNickelCadmium: 'req',
      treatedNickelCadmiumFormat: 'fmt',
      treatedOther: 'req',
      treatedOtherFormat: 'fmt'
    }
    const messages = STEPS.tonnages.fieldMessages(errorContent)
    expect(Object.keys(messages)).toHaveLength(6)
    expect(messages.acceptedLeadAcid.required).toBe('req')
    expect(messages.treatedOther.format).toBe('fmt')
  })

  test('declaration schema rejects missing checkbox', () => {
    const { error } = STEPS.declaration.schema.validate({})
    expect(error).toBeDefined()
  })

  test('declaration fieldMessages returns message for declarationAccepted', () => {
    const messages = STEPS.declaration.fieldMessages({
      declarationAccepted: 'must confirm'
    })
    expect(messages.declarationAccepted.required).toBe('must confirm')
  })

  test('confirmation is not a form step', () => {
    expect(STEPS.confirmation.formStep).toBe(false)
  })

  test('tonnages next is declaration', () => {
    expect(STEPS.tonnages.next).toBe('declaration')
  })

  test('declaration next is confirmation', () => {
    expect(STEPS.declaration.next).toBe('confirmation')
  })

  test('confirmation next is null', () => {
    expect(STEPS.confirmation.next).toBeNull()
  })
})
