import { COMPLIANCE_PERIOD } from '../../config/onboarding-steps.js'

const FLASH_KEY = (stepId) => `annualReturnErrors:${stepId}`
const VALUES_KEY = (stepId) => `annualReturnValues:${stepId}`

export const flashStepErrors = (request, stepId, errors, values) => {
  request.yar.flash(FLASH_KEY(stepId), errors)
  request.yar.flash(VALUES_KEY(stepId), values)
}

export const readStepErrors = (request, stepId) => {
  const errors = request.yar.flash(FLASH_KEY(stepId))
  const valuesArr = request.yar.flash(VALUES_KEY(stepId))
  return {
    errors: errors.length ? errors : null,
    values: valuesArr[0] ?? null
  }
}

export const errorListToMap = (errorList) =>
  (errorList || []).reduce((acc, e) => {
    acc[e.href.replace(/^#/, '')] = e.text
    return acc
  }, {})

export const collectErrors = (joiError, fieldMessages) => {
  const seen = new Set()
  const list = []
  for (const detail of joiError.details) {
    const field = detail.path[0]
    if (seen.has(field)) continue
    seen.add(field)
    if (fieldMessages[field]) {
      list.push({ text: fieldMessages[field], href: `#${field}` })
    }
  }
  return list
}

export const CHEMISTRIES = ['leadAcid', 'nickelCadmium', 'other']
export const SUB_CATEGORIES = [
  'buttonCells',
  'coinCells',
  'generalUse',
  'lightMeansOfTransport',
  'other'
]

export const IA_CATEGORIES = ['industrial', 'automotive']
export const IA_ACTIVITIES = ['placed', 'collected', 'delivered', 'exported']

export { COMPLIANCE_PERIOD }
