import { createRequire } from 'node:module'
import Boom from '@hapi/boom'

import { paths, pathTo } from '../../../../../config/paths.js'
import { prototypeRegulatorContent } from '../../../../../config/prototype-regulator-content.js'
import {
  basePageModel,
  fill,
  formatDateOnly,
  latestSubmissionFor,
  normaliseMemberName,
  SCHEMES_WITH_DETAIL_SCREENS_BUILT
} from '../shared.js'
import { getMemberFigures, getQueriedRecords } from '../store.js'

const seedData = createRequire(import.meta.url)(
  '../../../../../client/javascripts/storage-seed.json'
)

// A member's tag for the current return: queried once the regulator has sent
// them a query, "No figures" when the return holds nothing for them, otherwise
// included.
const returnStatusFor = (member, submission) => {
  const name = normaliseMemberName(member.companyName)
  const hasFigures = getMemberFigures().some(
    (figure) =>
      figure.schemeId === member.schemeId &&
      normaliseMemberName(figure.member) === name
  )
  const queried = getQueriedRecords().some(
    (record) =>
      record.schemeId === member.schemeId &&
      record.compliancePeriodYear === submission.compliancePeriodYear &&
      record.quarter === submission.quarter &&
      normaliseMemberName(record.member) === name
  )
  if (queried) {
    return 'queried'
  }
  return hasFigures ? 'included' : 'noFigures'
}

export const schemeMembersController = {
  handler(request, h) {
    const { schemeId } = request.params

    if (!SCHEMES_WITH_DETAIL_SCREENS_BUILT.has(schemeId)) {
      throw Boom.notFound()
    }

    const labels = prototypeRegulatorContent.schemeMembers
    const scheme = seedData.prototypeRegulatorSchemes.find(
      (s) => s.id === schemeId
    )
    const submission = latestSubmissionFor(schemeId)

    const members = seedData.prototypeRegulatorSchemeMembers
      .filter((member) => member.schemeId === schemeId)
      .map((member) => {
        const status = labels.statusLabels[returnStatusFor(member, submission)]
        return {
          companyName: member.companyName,
          bprn: member.bprn,
          joinedOn: formatDateOnly(member.joinedOn),
          status
        }
      })

    return h.view('prototype/regulator/pomSubmission/schemeMembers/view', {
      ...basePageModel(
        {
          ...labels,
          heading: labels.title,
          intro: `${scheme.name} — ${scheme.npwdRef}`
        },
        {
          backLink: {
            href: paths.prototypeRegulatorPomSubmissionDashboard,
            text: labels.backLink
          }
        }
      ),
      summary: fill(labels.intro, {
        count: members.length,
        year: submission.compliancePeriodYear
      }),
      returnColumn: fill(labels.columns.returnStatus, {
        period: submission.periodLabel
      }),
      members,
      submissionsHref: pathTo(
        paths.prototypeRegulatorPomSubmissionSchemeSubmissions,
        { schemeId }
      ),
      homeLink: {
        text: fill(labels.backToScheme, { scheme: scheme.name }),
        href: pathTo(paths.prototypeRegulatorPomSubmissionSchemeHome, {
          schemeId
        })
      }
    })
  }
}
