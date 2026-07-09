import joi from 'joi'

import { content } from '../../../../config/content.js'
import { paths } from '../../../../config/paths.js'
import {
  errorListToMap,
  flashStepErrors,
  readStepErrors
} from '../../application/shared.js'

const transferUrl = (id) =>
  paths.complianceSchemeEvidenceTransfer.replace('{evidenceId}', id)

const STEP_ID = (id) => `evidence-transfer:${id}`

const schema = joi
  .object({ counterpartySchemeId: joi.string().trim().min(1).required() })
  .options({ stripUnknown: true })

const renderView = (h, request, pageContent, evidenceId, viewModel) =>
  h.view('complianceScheme/evidence/transfer/view', {
    pageTitle: pageContent.title,
    heading: pageContent.heading,
    intro: pageContent.intro,
    labels: pageContent,
    errorTitle: content.complianceScheme(request).evidencePages.errorTitle,
    cancelUrl: paths.complianceSchemeEvidenceDetail.replace(
      '{evidenceId}',
      evidenceId
    ),
    action: transferUrl(evidenceId),
    ...viewModel
  })

export const transferController = {
  get: {
    handler(request, h) {
      const pageContent =
        content.complianceScheme(request).evidencePages.transfer
      const { evidenceId } = request.params
      const { errors, values } = readStepErrors(request, STEP_ID(evidenceId))
      return renderView(h, request, pageContent, evidenceId, {
        errorSummary: errors || [],
        errors: errorListToMap(errors),
        formValues: values || {},
        pagePayload: {
          view: 'transfer',
          target: 'hydrate',
          evidenceId
        }
      })
    }
  },

  post: {
    handler(request, h) {
      const pageContent =
        content.complianceScheme(request).evidencePages.transfer
      const { evidenceId } = request.params
      const payload = request.payload
      const { error, value } = schema.validate(payload)

      if (error) {
        const list = [
          {
            text: pageContent.error.counterpartySchemeId,
            href: '#counterpartySchemeId'
          }
        ]
        flashStepErrors(request, STEP_ID(evidenceId), list, payload)
        return h.redirect(transferUrl(evidenceId))
      }

      return renderView(h, request, pageContent, evidenceId, {
        errorSummary: [],
        errors: {},
        formValues: value,
        pagePayload: {
          view: 'transfer',
          target: 'persist',
          evidenceId,
          counterpartySchemeId: value.counterpartySchemeId,
          next: paths.complianceSchemeEvidence
        }
      })
    }
  }
}
