import { createRequire } from 'node:module'

import { paths } from '../../../../../config/paths.js'
import {
  PROTOTYPE_COMPLIANCE_SCHEME_NAME,
  prototypeComplianceSchemeContent
} from '../../../../../config/prototype-compliance-scheme-content.js'
import { formatDate } from '../../../../../config/nunjucks/filters/format-date.js'
import {
  fill,
  taskFlowPageModel,
  WASTE_DATA_QUARTER,
  WASTE_DATA_YEAR
} from '../shared.js'

const seedData = createRequire(import.meta.url)(
  '../../../../../client/javascripts/storage-seed.json'
)

const formatTonnes = (tonnes) => tonnes.toFixed(3)

const buildQuarterRow = (quarter, statuses) => {
  const status = statuses[quarter.status]
  const isStartable = quarter.status === 'notStarted'
  const isSubmittable = quarter.status !== 'notYetAvailable'

  return {
    quarter: quarter.quarter,
    label: `Q${quarter.quarter} ${quarter.year}`,
    availableOn: formatDate(quarter.availableOn, 'd MMM yyyy'),
    dueOn: formatDate(quarter.dueOn, 'd MMM yyyy'),
    statusLabel: status.label,
    statusColour: status.colour,
    actionText:
      status.actionText ??
      fill(status.actionTextTemplate, {
        date: formatDate(quarter.availableOn, 'd MMM yyyy')
      }),
    actionHref: isStartable ? paths.prototypeWasteDataStart : '#',
    actionIsLink: isSubmittable
  }
}

const buildObligationRows = (obligation, pageContent) => {
  const period = `${formatDate(obligation.periodStart, 'd MMM')} to ${formatDate(obligation.periodEnd, 'd MMM yyyy')}`
  const takeBack = fill(pageContent.takeBackValueTemplate, {
    tonnes: formatTonnes(obligation.obligationTonnes),
    percent: String(obligation.percentOfAveragePom),
    years: String(obligation.averagePomYears)
  })

  return [
    { key: { text: pageContent.periodLabel }, value: { text: period } },
    { key: { text: pageContent.takeBackLabel }, value: { text: takeBack } },
    {
      key: { text: pageContent.collectedLabel },
      value: {
        html: `<span data-testid="waste-data-collected-value">${pageContent.collectedNotRecorded}</span>`
      },
      actions: {
        items: [
          {
            href: paths.prototypeWasteDataStart,
            text: pageContent.recordAction,
            visuallyHiddenText: pageContent.collectedLabel.toLowerCase(),
            attributes: { 'data-testid': 'waste-data-record-collection' }
          }
        ]
      }
    }
  ]
}

export const accountHomeController = {
  handler(_request, h) {
    const pageContent = prototypeComplianceSchemeContent.wasteData.accountHome
    const scheme = PROTOTYPE_COMPLIANCE_SCHEME_NAME
    const { jurisdictions, periods, obligation } = pageContent

    const quarterRows = seedData.prototypeComplianceSchemeWasteQuarters.map(
      (quarter) => buildQuarterRow(quarter, periods.statuses)
    )

    const obligationSeed = seedData.prototypeComplianceSchemeWasteObligation

    return h.view('prototype/complianceScheme/wasteData/accountHome/view', {
      ...taskFlowPageModel({
        title: pageContent.title,
        heading: fill(pageContent.headingTemplate, { scheme })
      }),
      backLink: paths.prototype,
      labels: pageContent,
      scheme,
      jurisdictionTabs: {
        ea: fill(jurisdictions.ea.tabLabelTemplate, { scheme }),
        niea: fill(jurisdictions.niea.tabLabelTemplate, { scheme })
      },
      periodsHeading: fill(periods.headingTemplate, {
        year: String(WASTE_DATA_YEAR)
      }),
      quarterRows,
      obligationHeading: fill(obligation.headingTemplate, {
        quarter: String(obligationSeed.quarter),
        year: String(obligationSeed.year)
      }),
      obligationRows: buildObligationRows(obligationSeed, obligation),
      startUrl: paths.prototypeWasteDataStart,
      pagePayload: {
        step: 'accountHome',
        target: 'hydrate',
        quarter: WASTE_DATA_QUARTER,
        submittedStatus: periods.statuses.submitted,
        submittedUrl: paths.prototypeWasteDataSubmitted,
        collectedValueTemplate: obligation.collectedValueTemplate
      }
    })
  }
}
