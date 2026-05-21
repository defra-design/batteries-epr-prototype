import { STEPS, STEP_ORDER, isKnownStep } from './steps.js'

describe('application/steps', () => {
  test('STEP_ORDER lists every step in sequence', () => {
    expect(STEP_ORDER).toEqual([
      'scheme-details',
      'registered-address',
      'contact-address',
      'operational-plan',
      'partners',
      'offences',
      'additional-files',
      'declaration',
      'confirmation'
    ])
  })

  test('isKnownStep identifies known and unknown steps', () => {
    expect(isKnownStep('scheme-details')).toBe(true)
    expect(isKnownStep('confirmation')).toBe(true)
    expect(isKnownStep('not-a-step')).toBe(false)
  })

  test('partners and additional-files have no field messages (optional fields)', () => {
    expect(STEPS.partners.fieldMessages()).toEqual({})
    expect(STEPS['additional-files'].fieldMessages()).toEqual({})
  })

  test('confirmation step exposes no-op fieldMessages and toSchemePatch', () => {
    expect(STEPS.confirmation.fieldMessages()).toEqual({})
    expect(STEPS.confirmation.toSchemePatch()).toEqual({})
    expect(STEPS.confirmation.next).toBeNull()
  })

  test('contact-address mirrors the address to both contact and service-of-notice fields', () => {
    const patch = STEPS['contact-address'].toSchemePatch({
      line1: '1 St',
      line2: '',
      town: 'Town',
      postcode: 'ls1 1aa'
    })
    expect(patch.contactAddress.postcode).toBe('LS1 1AA')
    expect(patch.serviceOfNoticeAddress).toEqual(patch.contactAddress)
    expect(patch.contactAddress.line2).toBeNull()
  })

  test('declaration toSchemePatch sets approvalStatus and submittedOn', () => {
    const patch = STEPS.declaration.toSchemePatch({ declarationAccepted: 'yes' })
    expect(patch.approvalStatus).toBe('submitted')
    expect(typeof patch.submittedOn).toBe('string')
  })
})
