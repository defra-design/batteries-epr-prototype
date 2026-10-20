import Boom from '@hapi/boom'

import { paths, pathTo } from '../../../../../config/paths.js'
import { prototypeRegulatorWasteReturnsContent } from '../../../../../config/prototype-regulator-waste-returns-content.js'
import {
  basePageModel,
  buildTabs,
  findAbto,
  findScheme,
  fillTemplate,
  formatDateOnly,
  latestSubmittedOn,
  overallStatus,
  submissionsForScheme,
  submissionsForSchemeAbto
} from '../shared.js'

const content = prototypeRegulatorWasteReturnsContent

export const schemeAbtosController = {
  handler(request, h) {
    const { schemeId } = request.params
    const scheme = findScheme(schemeId)

    if (!scheme || submissionsForScheme(schemeId).length === 0) {
      throw Boom.notFound()
    }

    const pageContent = content.schemeAbtos
    const abtoIds = [
      ...new Set(submissionsForScheme(schemeId).map((s) => s.abtoId))
    ]

    const operators = abtoIds.map((abtoId) => {
      const abto = findAbto(abtoId)
      const submissions = submissionsForSchemeAbto(schemeId, abtoId)
      const status = overallStatus(submissions)
      const submittedOn = latestSubmittedOn(submissions)

      return {
        id: abto.id,
        name:
          abto.sites.length === 1
            ? `${abto.name} (${abto.sites[0].name})`
            : abto.name,
        href: pathTo(paths.prototypeRegulatorWasteReturnsAbtoSites, {
          schemeId,
          abtoId
        }),
        approval:
          submissions.length === 1
            ? abto.sites.find((s) => s.id === submissions[0].siteId)
                .approvalNumber
            : fillTemplate(pageContent.sitesTemplate, {
                count: submissions.length
              }),
        type: abto.type,
        submitted: submittedOn
          ? formatDateOnly(submittedOn)
          : pageContent.notSubmitted,
        statusLabel: content.statusLabels[status],
        statusColour: content.statusColours[status]
      }
    })

    return h.view('prototype/regulator/wasteReturns/schemeAbtos/view', {
      ...basePageModel(
        { ...pageContent, heading: scheme.name },
        paths.prototypeRegulatorWasteReturnsHome
      ),
      backLink: paths.prototypeRegulatorWasteReturnsHome,
      tabs: buildTabs('wasteReturns'),
      scheme,
      intro: fillTemplate(pageContent.intro, { scheme: scheme.name }),
      operators
    })
  }
}
