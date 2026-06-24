import {
  COLLECTION_STREAMS,
  COLLECTION_TARGET,
  RECYCLING_STREAMS
} from './targets.js'

const round = (value) => Math.round(value * 1000) / 1000

export const parseTonnes = (value) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

export const collectionRate = (thresholds, year) => {
  const applicable = thresholds.filter((threshold) => year >= threshold.from)
  return applicable.length ? applicable[applicable.length - 1].rate : null
}

export const buildPomIndex = (annualReturns) =>
  annualReturns.reduce((index, annualReturn) => {
    const placed = annualReturn.placedOnMarket ?? {}
    index[Number(annualReturn.period)] = COLLECTION_STREAMS.reduce(
      (fields, stream) => {
        fields[stream.pomField] = parseTonnes(placed[stream.pomField])
        return fields
      },
      {}
    )
    return index
  }, {})

export const averagePlacedOnMarket = (pomIndex, field, year) => {
  const values = [year, year - 1, year - 2]
    .map((windowYear) => pomIndex[windowYear])
    .filter(Boolean)
    .map((entry) => entry[field])
  const total = values.reduce((sum, value) => sum + value, 0)
  return {
    average: values.length ? round(total / values.length) : 0,
    yearsAveraged: values.length
  }
}

const averageLegislationFor = (stream) => ({
  articles: stream.calculationArticles,
  title: 'Three-year average placed on the market',
  summary:
    'The collection rate is measured against the average annual tonnage placed on the market in the reporting year and the two preceding years.',
  appliesFrom: stream.legislation.appliesFrom
})

const collectionTargetResult = (stream, year, pomIndex, actualCollection) => {
  const rate = collectionRate(stream.thresholds, year)
  const { average, yearsAveraged } = averagePlacedOnMarket(
    pomIndex,
    stream.pomField,
    year
  )
  const averageLegislation = averageLegislationFor(stream)
  if (rate === null) {
    return {
      targetLabel: 'Not yet in force',
      ratePercent: null,
      averagePlacedOnMarket: average,
      yearsAveraged,
      averageLegislation,
      requiredCollection: null,
      requiredLegislation: null,
      shortfall: null,
      status: 'not-yet'
    }
  }
  const ratePercent = round(rate * 100)
  const requiredCollection = round(average * rate)
  const shortfall = round(Math.max(0, requiredCollection - actualCollection))
  return {
    targetLabel: `${ratePercent}%`,
    ratePercent,
    averagePlacedOnMarket: average,
    yearsAveraged,
    averageLegislation,
    requiredCollection,
    requiredLegislation: {
      articles: stream.legislation.articles,
      title: 'Required collection',
      summary: `Calculated as the ${ratePercent}% collection target applied to the three-year average placed on the market.`,
      appliesFrom: stream.legislation.appliesFrom
    },
    shortfall,
    status: shortfall === 0 ? 'met' : 'shortfall'
  }
}

const takeBackResult = () => ({
  targetLabel: 'All returned',
  ratePercent: null,
  averagePlacedOnMarket: null,
  yearsAveraged: null,
  averageLegislation: null,
  requiredCollection: null,
  requiredLegislation: null,
  shortfall: null,
  status: 'take-back'
})

const calculateStream = (stream, year, placed, pomIndex, collected) => {
  const placedOnMarket = parseTonnes(placed[stream.pomField])
  const actualCollection = parseTonnes(collected[stream.colField])
  const outcome =
    stream.model === COLLECTION_TARGET
      ? collectionTargetResult(stream, year, pomIndex, actualCollection)
      : takeBackResult()
  return {
    key: stream.key,
    label: stream.label,
    model: stream.model,
    basis: stream.basis,
    legislation: stream.legislation,
    placedOnMarket,
    actualCollection,
    ...outcome
  }
}

export const calculatePeriod = (
  annualReturn,
  pomIndex = buildPomIndex([annualReturn])
) => {
  const year = Number(annualReturn.period)
  const placed = annualReturn.placedOnMarket ?? {}
  const collected = annualReturn.collection ?? {}
  const efficiency = annualReturn.recyclingEfficiency ?? {}

  const streams = COLLECTION_STREAMS.map((stream) =>
    calculateStream(stream, year, placed, pomIndex, collected)
  )

  const recycling = RECYCLING_STREAMS.map((stream) => {
    const achievedPercent = parseTonnes(efficiency[stream.field])
    const met = achievedPercent >= stream.targetPercent
    return {
      key: stream.key,
      label: stream.label,
      legislation: stream.legislation,
      targetPercent: stream.targetPercent,
      achievedPercent,
      met,
      status: met ? 'met' : 'shortfall'
    }
  })

  const totals = streams.reduce(
    (acc, stream) => ({
      placedOnMarket: round(acc.placedOnMarket + stream.placedOnMarket),
      requiredCollection: round(
        acc.requiredCollection + (stream.requiredCollection ?? 0)
      ),
      actualCollection: round(acc.actualCollection + stream.actualCollection),
      shortfall: round(acc.shortfall + (stream.shortfall ?? 0))
    }),
    {
      placedOnMarket: 0,
      requiredCollection: 0,
      actualCollection: 0,
      shortfall: 0
    }
  )

  return {
    period: annualReturn.period,
    reference: annualReturn.reference ?? null,
    streams,
    recycling,
    totals,
    compliant: totals.shortfall === 0 && recycling.every((row) => row.met)
  }
}

export const calculateObligation = ({ registration, annualReturns }) => {
  const sorted = annualReturns
    .slice()
    .sort((a, b) => Number(b.period) - Number(a.period))
  const pomIndex = buildPomIndex(sorted)
  const periods = sorted.map((annualReturn) =>
    calculatePeriod(annualReturn, pomIndex)
  )

  return {
    bprn: registration?.bprn ?? null,
    producerRoute: registration?.producerRoute ?? null,
    hasData: periods.length > 0,
    periods
  }
}
