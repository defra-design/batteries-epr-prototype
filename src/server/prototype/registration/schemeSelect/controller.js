import { paths } from '../../../../config/paths.js'
import { prototypeRegistrationContent } from '../../../../config/prototype-registration-content.js'
import { createRadioStepController } from '../radio-step.js'

export const schemeSelectController = createRadioStepController({
  stepId: 'schemeSelect',
  path: paths.prototypeRegistrationSchemeSelect,
  viewName: 'prototype/registration/schemeSelect/view',
  pageContent: prototypeRegistrationContent.schemeSelect,
  fieldName: 'schemeId',
  validValues: prototypeRegistrationContent.schemes.map((s) => s.id),
  backLink: paths.prototypeRegistrationSchemeMembership,
  extraViewModel: { schemes: prototypeRegistrationContent.schemes }
})
