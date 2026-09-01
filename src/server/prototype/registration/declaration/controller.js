import { paths } from '../../../../config/paths.js'
import { prototypeRegistrationContent } from '../../../../config/prototype-registration-content.js'
import {
  basePageModel,
  buildHydrationPayload,
  buildStepPayload
} from '../shared.js'

const STEP_ID = 'declaration'

const renderView = (h, pageContent, viewModel) =>
  h.view('prototype/registration/declaration/view', {
    ...basePageModel(pageContent),
    action: paths.prototypeRegistrationDeclaration,
    backLink: paths.prototypeRegistrationCheckAnswers,
    ...viewModel
  })

export const declarationController = {
  get: {
    handler(_request, h) {
      const pageContent = prototypeRegistrationContent.declaration

      return renderView(h, pageContent, {
        pagePayload: buildHydrationPayload(STEP_ID)
      })
    }
  },

  post: {
    handler(_request, h) {
      const pageContent = prototypeRegistrationContent.declaration

      return renderView(h, pageContent, {
        pagePayload: buildStepPayload(STEP_ID, 'submit', null)
      })
    }
  }
}
