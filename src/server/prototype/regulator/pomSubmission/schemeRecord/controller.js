import { createRequire } from 'node:module'
import Boom from '@hapi/boom'

import { paths, pathTo } from '../../../../../config/paths.js'
import { prototypeRegulatorContent } from '../../../../../config/prototype-regulator-content.js'
import {
  basePageModel,
  fill,
  formatDateOnly,
  SCHEMES_WITH_RECORD_BUILT
} from '../shared.js'

const seedData = createRequire(import.meta.url)(
  '../../../../../client/javascripts/storage-seed.json'
)

const rows = (entries) =>
  entries.map(([key, value]) => ({
    key: { text: key },
    value: { text: value }
  }))

export const schemeRecordController = {
  handler(request, h) {
    const { schemeId } = request.params

    if (!SCHEMES_WITH_RECORD_BUILT.has(schemeId)) {
      throw Boom.notFound()
    }

    const labels = prototypeRegulatorContent.schemeRecord
    const scheme = seedData.prototypeRegulatorSchemes.find(
      (s) => s.id === schemeId
    )
    const homeHref = pathTo(paths.prototypeRegulatorPomSubmissionSchemeHome, {
      schemeId
    })

    return h.view('prototype/regulator/pomSubmission/schemeRecord/view', {
      ...basePageModel(
        { ...labels, heading: scheme.name, intro: labels.intro },
        {
          backLink: {
            href: paths.prototypeRegulatorPomSubmissionDashboard,
            text: labels.backLink
          },
          headingTag: labels.status
        }
      ),
      reference: scheme.npwdRef,
      organisationRows: rows([
        [labels.organisation.legalName, scheme.companyName],
        [labels.organisation.tradingName, scheme.name],
        [
          labels.organisation.companiesHouseNumber,
          scheme.companyRegistrationNo
        ],
        [labels.organisation.registeredOffice, scheme.registeredOffice],
        [labels.organisation.nation, labels.nation]
      ]),
      approvalRows: rows([
        [labels.approval.number, scheme.approvalNumber],
        [labels.approval.approvedOn, formatDateOnly(scheme.approvedOn)],
        [labels.approval.expires, formatDateOnly(scheme.approvalExpires)],
        [labels.approval.status, labels.approvalStatus],
        [
          labels.approval.conditions,
          fill(labels.conditionsValue, {
            approvedOn: formatDateOnly(scheme.approvedOn)
          })
        ]
      ]),
      peopleRows: rows([
        [labels.people.authorisedSignatory, scheme.authorisedSignatory.name],
        [labels.people.superUser, scheme.superUser.name],
        [labels.people.accountManager, scheme.accountManager]
      ]),
      documentLinks: Object.entries(labels.documents).map(([key, text]) => ({
        key,
        text,
        href: '#'
      })),
      homeLink: {
        text: fill(labels.backToScheme, { scheme: scheme.name }),
        href: homeHref
      }
    })
  }
}
