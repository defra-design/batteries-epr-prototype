import { paths } from '../../../../config/paths.js'
import { companiesHouseController } from './controller.js'

export const companiesHouse = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.prototypeRegistrationCompaniesHouse,
      ...companiesHouseController.get
    },
    {
      method: 'POST',
      path: paths.prototypeRegistrationCompaniesHouse,
      ...companiesHouseController.post
    }
  ]
}
