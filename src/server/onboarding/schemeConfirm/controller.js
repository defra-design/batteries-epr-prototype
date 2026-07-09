import { content } from '../../../config/content.js'
import { paths } from '../../../config/paths.js'
import {
  actionWithReturn,
  buildHydrationPayload,
  buildStepPayload,
  isAllowedReturn
} from '../shared.js'

const STEP_ID = 'schemeConfirm'

const returnUrlFromRequest = (request) => {
  const value = request.query?.return
  return isAllowedReturn(value) ? value : null
}

const renderView = (h, pageContent, action, viewModel) =>
  h.view('onboarding/schemeConfirm/view', {
    pageTitle: pageContent.title,
    heading: pageContent.heading,
    intro: pageContent.intro,
    labels: pageContent,
    action,
    ...viewModel
  })

export const schemeConfirmController = {
  get: {
    handler(request, h) {
      const pageContent = content.onboardingSchemeConfirm(request)
      const returnUrl = returnUrlFromRequest(request)

      return renderView(
        h,
        pageContent,
        actionWithReturn(paths.onboardingSchemeConfirm, returnUrl),
        {
          pagePayload: buildHydrationPayload(request, STEP_ID)
        }
      )
    }
  },

  post: {
    handler(request, h) {
      const pageContent = content.onboardingSchemeConfirm(request)
      const returnUrl = returnUrlFromRequest(request)

      return renderView(
        h,
        pageContent,
        actionWithReturn(paths.onboardingSchemeConfirm, returnUrl),
        {
          pagePayload: buildStepPayload(
            request,
            STEP_ID,
            'registration',
            { schemeConfirmed: true },
            returnUrl || `${paths.onboardingDeclaration}?route=complianceScheme`
          )
        }
      )
    }
  }
}
