import { describe, expect, test } from 'vitest'

import { STEPS, STEP_ORDER, isKnownStep } from './steps.js'

describe('operator application steps', () => {
  test('STEP_ORDER contains exactly 5 steps', () => {
    expect(STEP_ORDER).toEqual([
      'operator-details',
      'registered-address',
      'site-details',
      'declaration',
      'confirmation'
    ])
  })

  test('every step in STEP_ORDER is defined in STEPS', () => {
    for (const step of STEP_ORDER) {
      expect(STEPS[step]).toBeDefined()
    }
  })

  test('isKnownStep returns true for known steps', () => {
    expect(isKnownStep('operator-details')).toBe(true)
    expect(isKnownStep('confirmation')).toBe(true)
  })

  test('isKnownStep returns false for unknown steps', () => {
    expect(isKnownStep('bogus')).toBe(false)
  })

  test('each form step has a schema and toOperatorPatch', () => {
    for (const step of STEP_ORDER.filter((s) => s !== 'confirmation')) {
      expect(STEPS[step].schema).toBeTruthy()
      expect(typeof STEPS[step].toOperatorPatch).toBe('function')
    }
  })

  test('confirmation step has no schema', () => {
    expect(STEPS.confirmation.schema).toBeNull()
  })

  test('operator-details toOperatorPatch extracts name, type, and reg no', () => {
    const patch = STEPS['operator-details'].toOperatorPatch({
      name: 'Test',
      approvalType: 'abe',
      companyRegistrationNo: '12345678'
    })
    expect(patch).toEqual({
      name: 'Test',
      approvalType: 'abe',
      companyRegistrationNo: '12345678'
    })
  })

  test('registered-address toOperatorPatch produces a registeredAddress object', () => {
    const patch = STEPS['registered-address'].toOperatorPatch({
      line1: '1 St',
      line2: '',
      town: 'Town',
      postcode: 'ls1 1aa'
    })
    expect(patch.registeredAddress.line1).toBe('1 St')
    expect(patch.registeredAddress.line2).toBeNull()
    expect(patch.registeredAddress.postcode).toBe('LS1 1AA')
    expect(patch.registeredAddress.countryCode).toBe('GB')
  })

  test('site-details toOperatorPatch produces batteryTypes and sites array', () => {
    const patch = STEPS['site-details'].toOperatorPatch({
      siteName: 'My Site',
      siteLine1: '1 Way',
      siteTown: 'Sheffield',
      sitePostcode: 's1 1aa',
      isPortable: 'yes',
      isIndustrial: '',
      isAutomotive: 'yes',
      operationsDescription: 'Recycling'
    })
    expect(patch.batteryTypes).toEqual({
      isPortable: true,
      isIndustrial: false,
      isAutomotive: true
    })
    expect(patch.sites).toHaveLength(1)
    expect(patch.sites[0].name).toBe('My Site')
    expect(patch.sites[0].address.postcode).toBe('S1 1AA')
    expect(patch.sites[0].operationsDescription).toBe('Recycling')
  })

  test('declaration toOperatorPatch sets submitted status', () => {
    const patch = STEPS.declaration.toOperatorPatch({
      declarationAccepted: 'yes'
    })
    expect(patch.approvalStatus).toBe('submitted')
    expect(patch.submittedOn).toBeTruthy()
  })

  test('confirmation toOperatorPatch returns empty patch', () => {
    expect(STEPS.confirmation.toOperatorPatch()).toEqual({})
  })

  test('confirmation fieldMessages returns empty object', () => {
    expect(STEPS.confirmation.fieldMessages()).toEqual({})
  })

  test('step chains link correctly', () => {
    expect(STEPS['operator-details'].next).toBe('registered-address')
    expect(STEPS['registered-address'].next).toBe('site-details')
    expect(STEPS['site-details'].next).toBe('declaration')
    expect(STEPS.declaration.next).toBe('confirmation')
    expect(STEPS.confirmation.next).toBeNull()
  })
})
