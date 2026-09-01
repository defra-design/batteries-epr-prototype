import { paths } from './paths.js'
import {
  PROTOTYPE_SUBMISSION_STEPS,
  findStep,
  nextStepPath
} from './prototype-submission-steps.js'

describe('prototype submission steps', () => {
  test('every step has an id and a path under the prototype submission prefix', () => {
    for (const step of PROTOTYPE_SUBMISSION_STEPS) {
      expect(step.id).toEqual(expect.any(String))
      expect(step.path).toEqual(
        expect.stringContaining('/prototype/small-producer/submission')
      )
    }
  })

  test('findStep returns the step by id', () => {
    expect(findStep('data').path).toBe(paths.prototypeSubmissionData)
  })

  test('nextStepPath follows array order', () => {
    expect(nextStepPath('batteryCategory')).toBe(
      paths.prototypeSubmissionTonnage
    )
    expect(nextStepPath('checkData')).toBe(paths.prototypeSubmissionPayFee)
  })

  test('nextStepPath returns null for the last step and unknown ids', () => {
    expect(nextStepPath('paymentConfirmed')).toBeNull()
    expect(nextStepPath('nope')).toBeNull()
  })
})
