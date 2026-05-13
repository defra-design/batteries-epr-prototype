import joi from 'joi'

import { content } from '../../../../config/content.js'
import { paths, pathTo } from '../../../../config/paths.js'
import {
  CHEMISTRIES,
  COMPLIANCE_PERIOD,
  SUB_CATEGORIES,
  collectErrors,
  errorListToMap,
  flashStepErrors,
  readStepErrors
} from '../../shared.js'

const STEP_ID = 'smallProducerTonnages'

const tonnageSchema = joi
  .string()
  .trim()
  .pattern(/^\d+(\.\d{1,3})?$/)
  .allow('')

const simpleFields = CHEMISTRIES.map((c) => `t_${c}`)
const detailedFields = CHEMISTRIES.flatMap((c) =>
  SUB_CATEGORIES.map((s) => `t_${c}_${s}`)
)
const allFields = [...simpleFields, ...detailedFields]

const schemaShape = {
  mode: joi.string().valid('simple', 'detailed').required()
}
for (const field of allFields) {
  schemaShape[field] = tonnageSchema.optional()
}
const schema = joi.object(schemaShape).options({ stripUnknown: true })

const fieldMessages = (errorContent, mode) => {
  const fields = mode === 'detailed' ? detailedFields : simpleFields
  const map = { mode: errorContent.mode }
  for (const f of fields) map[f] = errorContent.tonnes
  return map
}

const normaliseTonnage = (value) => {
  if (value == null || value === '') return '0.000'
  return Number(value).toFixed(3)
}

const buildLines = (payload, mode) => {
  if (mode === 'simple') {
    return CHEMISTRIES.map((chemistry) => ({
      category: 'portable',
      activity: 'placed',
      chemistry,
      subCategory: null,
      tonnes: normaliseTonnage(payload[`t_${chemistry}`])
    }))
  }
  return CHEMISTRIES.flatMap((chemistry) =>
    SUB_CATEGORIES.map((subCategory) => ({
      category: 'portable',
      activity: 'placed',
      chemistry,
      subCategory,
      tonnes: normaliseTonnage(payload[`t_${chemistry}_${subCategory}`])
    }))
  )
}

const sumLines = (lines) => {
  const total = lines.reduce((acc, line) => acc + Number(line.tonnes), 0)
  return total.toFixed(3)
}

const buildSavedFields = (payload) => {
  const useDetailedDataEntry = payload.mode === 'detailed'
  const lines = buildLines(payload, payload.mode)
  return {
    submissionType: 'smallProducerAnnual',
    useDetailedDataEntry,
    lines,
    totals: {
      placedTotal: sumLines(lines),
      collectedTotal: '0.000',
      deliveredTotal: '0.000',
      exportedTotal: '0.000'
    }
  }
}

const renderView = (h, pageContent, registrationId, viewModel) =>
  h.view('annualReturn/smallProducer/tonnages/view', {
    pageTitle: pageContent.title,
    heading: pageContent.heading,
    intro: pageContent.intro,
    labels: pageContent,
    chemistries: CHEMISTRIES,
    subCategories: SUB_CATEGORIES,
    errorTitle: pageContent.error.title,
    action: pathTo(paths.annualReturnSmallTonnages, { registrationId }),
    bundleName: 'annualReturnSmallTonnages.js',
    ...viewModel
  })

export const tonnagesController = {
  get: {
    handler(request, h) {
      const pageContent = content.annualReturnSmallTonnages(request)
      const { registrationId } = request.params
      const { errors, values } = readStepErrors(request, STEP_ID)

      return renderView(h, pageContent, registrationId, {
        errorSummary: errors || [],
        errors: errorListToMap(errors),
        formValues: values || { mode: 'simple' },
        pagePayload: {
          step: STEP_ID,
          target: 'hydrate',
          compliancePeriod: COMPLIANCE_PERIOD,
          registrationId,
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
          const pageContent = content.annualReturnSmallTonnages(request)
          const mode = request.payload?.mode
          const list = collectErrors(
            err,
            fieldMessages(pageContent.error, mode)
          )
          flashStepErrors(request, STEP_ID, list, request.payload)
          return h
            .redirect(
              pathTo(paths.annualReturnSmallTonnages, {
                registrationId: request.params.registrationId
              })
            )
            .takeover()
        }
      }
    },
    handler(request, h) {
      const pageContent = content.annualReturnSmallTonnages(request)
      const { registrationId } = request.params
      const savedFields = buildSavedFields(request.payload)

      return renderView(h, pageContent, registrationId, {
        errorSummary: [],
        errors: {},
        formValues: request.payload,
        pagePayload: {
          step: STEP_ID,
          target: 'submission',
          compliancePeriod: COMPLIANCE_PERIOD,
          registrationId,
          savedFields,
          nextStep: pathTo(paths.annualReturnSmallDeclaration, {
            registrationId
          })
        }
      })
    }
  }
}
