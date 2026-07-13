import joi from 'joi'

import { content } from '../../../config/content.js'
import { paths } from '../../../config/paths.js'

const AGENCIES = [
  { code: 'EA', name: 'Environment Agency' },
  { code: 'NRW', name: 'Natural Resources Wales' },
  { code: 'SEPA', name: 'Scottish Environment Protection Agency' },
  { code: 'NIEA', name: 'Northern Ireland Environment Agency' }
]

const REGULATOR_USERS = {
  EA: ['Priya Shah', 'Daniel Okafor', 'Rachel Bennett'],
  NRW: ['Gareth Pugh', 'Ffion Davies'],
  SEPA: ['Iain Cameron', 'Morag Sinclair'],
  NIEA: ['Sean Doherty', 'Aoife Kelly']
}

const userField = (agencyCode) => `regulatorUser${agencyCode}`

const schema = joi
  .object({
    agencyCode: joi.string().valid('EA', 'NRW', 'SEPA', 'NIEA').required()
  })
  .pattern(/^regulatorUser(EA|NRW|SEPA|NIEA)$/, joi.string().allow(''))
  .options({ stripUnknown: true })

const agencyViewModel = (formValues) =>
  AGENCIES.map((agency) => ({
    ...agency,
    users: REGULATOR_USERS[agency.code].map((name) => ({
      value: name,
      text: name,
      selected: formValues[userField(agency.code)] === name
    }))
  }))

const resolveRegulatorUser = (payload) => {
  const users = REGULATOR_USERS[payload.agencyCode]
  const chosen = payload[userField(payload.agencyCode)]
  return users.includes(chosen) ? chosen : users[0]
}

const renderView = (h, request, viewModel) => {
  const pageContent = content.regulatorSignIn(request)
  return h.view('regulator/signIn/view', {
    pageTitle: pageContent.title,
    heading: pageContent.heading,
    intro: pageContent.intro,
    labels: pageContent,
    errorTitle: pageContent.error.title,
    action: paths.regulatorSignIn,
    cancelUrl: paths.home,
    ...viewModel
  })
}

export const signInController = {
  get: {
    handler(request, h) {
      return renderView(h, request, {
        errorSummary: [],
        errors: {},
        formValues: {},
        agencies: agencyViewModel({}),
        pagePayload: { target: 'hydrate' }
      })
    }
  },
  post: {
    options: {
      validate: {
        payload: schema,
        failAction(request, h, _err) {
          const pageContent = content.regulatorSignIn(request)
          return renderView(h, request, {
            errorSummary: [
              { text: pageContent.error.choice, href: '#agencyCode' }
            ],
            errors: { agencyCode: pageContent.error.choice },
            formValues: request.payload,
            agencies: agencyViewModel(request.payload),
            pagePayload: { target: 'hydrate' }
          }).takeover()
        }
      }
    },
    handler(request, h) {
      return renderView(h, request, {
        errorSummary: [],
        errors: {},
        formValues: request.payload,
        agencies: agencyViewModel(request.payload),
        pagePayload: {
          target: 'setCurrentAgencyCode',
          agencyCode: request.payload.agencyCode,
          regulatorUser: resolveRegulatorUser(request.payload),
          nextStep: paths.regulatorDashboard
        }
      })
    }
  }
}
