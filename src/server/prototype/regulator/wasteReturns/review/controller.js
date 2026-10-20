import { paths, pathTo } from '../../../../../config/paths.js'
import { prototypeRegulatorWasteReturnsContent } from '../../../../../config/prototype-regulator-waste-returns-content.js'
import { REVIEW_PERIOD } from '../data.js'
import {
  basePageModel,
  fillTemplate,
  formatLongDateTime,
  formatTonnes,
  loadReturn,
  reconciliationRows,
  returnParams,
  siteLabel,
  submissionsForSchemeAbto,
  sumFigures
} from '../shared.js'

const content = prototypeRegulatorWasteReturnsContent

export const backLinkForReturn = ({ schemeId, abtoId }) =>
  submissionsForSchemeAbto(schemeId, abtoId).length > 1
    ? pathTo(paths.prototypeRegulatorWasteReturnsAbtoSites, {
        schemeId,
        abtoId
      })
    : pathTo(paths.prototypeRegulatorWasteReturnsSchemeAbtos, { schemeId })

const buildTimeline = (submission) =>
  [...submission.timeline]
    .sort((a, b) => a.at.localeCompare(b.at))
    .map((event, index, events) => ({
      time: formatLongDateTime(event.at),
      text: event.text,
      current:
        submission.status === 'awaitingReview' && index === events.length - 1
    }))

const buildReconciliation = (pageContent, submission) => {
  if (!submission.intake) {
    return null
  }

  const rows = reconciliationRows(submission)
  const intakeTotal = sumFigures(submission.intake)
  const bensTotal = sumFigures(submission.bens)

  return {
    heading: fillTemplate(pageContent.reconciliationHeadingTemplate, {
      period: REVIEW_PERIOD.label
    }),
    rows: rows.map((row) => ({
      label: row.label,
      intake: `${formatTonnes(row.intakeTonnes)} tonnes`,
      bens: `${formatTonnes(row.bensTonnes)} tonnes`
    })),
    intakeStatus: rows.every((row) => row.matches)
      ? { text: pageContent.matchConfirmed, colour: 'green' }
      : { text: pageContent.mismatchFound, colour: 'orange' },
    bensStatus:
      bensTotal < intakeTotal
        ? { text: pageContent.unissuedStockpile, colour: 'yellow' }
        : null
  }
}

export const reviewController = {
  handler(request, h) {
    const loaded = loadReturn(request.params)
    const { scheme, abto, site, submission } = loaded
    const pageContent = content.review
    const params = returnParams(request.params)
    const label = siteLabel(abto, site)

    return h.view('prototype/regulator/wasteReturns/review/view', {
      ...basePageModel(
        { ...pageContent, heading: label },
        paths.prototypeRegulatorWasteReturnsHome
      ),
      backLink: backLinkForReturn(request.params),
      submission,
      facts: [
        {
          label: pageContent.factsLabels.approvalNumber,
          value: site.approvalNumber
        },
        { label: pageContent.factsLabels.scheme, value: scheme.name },
        {
          label: pageContent.factsLabels.reviewPeriod,
          value: REVIEW_PERIOD.longLabel
        },
        {
          label: pageContent.factsLabels.deadline,
          value: REVIEW_PERIOD.deadline
        },
        {
          label: pageContent.factsLabels.regulator,
          tag: { text: pageContent.regulatorName, colour: 'green' }
        }
      ],
      reconciliation: buildReconciliation(pageContent, submission),
      bensHeading: fillTemplate(pageContent.bensHeadingTemplate, {
        period: REVIEW_PERIOD.label
      }),
      bensSummary: submission.bens
        ? fillTemplate(pageContent.bensSummaryTemplate, {
            abto: label,
            count: submission.benCount,
            tonnes: formatTonnes(sumFigures(submission.bens)),
            period: REVIEW_PERIOD.label
          })
        : null,
      viewBensLabel: fillTemplate(pageContent.viewBensTemplate, {
        abto: label
      }),
      checks: submission.checks,
      canDecide: submission.status === 'awaitingReview',
      closedNotice: {
        accepted: pageContent.closedNoticeAccepted,
        querySent: pageContent.closedNoticeQuerySent,
        overdue: pageContent.notSubmittedNotice
      }[submission.status],
      acceptHref: pathTo(
        paths.prototypeRegulatorWasteReturnsAcceptConfirm,
        params
      ),
      queryHref: pathTo(
        paths.prototypeRegulatorWasteReturnsQueryCategories,
        params
      ),
      timeline: buildTimeline(submission)
    })
  }
}
