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

const STATUS_TAG_COLOUR = {
  queried: 'orange',
  submitted: 'blue'
}

export const schemeMembersController = {
  handler(request, h) {
    const { schemeId } = request.params

    if (!SCHEMES_WITH_DETAIL_SCREENS_BUILT.has(schemeId)) {
      throw Boom.notFound()
    }

    const pageContent = prototypeRegulatorContent.schemeMembers
    const scheme = seedData.prototypeRegulatorSchemes.find(
      (s) => s.id === schemeId
    )
    const currentSubmission = latestSubmissionFor(schemeId)

    const members = seedData.prototypeRegulatorSchemeMembers
      .filter((m) => m.schemeId === schemeId)
      .map((member) => ({
        companyName: member.companyName,
        bprn: member.bprn,
        producerSize: member.producerSize,
        joinedOn: member.joinedOn,
        statusLabel: pageContent.statusLabels[member.q2Status],
        statusColour: STATUS_TAG_COLOUR[member.q2Status]
      }))

    return h.view('prototype/regulator/pomSubmission/schemeMembers/view', {
      ...basePageModel(
        pageContent,
        paths.prototypeRegulatorPomSubmissionDashboard
      ),
      backLink: pathTo(paths.prototypeRegulatorPomSubmissionSchemeHome, {
        schemeId
      }),
      scheme,
      periodLabel: currentSubmission.periodLabel,
      members,
      recordHref: pathTo(paths.prototypeRegulatorPomSubmissionSchemeRecord, {
        schemeId
      })
    })
  }
}
