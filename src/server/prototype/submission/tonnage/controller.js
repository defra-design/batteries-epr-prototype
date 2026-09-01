import { paths } from '../../../../config/paths.js'
import { prototypeSubmissionContent } from '../../../../config/prototype-submission-content.js'
import { createRadioStep } from '../../radio-step.js'
import * as helpers from '../shared.js'

export const tonnageController = createRadioStep({
  helpers,
  target: 'registration',
  stepId: 'tonnage',
  path: paths.prototypeSubmissionTonnage,
  viewName: 'prototype/submission/tonnage/view',
  pageContent: prototypeSubmissionContent.tonnage,
  fieldName: 'tonnageBand',
  validValues: ['upTo1Tonne', 'over1Tonne'],
  backLink: paths.prototypeSubmissionBatteryCategory
})
