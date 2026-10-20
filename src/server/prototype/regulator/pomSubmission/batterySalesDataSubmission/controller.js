import { createRequire } from 'node:module'
import Boom from '@hapi/boom'

import { paths, pathTo } from '../../../../../config/paths.js'
import { prototypeRegulatorContent } from '../../../../../config/prototype-regulator-content.js'
import {
  basePageModel,
  fill,
  flagsFor,
  formatSigned,
  formatTonnes3,
  latestSubmissionFor,
  SCHEMES_WITH_DETAIL_SCREENS_BUILT
} from '../shared.js'
import {
  getDraftQueries,
  getProducerFigures,
  removeDraftQuery
} from '../store.js'

const seedData = createRequire(import.meta.url)(
  '../../../../../client/javascripts/storage-seed.json'
)

// Compare returns flags a change over this percentage or tonnage.
const ALERT_PERCENT = 20
const ALERT_TONNES = 5

const locate = (schemeId) => {
  if (!SCHEMES_WITH_DETAIL_SCREENS_BUILT.has(schemeId)) {
    throw Boom.notFound()
  }
  const scheme = seedData.prototypeRegulatorSchemes.find(
    (s) => s.id === schemeId
  )
  return { scheme, submission: latestSubmissionFor(schemeId) }
}

// A figure that moved over the alert level, or changed chemistry on the same
// tonnage, is flagged (orange); everything else is grey.
const changeFor = (figure, flaggedProducers, labels) => {
  const difference = figure.figureTonnes - figure.lastQuarterTonnes
  const flagged = flaggedProducers.has(figure.producer)
  const chemistryChanged = figure.lastQuarterChemistry && difference === 0

  if (chemistryChanged) {
    return {
      text: labels.chemistry,
      colour: 'orange',
      value: difference,
      flagged: true
    }
  }
  if (difference === 0) {
    return { text: labels.none, colour: 'grey', value: 0, flagged }
  }
  return {
    text: formatSigned(difference),
    colour: flagged ? 'orange' : 'grey',
    value: difference,
    flagged
  }
}

const withChemistry = (tonnes, chemistry) =>
  chemistry ? `${formatTonnes3(tonnes)} (${chemistry})` : formatTonnes3(tonnes)

const buildProducerFigures = (labels, schemeId, submission, query) => {
  const forReturn = (entry) =>
    entry.schemeId === schemeId &&
    entry.compliancePeriodYear === submission.compliancePeriodYear &&
    entry.quarter === submission.quarter
  const flagged = new Set(
    flagsFor(schemeId, submission.compliancePeriodYear, submission.quarter)
      .filter((flag) => ['variance', 'chemistryChange'].includes(flag.type))
      .map((flag) => flag.producer)
  )
  const drafts = getDraftQueries().filter(forReturn)

  const all = getProducerFigures()
    .filter(forReturn)
    .map((figure) => {
      const draft = drafts.find((entry) => entry.producer === figure.producer)
      return {
        producer: figure.producer,
        chemistry: figure.chemistry,
        figure: formatTonnes3(figure.figureTonnes),
        change: changeFor(figure, flagged, labels.producerFigures),
        draft: draft ?? null
      }
    })

  const show = ['flagged', 'drafts'].includes(query.show) ? query.show : 'all'
  const search = (query.producer ?? '').trim().toLowerCase()
  const rows = all
    .filter((row) =>
      show === 'flagged'
        ? row.change.flagged
        : show === 'drafts'
          ? row.draft
          : true
    )
    .filter((row) => row.producer.toLowerCase().includes(search))

  const hrefFor = (key) =>
    `?show=${key}${search ? `&producer=${encodeURIComponent(search)}` : ''}#producer-figures`

  return {
    rows,
    show,
    search: query.producer ?? '',
    filters: [
      { key: 'all', count: all.length },
      { key: 'flagged', count: all.filter((row) => row.change.flagged).length },
      { key: 'drafts', count: all.filter((row) => row.draft).length }
    ].map(({ key, count }) => ({
      key,
      text: fill(labels.producerFigures.filters[key], { count }),
      href: hrefFor(key),
      current: key === show
    }))
  }
}

const buildCompareReturns = (labels, schemeId, submission) => {
  const figures = getProducerFigures().filter(
    (entry) =>
      entry.schemeId === schemeId &&
      entry.compliancePeriodYear === submission.compliancePeriodYear &&
      entry.quarter === submission.quarter
  )
  const flagged = new Set(
    flagsFor(schemeId, submission.compliancePeriodYear, submission.quarter)
      .filter((flag) => ['variance', 'chemistryChange'].includes(flag.type))
      .map((flag) => flag.producer)
  )
  const sum = (key) => figures.reduce((total, figure) => total + figure[key], 0)

  return {
    threshold: fill(labels.compareReturns.threshold, {
      percent: ALERT_PERCENT,
      tonnes: formatTonnes3(ALERT_TONNES)
    }),
    rows: figures.map((figure) => ({
      producer: `${figure.producer} (${figure.chemistry})`,
      thisQuarter: formatTonnes3(figure.figureTonnes),
      lastQuarter: withChemistry(
        figure.lastQuarterTonnes,
        figure.lastQuarterChemistry
      ),
      change: changeFor(figure, flagged, labels.producerFigures),
      lastYear: withChemistry(
        figure.sameQuarterLastYearTonnes,
        figure.sameQuarterLastYearChemistry
      )
    })),
    total: {
      thisQuarter: formatTonnes3(sum('figureTonnes')),
      lastQuarter: formatTonnes3(sum('lastQuarterTonnes')),
      change: formatSigned(sum('figureTonnes') - sum('lastQuarterTonnes')),
      lastYear: formatTonnes3(sum('sameQuarterLastYearTonnes'))
    }
  }
}

const whole = (tonnes) => tonnes.toLocaleString('en-GB')

const buildObligation = (labels, schemeId) => {
  const copy = labels.indicativeObligation
  const obligation = seedData.prototypeRegulatorIndicativeObligation.find(
    (entry) => entry.schemeId === schemeId
  )
  const remaining =
    obligation.indicativeObligationTonnes - obligation.evidenceAcquiredTonnes

  return [
    [
      copy.rows[2024],
      fill(copy.tonnes, { amount: whole(obligation.placedOnMarket2024Tonnes) })
    ],
    [
      copy.rows[2025],
      fill(copy.tonnes, { amount: whole(obligation.placedOnMarket2025Tonnes) })
    ],
    [
      copy.rows[2026],
      fill(copy.annualised, {
        amount: whole(obligation.placedOnMarket2026SoFarTonnes),
        annualised: whole(obligation.placedOnMarket2026AnnualisedTonnes)
      })
    ],
    [
      copy.rows.average,
      fill(copy.partYear, {
        amount: whole(obligation.rollingAverageTonnes),
        year: 2026
      })
    ],
    [
      copy.rows.evidence,
      fill(copy.tonnes, { amount: whole(obligation.evidenceAcquiredTonnes) })
    ],
    [
      fill(copy.rows.obligation, {
        year: obligation.indicativeObligationYear,
        rate: obligation.obligationRatePercent
      }),
      fill(copy.tonnes, {
        amount: whole(obligation.indicativeObligationTonnes)
      })
    ],
    [
      copy.rows.remaining,
      fill(copy.remaining, {
        amount: whole(remaining),
        percent: Math.round(
          (remaining / obligation.indicativeObligationTonnes) * 100
        )
      })
    ]
  ].map(([key, value]) => ({ key: { text: key }, value: { text: value } }))
}

const figuresPath = (schemeId) =>
  pathTo(paths.prototypeRegulatorPomSubmissionBatterySalesDataSubmission, {
    schemeId
  })

export const batterySalesDataSubmissionController = {
  get: {
    handler(request, h) {
      const { schemeId } = request.params
      const labels = prototypeRegulatorContent.batterySalesDataSubmission
      const { scheme, submission } = locate(schemeId)
      const values = { scheme: scheme.name, period: submission.periodLabel }

      return h.view(
        'prototype/regulator/pomSubmission/batterySalesDataSubmission/view',
        {
          ...basePageModel(
            { ...labels, heading: fill(labels.heading, values) },
            {
              backLink: {
                href: paths.prototypeRegulatorPomSubmissionDashboard,
                text: labels.backLink
              }
            }
          ),
          producerIntro: fill(labels.producerFigures.intro, values),
          obligationIntro: fill(labels.indicativeObligation.intro, values),
          producerFigures: buildProducerFigures(
            labels,
            schemeId,
            submission,
            request.query
          ),
          compareReturns: buildCompareReturns(labels, schemeId, submission),
          obligationRows: buildObligation(labels, schemeId),
          tabs: [
            labels.producerFiguresTab,
            labels.compareReturnsTab,
            labels.indicativeObligationTab
          ],
          figuresAction: figuresPath(schemeId),
          removeAction: (queryId) =>
            pathTo(paths.prototypeRegulatorPomSubmissionRemoveDraftQuery, {
              schemeId,
              queryId
            }),
          continueHref: pathTo(
            paths.prototypeRegulatorPomSubmissionReviewPomReturn,
            {
              schemeId,
              year: submission.compliancePeriodYear,
              quarter: submission.quarter
            }
          )
        }
      )
    }
  },

  removeDraft: {
    handler(request, h) {
      const { schemeId, queryId } = request.params
      locate(schemeId)
      removeDraftQuery(queryId)
      return h.redirect(`${figuresPath(schemeId)}#producer-figures`)
    }
  }
}
