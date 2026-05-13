import { paths } from './paths.js'

export const ONBOARDING_STEPS = [
  {
    id: 'companyDetails',
    path: paths.onboardingCompanyDetails,
    target: 'producer'
  },
  {
    id: 'contactDetails',
    path: paths.onboardingContactDetails,
    target: 'producer'
  },
  {
    id: 'serviceOfNotice',
    path: paths.onboardingServiceOfNotice,
    target: 'producer'
  },
  {
    id: 'batteryTypes',
    path: paths.onboardingBatteryTypes,
    target: 'producer'
  },
  {
    id: 'brandNames',
    path: paths.onboardingBrandNames,
    target: 'producer'
  },
  {
    id: 'producerRoute',
    path: paths.onboardingProducerRoute,
    target: 'registration'
  },
  {
    id: 'declaration',
    path: paths.onboardingDeclaration,
    target: 'registration'
  },
  {
    id: 'confirmation',
    path: paths.onboardingConfirmation,
    target: 'none'
  }
]

export const COMPLIANCE_PERIOD = '2026'

export const findStep = (id) => ONBOARDING_STEPS.find((s) => s.id === id)

export const nextStepPath = (id) => {
  const idx = ONBOARDING_STEPS.findIndex((s) => s.id === id)
  if (idx < 0 || idx === ONBOARDING_STEPS.length - 1) return null
  return ONBOARDING_STEPS[idx + 1].path
}
