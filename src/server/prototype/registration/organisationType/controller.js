import { paths } from '../../../../config/paths.js'
import { prototypeRegistrationContent } from '../../../../config/prototype-registration-content.js'
import { createRadioStepController } from '../radio-step.js'

const DETAIL_PAGES = {
  limitedCompany: paths.prototypeRegistrationCompaniesHouse,
  llp: paths.prototypeRegistrationCompaniesHouse,
  partnership: paths.prototypeRegistrationPartnershipDetails,
  soleTrader: paths.prototypeRegistrationSoleTraderDetails,
  overseas: paths.prototypeRegistrationOverseasDetails
}

export const organisationTypeController = createRadioStepController({
  stepId: 'organisationType',
  path: paths.prototypeRegistrationOrganisationType,
  viewName: 'prototype/registration/organisationType/view',
  pageContent: prototypeRegistrationContent.organisationType,
  fieldName: 'organisationType',
  validValues: Object.keys(DETAIL_PAGES),
  backLink: paths.prototypeRegistrationTonnage,
  overrideFor: (value) => DETAIL_PAGES[value]
})
