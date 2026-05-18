import joi from 'joi'

import { content } from '../../../../config/content.js'
import { paths, pathTo } from '../../../../config/paths.js'
import {
  CHEMISTRIES,
  getCompliancePeriod,
  IA_ACTIVITIES,
  IA_CATEGORIES,
  collectErrors,
  errorListToMap,
  flashStepErrors,
  readStepErrors
} from '../../shared.js'

const STEP_ID = 'iaTonnages'

const tonnageSchema = joi
  .string()
  .trim()
  .pattern(/^\d+(\.\d{1,3})?$/)
  .allow('')

const fieldName = (category, activity, chemistry) =>
  `t_${category}_${activity}_${chemistry}`

const allFields = IA_CATEGORIES.flatMap((category) =>
  IA_ACTIVITIES.flatMap((activity) =>
    CHEMISTRIES.map((chemistry) => fieldName(category, activity, chemistry))
  )
)

const schemaShape = {}
for (const field of allFields) {
  schemaShape[field] = tonnageSchema.optional()
}
const schema = joi.object(schemaShape).options({ stripUnknown: true })

const fieldMessages = (errorContent) => {
  const map = {}
  for (const field of allFields) map[field] = errorContent.tonnes
  return map
}

const normaliseTonnage = (value) => {
  if (value == null || value === '') return '0.000'
  return Number(value).toFixed(3)
}

const buildLines = (payload) =>
  IA_CATEGORIES.flatMap((category) =>
    IA_ACTIVITIES.flatMap((activity) =>
      CHEMISTRIES.map((chemistry) => ({
        category,
        activity,
        chemistry,
        subCategory: null,
        tonnes: normaliseTonnage(
          payload[fieldName(category, activity, chemistry)]
        )
      }))
    )
  )

const sumByActivity = (lines, activity) =>
  lines
    .filter((line) => line.activity === activity)
    .reduce((acc, line) => acc + Number(line.tonnes), 0)
    .toFixed(3)

const buildSavedFields = (payload) => {
  const lines = buildLines(payload)
  return {
    submissionType: 'industrialAutomotiveAnnual',
    useDetailedDataEntry: false,
    lines,
    totals: {
      placedTotal: sumByActivity(lines, 'placed'),
      collectedTotal: sumByActivity(lines, 'collected'),
      deliveredTotal: sumByActivity(lines, 'delivered'),
      exportedTotal: sumByActivity(lines, 'exported')
    }
  }
}

const renderView = (h, pageContent, registrationId, viewModel) =>
  h.view('annualReturn/ia/tonnages/view', {
    pageTitle: pageContent.title,
    heading: pageContent.heading,
    intro: pageContent.intro,
    labels: pageContent,
    categories: IA_CATEGORIES,
    activities: IA_ACTIVITIES,
    chemistries: CHEMISTRIES,
    errorTitle: pageContent.error.title,
    action: pathTo(paths.annualReturnIaTonnages, { registrationId }),
    bundleName: 'annualReturnIaTonnages.js',
    ...viewModel
  })

export const tonnagesController = {
  get: {
    handler(request, h) {
      const pageContent = content.annualReturnIaTonnages(request)
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
          const pageContent = content.annualReturnIaTonnages(request)
          const list = collectErrors(err, fieldMessages(pageContent.error))
          flashStepErrors(request, STEP_ID, list, request.payload)
          return h
            .redirect(
              pathTo(paths.annualReturnIaTonnages, {
                registrationId: request.params.registrationId
              })
            )
            .takeover()
        }
      }
    },
    handler(request, h) {
      const pageContent = content.annualReturnIaTonnages(request)
      const { registrationId } = request.params
      const savedFields = buildSavedFields(request.payload)

      return renderView(h, pageContent, registrationId, {
        errorSummary: [],
        errors: {},
        formValues: request.payload,
        pagePayload: {
          step: STEP_ID,
          target: 'submission',
          compliancePeriod: getCompliancePeriod(request),
          registrationId,
          savedFields,
          nextStep: pathTo(paths.annualReturnIaDeclaration, {
            registrationId
          })
        }
      })
    }
  }
}
