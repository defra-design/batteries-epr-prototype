import { paths } from '../../../../../config/paths.js'
import {
  queryCategoriesController,
  queryDetailsController,
  querySentController
} from './controller.js'

export const query = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.prototypeRegulatorWasteReturnsQueryCategories,
      ...queryCategoriesController.get
    },
    {
      method: 'POST',
      path: paths.prototypeRegulatorWasteReturnsQueryCategories,
      ...queryCategoriesController.post
    },
    {
      method: 'GET',
      path: paths.prototypeRegulatorWasteReturnsQueryDetails,
      ...queryDetailsController.get
    },
    {
      method: 'POST',
      path: paths.prototypeRegulatorWasteReturnsQueryDetails,
      ...queryDetailsController.post
    },
    {
      method: 'GET',
      path: paths.prototypeRegulatorWasteReturnsQuerySent,
      ...querySentController
    }
  ]
}
