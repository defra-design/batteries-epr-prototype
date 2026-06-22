import { paths } from '../../../../config/paths.js'
import { collectionController } from './controller.js'

export const collection = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.niAnnualReturnCollection,
      ...collectionController.get
    },
    {
      method: 'POST',
      path: paths.niAnnualReturnCollection,
      ...collectionController.post
    }
  ]
}
