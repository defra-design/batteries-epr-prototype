import { createRequire } from 'node:module'
import Boom from '@hapi/boom'

import { paths, pathTo } from '../../../../../config/paths.js'
import { prototypeRegulatorContent } from '../../../../../config/prototype-regulator-content.js'
import {
  basePageModel,
  SCHEMES_WITH_DETAIL_SCREENS_BUILT,
  latestSubmissionFor
} from '../shared.js'

const seedData = createRequire(import.meta.url)(
  '../../../../../client/javascripts/storage-seed.json'
)

const personLine = (person) => `${person.name} — ${person.email}`

const STATUS_TAG_COLOUR = {
  received: 'blue',
  accepted: 'green',
  queried: 'orange',
  rejected: 'red',
  notYetSubmitted: 'grey'
}

export const schemeRecordController = {
  handler(request, h) {
    const { schemeId } = request.params

    if (!SCHEMES_WITH_DETAIL_SCREENS_BUILT.has(schemeId)) {
      throw Boom.notFound()
    }

    const pageContent = prototypeRegulatorContent.schemeRecord
    const scheme = seedData.prototypeRegulatorSchemes.find(
      (s) => s.id === schemeId
    )
    const membersCount = seedData.prototypeRegulatorSchemeMembers.filter(
      (m) => m.schemeId === schemeId
    ).length
    const currentSubmission = latestSubmissionFor(schemeId)

    return h.view('prototype/regulator/pomSubmission/schemeRecord/view', {
      ...basePageModel(
        pageContent,
        paths.prototypeRegulatorPomSubmissionDashboard
      ),
      backLink: pathTo(paths.prototypeRegulatorPomSubmissionSchemeHome, {
        schemeId
      }),
      scheme,
      statusLabel:
        prototypeRegulatorContent.dashboard.pomSubmissionsTab.statusLabels[
          currentSubmission.status
        ],
      statusColour: STATUS_TAG_COLOUR[currentSubmission.status],
      authorisedSignatoryLine: personLine(scheme.authorisedSignatory),
      superUserLine: personLine(scheme.superUser),
      membersCount,
      membersHref: pathTo(paths.prototypeRegulatorPomSubmissionSchemeMembers, {
        schemeId
      }),
      submissionsHref: pathTo(
        paths.prototypeRegulatorPomSubmissionSchemeSubmissions,
        { schemeId }
      )
    })
  }
}
