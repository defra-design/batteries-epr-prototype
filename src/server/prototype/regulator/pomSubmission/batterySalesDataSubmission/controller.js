import { createRequire } from 'node:module'
import Boom from '@hapi/boom'

import { paths, pathTo } from '../../../../../config/paths.js'
import { prototypeRegulatorContent } from '../../../../../config/prototype-regulator-content.js'
import { getMemberFigures } from '../store.js'
import {
  basePageModel,
  SCHEMES_WITH_DETAIL_SCREENS_BUILT,
  latestSubmissionFor
} from '../shared.js'

const seedData = createRequire(import.meta.url)(
  '../../../../../client/javascripts/storage-seed.json'
)

const buildMemberFigures = (schemeId, pageContent) =>
  getMemberFigures()
    .filter((f) => f.schemeId === schemeId)
    .map((figure) => ({
      member: figure.member,
      chemistry: figure.chemistry,
      figureTonnes: figure.amendedTonnes ?? figure.figureTonnes,
      statusLabel: pageContent.statusLabels[figure.status],
      statusColour: pageContent.statusColours[figure.status],
      reason: figure.reason,
      queried: figure.status === 'queried'
    }))

const formatTonnes = (tonnes) => tonnes.toLocaleString('en-GB')

const buildCompareReturns = (schemeId, pageContent) => {
  const compareReturns = seedData.prototypeRegulatorCompareReturns.find(
    (c) => c.schemeId === schemeId
  )

  return {
    alertLevelPercent: compareReturns.alertLevelPercent,
    categories: compareReturns.categories.map((category) => ({
      category: category.category,
      thisQuarterTonnes: formatTonnes(category.thisQuarterTonnes),
      lastQuarterTonnes: formatTonnes(category.lastQuarterTonnes),
      swingText: category.aboveAlert
        ? `${category.swingPercent}% ↑`
        : `${category.swingPercent}%`,
      swingColour: category.aboveAlert ? 'orange' : 'grey',
      sameQuarterLastYearTonnes: formatTonnes(
        category.sameQuarterLastYearTonnes
      ),
      hasReason: category.hasReason
    })),
    totals: {
      label: pageContent.compareReturns.totalLabel,
      thisQuarterTonnes: formatTonnes(compareReturns.totals.thisQuarterTonnes),
      lastQuarterTonnes: formatTonnes(compareReturns.totals.lastQuarterTonnes),
      swingText: `${compareReturns.totals.swingPercent}%`,
      swingColour: compareReturns.totals.aboveAlert ? 'orange' : 'grey',
      sameQuarterLastYearTonnes: formatTonnes(
        compareReturns.totals.sameQuarterLastYearTonnes
      )
    }
  }
}

const buildIndicativeObligation = (schemeId) => {
  const obligation = seedData.prototypeRegulatorIndicativeObligation.find(
    (o) => o.schemeId === schemeId
  )

  return {
    placedOnMarket2024: `${formatTonnes(obligation.placedOnMarket2024Tonnes)} tonnes`,
    placedOnMarket2025: `${formatTonnes(obligation.placedOnMarket2025Tonnes)} tonnes`,
    placedOnMarket2026SoFar: `${formatTonnes(obligation.placedOnMarket2026SoFarTonnes)} tonnes (annualised: ${formatTonnes(obligation.placedOnMarket2026AnnualisedTonnes)} tonnes)`,
    rollingAverage: `${formatTonnes(obligation.rollingAverageTonnes)} tonnes`,
    obligationRate: `${obligation.obligationRatePercent}%`,
    indicativeObligationYear: obligation.indicativeObligationYear,
    indicativeObligation: `${formatTonnes(obligation.indicativeObligationTonnes)} tonnes`,
    verified: obligation.verified
  }
}

export const batterySalesDataSubmissionController = {
  handler(request, h) {
    const { schemeId } = request.params

    if (!SCHEMES_WITH_DETAIL_SCREENS_BUILT.has(schemeId)) {
      throw Boom.notFound()
    }

    const pageContent = prototypeRegulatorContent.batterySalesDataSubmission
    const scheme = seedData.prototypeRegulatorSchemes.find(
      (s) => s.id === schemeId
    )
    const submission = latestSubmissionFor(schemeId)

    return h.view(
      'prototype/regulator/pomSubmission/batterySalesDataSubmission/view',
      {
        ...basePageModel(
          {
            ...pageContent,
            heading: `Battery sales data submission — ${submission.periodLabel}`
          },
          paths.prototypeRegulatorPomSubmissionDashboard
        ),
        backLink: pathTo(paths.prototypeRegulatorPomSubmissionSchemeHome, {
          schemeId
        }),
        scheme,
        intro: `Query or reject an individual member's figures below. Your reason goes straight to ${scheme.name} in the service — they can ask the member for the correct figure, or fix and resend just that part of the submission.`,
        continueHref: pathTo(
          paths.prototypeRegulatorPomSubmissionReviewPomReturn,
          {
            schemeId,
            year: submission.compliancePeriodYear,
            quarter: submission.quarter
          }
        ),
        memberFigures: buildMemberFigures(schemeId, pageContent),
        compareReturns: buildCompareReturns(schemeId, pageContent),
        indicativeObligation: buildIndicativeObligation(schemeId),
        tabs: [
          { ...pageContent.memberFiguresTab },
          { ...pageContent.compareReturnsTab },
          { ...pageContent.indicativeObligationTab }
        ]
      }
    )
  }
}
