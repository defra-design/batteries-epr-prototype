import { paths } from '../../../../config/paths.js'
import { prototypeSubmissionContent } from '../../../../config/prototype-submission-content.js'
import { createRadioStep } from '../../radio-step.js'
import * as helpers from '../shared.js'

export const brandQuestionController = createRadioStep({
  helpers,
  target: 'submission',
  stepId: 'brandQuestion',
  path: paths.prototypeSubmissionBrandQuestion,
  viewName: 'prototype/submission/brandQuestion/view',
  pageContent: prototypeSubmissionContent.brandQuestion,
  fieldName: 'hasBrand',
  validValues: ['yes', 'no'],
  backLink: paths.prototypeSubmissionCheckRegistration,
  overrideFor: (value) =>
    value === 'no' ? paths.prototypeSubmissionData : null,
  extraViewModel: { accountUrl: paths.prototypeSubmissionAccount }
})
