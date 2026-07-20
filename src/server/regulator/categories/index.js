import { paths } from '../../../config/paths.js'
import { categoriesController } from './controller.js'

export const regulatorCategories = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.regulatorCategories,
      ...categoriesController.get
    },
    {
      method: 'POST',
      path: paths.regulatorCategories,
      ...categoriesController.post
    }
  ]
}
