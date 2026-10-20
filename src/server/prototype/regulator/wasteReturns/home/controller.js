import { paths, pathTo } from '../../../../../config/paths.js'
import { prototypeRegulatorWasteReturnsContent } from '../../../../../config/prototype-regulator-waste-returns-content.js'
import {
  basePageModel,
  buildTabs,
  getSchemes,
  submissionsForScheme
} from '../shared.js'

export const homeController = {
  handler(_request, h) {
    const pageContent = prototypeRegulatorWasteReturnsContent.home

    const schemes = getSchemes().map((scheme) => {
      const submissions = submissionsForScheme(scheme.id)
      const hasReturns = submissions.length > 0

      return {
        id: scheme.id,
        name: scheme.name,
        hasReturns,
        operatorsCount: new Set(submissions.map((s) => s.abtoId)).size,
        awaitingReviewCount: submissions.filter(
          (s) => s.status === 'awaitingReview'
        ).length,
        href: hasReturns
          ? pathTo(paths.prototypeRegulatorWasteReturnsSchemeAbtos, {
              schemeId: scheme.id
            })
          : null
      }
    })

    return h.view('prototype/regulator/wasteReturns/home/view', {
      ...basePageModel(pageContent, paths.prototypeRegulatorWasteReturnsHome),
      tabs: buildTabs('wasteReturns'),
      schemes
    })
  }
}
