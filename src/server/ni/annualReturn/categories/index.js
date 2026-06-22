import { paths } from '../../../../config/paths.js'
import { categoriesController } from './controller.js'

export const categories = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.niAnnualReturnCategories,
      ...categoriesController.get
    },
    {
      method: 'POST',
      path: paths.niAnnualReturnCategories,
      ...categoriesController.post
    }
  ]
}
