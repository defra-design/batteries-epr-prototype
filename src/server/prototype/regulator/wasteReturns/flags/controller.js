import { paths, pathTo } from '../../../../../config/paths.js'
import { prototypeRegulatorWasteReturnsContent } from '../../../../../config/prototype-regulator-waste-returns-content.js'
import { getAbtos } from '../store.js'
import {
  basePageModel,
  buildTabs,
  formatTonnes,
  isOverThreshold
} from '../shared.js'

const content = prototypeRegulatorWasteReturnsContent

export const flagsController = {
  handler(_request, h) {
    const pageContent = content.flags

    const flagged = getAbtos()
      .filter(isOverThreshold)
      .map((abto) => ({
        id: abto.id,
        name:
          abto.sites.length === 1
            ? `${abto.name} (${abto.sites[0].name})`
            : abto.name,
        approvalNumber: abto.sites[0].approvalNumber,
        classification:
          content.abtoAccount.classifications[abto.classification],
        bens: `${formatTonnes(abto.bensIssuedThisYear)} tonnes`,
        reviewHref: pathTo(paths.prototypeRegulatorWasteReturnsAbtoAccount, {
          abtoId: abto.id
        })
      }))

    return h.view('prototype/regulator/wasteReturns/flags/view', {
      ...basePageModel(pageContent, paths.prototypeRegulatorWasteReturnsHome),
      tabs: buildTabs('flags'),
      statusText: pageContent.exceeded,
      flagged
    })
  }
}
