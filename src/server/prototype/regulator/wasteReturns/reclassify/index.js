import { paths } from '../../../../../config/paths.js'
import {
  classificationConfirmController,
  classificationController,
  reclassifiedController
} from './controller.js'

export const reclassify = {
  openRoutes: [
    {
      method: 'GET',
      path: paths.prototypeRegulatorWasteReturnsClassification,
      ...classificationController.get
    },
    {
      method: 'POST',
      path: paths.prototypeRegulatorWasteReturnsClassification,
      ...classificationController.post
    },
    {
      method: 'GET',
      path: paths.prototypeRegulatorWasteReturnsClassificationConfirm,
      ...classificationConfirmController.get
    },
    {
      method: 'POST',
      path: paths.prototypeRegulatorWasteReturnsClassificationConfirm,
      ...classificationConfirmController.post
    },
    {
      method: 'GET',
      path: paths.prototypeRegulatorWasteReturnsReclassified,
      ...reclassifiedController
    }
  ]
}
