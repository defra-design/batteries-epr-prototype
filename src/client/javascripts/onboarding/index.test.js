import { describe, expect, test } from 'vitest'

import * as onboarding from './index.js'

describe('onboarding/index re-exports', () => {
  test('exposes the wizard runner and persist helpers', () => {
    expect(typeof onboarding.runOnboardingStep).toBe('function')
    expect(typeof onboarding.persistProducerFields).toBe('function')
    expect(typeof onboarding.persistRegistrationFields).toBe('function')
    expect(typeof onboarding.submitRegistration).toBe('function')
    expect(typeof onboarding.readOnboardingState).toBe('function')
  })
})
