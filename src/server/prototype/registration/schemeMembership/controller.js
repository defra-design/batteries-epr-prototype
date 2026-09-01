import { paths } from '../../../../config/paths.js'
import { prototypeRegistrationContent } from '../../../../config/prototype-registration-content.js'
import { createRadioStepController } from '../radio-step.js'

export const schemeMembershipController = createRadioStepController({
  stepId: 'schemeMembership',
  path: paths.prototypeRegistrationSchemeMembership,
  viewName: 'prototype/registration/schemeMembership/view',
  pageContent: prototypeRegistrationContent.schemeMembership,
  fieldName: 'schemeMembership',
  validValues: ['yes', 'no', 'intendToJoin'],
  backLink: paths.prototypeRegistrationAppropriatePerson,
  overrideFor: (value) =>
    value === 'yes' ? paths.prototypeRegistrationSchemeSelect : null
})
