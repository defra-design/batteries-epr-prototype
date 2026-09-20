import joi from 'joi'

import { paths } from '../../../../../config/paths.js'
import { PROTOTYPE_ABTO_OPERATOR_NAME } from '../../../../../config/prototype-abto-content.js'
import { prototypeComplianceSchemeContent } from '../../../../../config/prototype-compliance-scheme-content.js'
import {
  buildHydrationPayload,
  buildSavePayload,
  errorListToMap,
  fill,
  flashStepErrors,
  readStepErrors,
  taskFlowPageModel
} from '../shared.js'

const STEP_ID = 'enter'
const pageContent = () => prototypeComplianceSchemeContent.wasteData.enter

const TONNES_NUMBER = /^\d+(\.\d+)?$/
const TONNES_THREE_DECIMALS = /^\d+\.\d{3}$/

const tonnesField = joi.string().trim().allow('').default('')

const schema = joi
  .object({ collectedTonnes: tonnesField, deliveredTonnes: tonnesField })
  .options({ stripUnknown: true })

const validateTonnes = (value, messages) => {
  if (!value) return messages.required
  if (!TONNES_NUMBER.test(value)) return messages.format
  if (!TONNES_THREE_DECIMALS.test(value)) return messages.decimals
  if (Number(value) <= 0) return messages.positive
  return null
}

export const validateEnter = ({ collectedTonnes, deliveredTonnes }) => {
  const { error: messages } = pageContent()
  const errors = []

  const collectedError = validateTonnes(
    collectedTonnes,
    messages.collectedTonnes
  )
  if (collectedError) {
    errors.push({ text: collectedError, href: '#collectedTonnes' })
  }

  const deliveredError =
    validateTonnes(deliveredTonnes, messages.deliveredTonnes) ??
    (!collectedError && Number(deliveredTonnes) > Number(collectedTonnes)
      ? messages.deliveredTonnes.exceeds
      : null)
  if (deliveredError) {
    errors.push({ text: deliveredError, href: '#deliveredTonnes' })
  }

  return errors
}

const renderView = (h, viewModel) => {
  const content = pageContent()

  return h.view('prototype/complianceScheme/wasteData/enter/view', {
    ...taskFlowPageModel(content),
    errorTitle: content.error.title,
    action: paths.prototypeWasteDataEnter,
    backLink: paths.prototypeWasteDataStart,
    startUrl: paths.prototypeWasteDataStart,
    accountHomeUrl: paths.prototypeWasteDataAccountHome,
    deliveredHint: fill(content.delivered.hintTemplate, {
      operator: PROTOTYPE_ABTO_OPERATOR_NAME
    }),
    ...viewModel
  })
}

export const enterController = {
  get: {
    handler(request, h) {
      const { errors, values } = readStepErrors(request, STEP_ID)

      return renderView(h, {
        errorSummary: errors || [],
        errors: errorListToMap(errors),
        formValues: values || {},
        pagePayload: buildHydrationPayload(STEP_ID, {
          skipHydration: !!errors
        })
      })
    }
  },

  post: {
    options: { validate: { payload: schema } },
    handler(request, h) {
      const errors = validateEnter(request.payload)

      if (errors.length) {
        flashStepErrors(request, STEP_ID, errors, request.payload)
        return h.redirect(paths.prototypeWasteDataEnter)
      }

      const { collectedTonnes, deliveredTonnes } = request.payload

      return renderView(h, {
        errorSummary: [],
        errors: {},
        formValues: request.payload,
        pagePayload: buildSavePayload(
          STEP_ID,
          { collectedTonnes, deliveredTonnes },
          paths.prototypeWasteDataCheck
        )
      })
    }
  }
}
