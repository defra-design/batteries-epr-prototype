import { describe, expect, test } from 'vitest'

import { ONBOARDING_STEPS, findStep, nextStepPath } from './onboarding-steps.js'

describe('onboarding-steps', () => {
  test('exposes the canonical 8-step ordering', () => {
    expect(ONBOARDING_STEPS).toHaveLength(8)
    expect(ONBOARDING_STEPS[0].id).toBe('companyDetails')
    expect(ONBOARDING_STEPS[7].id).toBe('confirmation')
  })

  test('findStep returns the step record by id', () => {
    expect(findStep('declaration').target).toBe('registration')
  })

  test('findStep returns undefined for an unknown id', () => {
    expect(findStep('not-a-step')).toBeUndefined()
  })

  test('nextStepPath returns the next step path', () => {
    expect(nextStepPath('companyDetails')).toBe('/onboarding/contact-details')
  })

  test('nextStepPath returns null at the last step', () => {
    expect(nextStepPath('confirmation')).toBeNull()
  })

  test('nextStepPath returns null for an unknown id', () => {
    expect(nextStepPath('nope')).toBeNull()
  })
})
