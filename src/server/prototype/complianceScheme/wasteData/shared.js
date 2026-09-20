import { createRequire } from 'node:module'

// Task-flow screens for the "BCS submission of waste data" journey use the
// same task-flow chrome as the PoM submission wizard: header, phase banner
// and back link only — no masthead navigation. The account home adds only
// the jurisdiction tabs.
export { taskFlowPageModel } from '../pomSubmission/shared.js'

const seedData = createRequire(import.meta.url)(
  '../../../../client/javascripts/storage-seed.json'
)

export const WASTE_DATA_YEAR = 2026
export const WASTE_DATA_QUARTER = 3

const SCHEME_ID = 'ironwave-compliance'

const seededScheme = () =>
  seedData.prototypeRegulatorSchemes.find((scheme) => scheme.id === SCHEME_ID)

export const getSubmitterName = () => seededScheme().authorisedSignatory.name

export const getQ3DueOn = () =>
  seedData.prototypeComplianceSchemeWasteQuarters.find(
    (quarter) =>
      quarter.year === WASTE_DATA_YEAR && quarter.quarter === WASTE_DATA_QUARTER
  ).dueOn

export const fill = (template, values) =>
  Object.entries(values).reduce(
    (text, [key, value]) => text.replaceAll(`{${key}}`, value),
    template
  )

const FLASH_KEY = (stepId) => `prototypeWasteDataErrors:${stepId}`
const VALUES_KEY = (stepId) => `prototypeWasteDataValues:${stepId}`

export const flashStepErrors = (request, stepId, errors, values) => {
  request.yar.flash(FLASH_KEY(stepId), errors)
  request.yar.flash(VALUES_KEY(stepId), values)
}

export const readStepErrors = (request, stepId) => {
  const errors = request.yar.flash(FLASH_KEY(stepId))
  const values = request.yar.flash(VALUES_KEY(stepId))
  return {
    errors: errors.length ? errors : null,
    values: values[0] ?? null
  }
}

export const errorListToMap = (errorList) =>
  (errorList || []).reduce((map, error) => {
    map[error.href.replace(/^#/, '')] = error.text
    return map
  }, {})

export const buildHydrationPayload = (stepId, extra = {}) => ({
  step: stepId,
  target: 'hydrate',
  ...extra
})

export const buildSavePayload = (stepId, savedFields, nextStep) => ({
  step: stepId,
  target: 'save',
  savedFields,
  nextStep
})
