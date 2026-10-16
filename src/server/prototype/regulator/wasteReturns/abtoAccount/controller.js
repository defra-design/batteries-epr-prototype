import { paths, pathTo } from '../../../../../config/paths.js'
import { prototypeRegulatorWasteReturnsContent } from '../../../../../config/prototype-regulator-waste-returns-content.js'
import {
  abtoFacts,
  basePageModel,
  fillTemplate,
  findScheme,
  formatDateOnly,
  formatTonnes,
  isOverThreshold,
  loadAbto
} from '../shared.js'

const content = prototypeRegulatorWasteReturnsContent

export const abtoAccountController = {
  handler(request, h) {
    const abto = loadAbto(request.params)
    const pageContent = content.abtoAccount
    const site = abto.sites[0]

    // Overview is the only tab built; the others stay dead links.
    const accountTabs = [
      {
        key: 'overview',
        text: pageContent.tabs.overview,
        current: true,
        href: '#'
      },
      { key: 'submissions', text: pageContent.tabs.submissions, href: '#' },
      { key: 'evidenceNotes', text: pageContent.tabs.evidenceNotes, href: '#' },
      {
        key: 'complianceHistory',
        text: pageContent.tabs.complianceHistory,
        href: '#'
      }
    ]

    return h.view('prototype/regulator/wasteReturns/abtoAccount/view', {
      ...basePageModel(
        { ...pageContent, heading: abto.name },
        paths.prototypeRegulatorWasteReturnsHome
      ),
      backLink: paths.prototypeRegulatorWasteReturnsFlags,
      facts: abtoFacts(abto, pageContent.factsLabels),
      tabs: accountTabs,
      summaryRows: [
        { label: pageContent.summaryLabels.tradingName, text: abto.name },
        { label: pageContent.summaryLabels.siteAddress, text: site.address },
        {
          label: pageContent.summaryLabels.operatorType,
          text: pageContent.operatorTypes[abto.type]
        },
        {
          label: pageContent.summaryLabels.approvedSince,
          text: formatDateOnly(`${abto.approvedSince}T00:00:00`)
        },
        {
          label: pageContent.summaryLabels.schemesServed,
          text: abto.schemeIds.map((id) => findScheme(id).name).join(', ')
        }
      ],
      showThresholdWarning: isOverThreshold(abto),
      thresholdWarningBody: fillTemplate(pageContent.thresholdWarningTemplate, {
        abto: abto.name,
        tonnes: formatTonnes(abto.bensIssuedThisYear)
      }),
      reviewHref: pathTo(paths.prototypeRegulatorWasteReturnsClassification, {
        abtoId: abto.id
      })
    })
  }
}
