import joi from 'joi'

import { content } from '../../../../config/content.js'
import { paths, pathTo } from '../../../../config/paths.js'
import {
  getCompliancePeriod,
  collectErrors,
  errorListToMap,
  flashStepErrors,
  readStepErrors
} from '../../shared.js'
import { getCurrentDate } from '../../../../config/compliance-period.js'

const STEP_ID = 'iaDeclaration'

const schema = joi
  .object({
    declarationFirstName: joi.string().trim().min(1).required(),
    declarationLastName: joi.string().trim().min(1).required(),
    declarationPosition: joi.string().trim().min(1).required(),
    declarationConfirm: joi.string().valid('yes').required()
  })
  .options({ stripUnknown: true })

const fieldMessages = (errorContent) => ({
  declarationFirstName: errorContent.firstName,
  declarationLastName: errorContent.lastName,
  declarationPosition: errorContent.position,
  declarationConfirm: errorContent.confirm
})

const renderView = (h, pageContent, registrationId, viewModel) =>
  h.view('annualReturn/ia/declaration/view', {
    pageTitle: pageContent.title,
    heading: pageContent.heading,
    intro: pageContent.intro,
    labels: pageContent,
    errorTitle: pageContent.error.title,
    action: pathTo(paths.annualReturnIaDeclaration, { registrationId }),
    bundleName: 'annualReturnIaDeclaration.js',
    ...viewModel
  })

export const declarationController = {
  get: {
    handler(request, h) {
      const pageContent = content.annualReturnIaDeclaration(request)
      const { registrationId } = request.params
      const { errors, values } = readStepErrors(request, STEP_ID)

      return renderView(h, pageContent, registrationId, {
        errorSummary: errors || [],
        errors: errorListToMap(errors),
        formValues: values || {},
        pagePayload: {
          step: STEP_ID,
          target: 'hydrate',
          compliancePeriod: getCompliancePeriod(request),
          registrationId,
          signInUrl: paths.signIn,
          skipHydration: !!errors
        }
      })
    }
  },

  post: {
    options: {
      validate: {
        payload: schema,
        failAction: (request, h, err) => {
          const pageContent = content.annualReturnIaDeclaration(request)
          const list = collectErrors(err, fieldMessages(pageContent.error))
          flashStepErrors(request, STEP_ID, list, request.payload)
          return h
            .redirect(
              pathTo(paths.annualReturnIaDeclaration, {
                registrationId: request.params.registrationId
              })
            )
            .takeover()
        }
      }
    },
    handler(request, h) {
      const pageContent = content.annualReturnIaDeclaration(request)
      const { registrationId } = request.params
      const declaration = {
        firstName: request.payload.declarationFirstName,
        lastName: request.payload.declarationLastName,
        position: request.payload.declarationPosition,
        declaredAt: getCurrentDate(request).toISOString()
      }

      return renderView(h, pageContent, registrationId, {
        errorSummary: [],
        errors: {},
        formValues: request.payload,
        pagePayload: {
          step: STEP_ID,
          target: 'submission-submit',
          compliancePeriod: getCompliancePeriod(request),
          registrationId,
          savedFields: { declaration, status: 'Submitted' },
          nextStep: pathTo(paths.annualReturnIaConfirmation, {
            registrationId
          })
        }
      })
    }
  }
}
