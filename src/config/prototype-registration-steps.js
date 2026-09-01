import { paths } from './paths.js'

export const PROTOTYPE_REGISTRATION_STEPS = [
  { id: 'batteryCategory', path: paths.prototypeRegistrationBatteryCategory },
  { id: 'tonnage', path: paths.prototypeRegistrationTonnage },
  { id: 'organisationType', path: paths.prototypeRegistrationOrganisationType },
  {
    id: 'companiesHouse',
    path: paths.prototypeRegistrationCompaniesHouse,
    next: 'appropriatePersonGuidance'
  },
  {
    id: 'partnershipDetails',
    path: paths.prototypeRegistrationPartnershipDetails,
    next: 'appropriatePersonGuidance'
  },
  {
    id: 'soleTraderDetails',
    path: paths.prototypeRegistrationSoleTraderDetails,
    next: 'appropriatePersonGuidance'
  },
  {
    id: 'overseasDetails',
    path: paths.prototypeRegistrationOverseasDetails,
    next: 'appropriatePersonGuidance'
  },
  {
    id: 'appropriatePersonGuidance',
    path: paths.prototypeRegistrationAppropriatePersonGuidance
  },
  {
    id: 'appropriatePerson',
    path: paths.prototypeRegistrationAppropriatePerson
  },
  {
    id: 'schemeMembership',
    path: paths.prototypeRegistrationSchemeMembership,
    next: 'checkAnswers'
  },
  { id: 'schemeSelect', path: paths.prototypeRegistrationSchemeSelect },
  { id: 'checkAnswers', path: paths.prototypeRegistrationCheckAnswers },
  { id: 'declaration', path: paths.prototypeRegistrationDeclaration },
  { id: 'complete', path: paths.prototypeRegistrationComplete }
]

export const findStep = (id) =>
  PROTOTYPE_REGISTRATION_STEPS.find((s) => s.id === id)

export const nextStepPath = (id) => {
  const idx = PROTOTYPE_REGISTRATION_STEPS.findIndex((s) => s.id === id)
  if (idx < 0) return null
  const step = PROTOTYPE_REGISTRATION_STEPS[idx]
  if (step.next) return findStep(step.next).path
  if (idx === PROTOTYPE_REGISTRATION_STEPS.length - 1) return null
  return PROTOTYPE_REGISTRATION_STEPS[idx + 1].path
}
