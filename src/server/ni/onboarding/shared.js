import { paths } from '../../../config/paths.js'

const SESSION_KEY = 'niOnboarding'
const ERROR_KEY = (stepId) => `niOnboardingErrors:${stepId}`
const VALUE_KEY = (stepId) => `niOnboardingValues:${stepId}`

export const NI_STEPS = [
  { id: 'companyDetails', path: paths.niOnboardingCompanyDetails },
  { id: 'contactDetails', path: paths.niOnboardingContactDetails },
  { id: 'batteryCategories', path: paths.niOnboardingBatteryCategories },
  { id: 'brandNames', path: paths.niOnboardingBrandNames },
  { id: 'producerRoute', path: paths.niOnboardingProducerRoute },
  { id: 'carbonFootprint', path: paths.niOnboardingCarbonFootprint },
  { id: 'batteryPassport', path: paths.niOnboardingBatteryPassport },
  { id: 'dueDiligence', path: paths.niOnboardingDueDiligence },
  { id: 'declaration', path: paths.niOnboardingDeclaration },
  { id: 'confirmation', path: paths.niOnboardingConfirmation }
]

export const nextStepPath = (stepId) => {
  const index = NI_STEPS.findIndex((step) => step.id === stepId)
  const next = NI_STEPS[index + 1]
  return next ? next.path : paths.niDashboard
}

export const readData = (request) => request.yar.get(SESSION_KEY) ?? {}

export const saveData = (request, patch) => {
  const merged = { ...readData(request), ...patch }
  request.yar.set(SESSION_KEY, merged)
  return merged
}

export const flashErrors = (request, stepId, errorList, values) => {
  request.yar.flash(ERROR_KEY(stepId), errorList)
  request.yar.flash(VALUE_KEY(stepId), values)
}

export const readErrors = (request, stepId) => {
  const errors = request.yar.flash(ERROR_KEY(stepId))
  const values = request.yar.flash(VALUE_KEY(stepId))
  return {
    errorSummary: errors.length ? errors : [],
    values: values[0] ?? null
  }
}

export const errorListToMap = (errorList) =>
  (errorList ?? []).reduce((map, error) => {
    map[error.href.replace(/^#/, '')] = error.text
    return map
  }, {})

export const collectErrors = (joiError, fieldMessages) => {
  const seen = new Set()
  const list = []
  for (const detail of joiError.details) {
    const field = detail.path[0]
    if (seen.has(field) || !fieldMessages[field]) continue
    seen.add(field)
    list.push({ text: fieldMessages[field], href: `#${field}` })
  }
  return list
}
