import { paths } from '../../../../config/paths.js'
import { prototypeRegistrationContent } from '../../../../config/prototype-registration-content.js'
import { createRadioStepController } from '../radio-step.js'

export const tonnageController = createRadioStepController({
  stepId: 'tonnage',
  path: paths.prototypeRegistrationTonnage,
  viewName: 'prototype/registration/tonnage/view',
  pageContent: prototypeRegistrationContent.tonnage,
  fieldName: 'tonnageBand',
  validValues: ['upTo1Tonne', 'over1Tonne'],
  backLink: paths.prototypeRegistrationBatteryCategory
})
