import { describe, expect, test } from 'vitest'

import { paths } from '../../../config/paths.js'
import { PROTOTYPE_SUBMISSION_SERVICE_NAME } from '../../../config/prototype-submission-content.js'
import { basePageModel, buildStepPayload } from './shared.js'

describe('shared prototype submission helpers', () => {
  test('basePageModel carries the submission service name and an empty navigation', () => {
    const model = basePageModel({ title: 'T', heading: 'H' })
    expect(model).toEqual({
      pageTitle: 'T',
      heading: 'H',
      labels: { title: 'T', heading: 'H' },
      serviceName: PROTOTYPE_SUBMISSION_SERVICE_NAME,
      navigation: []
    })
  })

  test('buildStepPayload includes the next submission step path', () => {
    expect(
      buildStepPayload('data', 'submission', { unit: 'kilograms' })
    ).toEqual({
      step: 'data',
      target: 'submission',
      savedFields: { unit: 'kilograms' },
      nextStep: paths.prototypeSubmissionCheckData
    })
  })

  test('buildStepPayload yields nextStep null for the last step', () => {
    expect(
      buildStepPayload('paymentConfirmed', 'none', null).nextStep
    ).toBeNull()
  })

  test('buildStepPayload uses the override path when provided', () => {
    expect(
      buildStepPayload('brandQuestion', 'submission', { hasBrand: 'no' }, '/x')
        .nextStep
    ).toBe('/x')
  })
})
