import { paths } from '../../../config/paths.js'

export { collectErrors, errorListToMap } from '../onboarding/shared.js'

const SESSION_KEY = 'niAnnualReturn'
const ERROR_KEY = (stepId) => `niAnnualReturnErrors:${stepId}`
const VALUE_KEY = (stepId) => `niAnnualReturnValues:${stepId}`

export const NI_AR_STEPS = [
  { id: 'categories', path: paths.niAnnualReturnCategories },
  { id: 'placedOnMarket', path: paths.niAnnualReturnPlaced },
  { id: 'collection', path: paths.niAnnualReturnCollection },
  { id: 'recyclingEfficiency', path: paths.niAnnualReturnRecycling },
  { id: 'declaration', path: paths.niAnnualReturnDeclaration },
  { id: 'confirmation', path: paths.niAnnualReturnConfirmation }
]

export const nextStepPath = (stepId) => {
  const index = NI_AR_STEPS.findIndex((step) => step.id === stepId)
  const next = NI_AR_STEPS[index + 1]
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
