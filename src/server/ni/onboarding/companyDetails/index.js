import { paths } from '../../../../config/paths.js'
import { companyDetailsController } from './controller.js'

export const companyDetails = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.niOnboardingCompanyDetails,
      ...companyDetailsController.get
    },
    {
      method: 'POST',
      path: paths.niOnboardingCompanyDetails,
      ...companyDetailsController.post
    }
  ]
}
