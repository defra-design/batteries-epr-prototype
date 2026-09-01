import { paths } from '../../../../config/paths.js'
import { prototypeSubmissionContent } from '../../../../config/prototype-submission-content.js'
import {
  basePageModel,
  buildHydrationPayload,
  buildStepPayload
} from '../shared.js'

const STEP_ID = 'payment'

const renderView = (h, pageContent, viewModel) =>
  h.view('prototype/submission/payment/view', {
    ...basePageModel(pageContent),
    action: paths.prototypeSubmissionPayment,
    backLink: paths.prototypeSubmissionPayFee,
    cancelUrl: paths.prototypeSubmissionAccount,
    ...viewModel
  })

export const paymentController = {
  get: {
    handler(_request, h) {
      const pageContent = prototypeSubmissionContent.payment

      return renderView(h, pageContent, {
        pagePayload: buildHydrationPayload(STEP_ID)
      })
    }
  },

  post: {
    handler(_request, h) {
      const pageContent = prototypeSubmissionContent.payment

      return renderView(h, pageContent, {
        pagePayload: buildStepPayload(STEP_ID, 'payment', null)
      })
    }
  }
}
