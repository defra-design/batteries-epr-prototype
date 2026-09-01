import { paths } from './paths.js'
import {
  PROTOTYPE_REGISTRATION_STEPS,
  findStep,
  nextStepPath
} from './prototype-registration-steps.js'

describe('prototype registration steps', () => {
  test('every step has an id and a path under the prototype registration prefix', () => {
    for (const step of PROTOTYPE_REGISTRATION_STEPS) {
      expect(step.id).toEqual(expect.any(String))
      expect(step.path).toEqual(
        expect.stringContaining('/prototype/small-producer/registration')
      )
    }
  })

  test('findStep returns the step by id', () => {
    expect(findStep('tonnage').path).toBe(paths.prototypeRegistrationTonnage)
  })

  test('findStep returns undefined for an unknown id', () => {
    expect(findStep('nope')).toBeUndefined()
  })

  test('nextStepPath follows array order by default', () => {
    expect(nextStepPath('batteryCategory')).toBe(
      paths.prototypeRegistrationTonnage
    )
  })

  test('nextStepPath honours an explicit next id', () => {
    expect(nextStepPath('partnershipDetails')).toBe(
      paths.prototypeRegistrationAppropriatePersonGuidance
    )
    expect(nextStepPath('schemeMembership')).toBe(
      paths.prototypeRegistrationCheckAnswers
    )
  })

  test('nextStepPath returns null for the last step', () => {
    expect(nextStepPath('complete')).toBeNull()
  })

  test('nextStepPath returns null for an unknown id', () => {
    expect(nextStepPath('nope')).toBeNull()
  })
})
