import {
  categoryIds,
  emptyCategoryMap
} from '../../../config/battery-categories.js'
import { storage } from '../storage-adapter.js'

export const CATEGORIES = categoryIds

const DEFAULT_RECYCLING_RATES = {
  portable: 0.45,
  industrial: 0.5,
  automotive: 0.5
}
const DEFAULT_COLLECTION_RATES = {
  portable: 0.45,
  industrial: 1,
  automotive: 1
}

const ratesForAllCategories = (rates) => ({ ...emptyCategoryMap(), ...rates })

export const TARGET_PERCENTAGES = ratesForAllCategories(DEFAULT_RECYCLING_RATES)

export const COLLECTION_TARGET_PERCENTAGES = ratesForAllCategories(
  DEFAULT_COLLECTION_RATES
)

const DEFAULT_TARGETS = {
  recycling: TARGET_PERCENTAGES,
  collection: COLLECTION_TARGET_PERCENTAGES
}

const toFractions = (percentByCategory) =>
  Object.fromEntries(
    Object.entries(percentByCategory).map(([category, value]) => [
      category,
      Number(value) / 100
    ])
  )

export const resolveTargets = (agencyCode) => {
  const stored = agencyCode ? storage.getRegulatorTargets(agencyCode) : null
  if (!stored) return DEFAULT_TARGETS
  return {
    recycling: toFractions(stored.recycling),
    collection: toFractions(stored.collection)
  }
}

const sumQuarterCategory = (quarterly, category) =>
  quarterly.reduce((total, q) => {
    const memberTotal = (q.memberData ?? []).reduce(
      (sum, m) => sum + Number(m.marketData?.[category] ?? 0),
      0
    )
    return total + memberTotal
  }, 0)

const sumEvidenceCategory = (evidence, category) =>
  evidence
    .filter((e) => e.category === category)
    .reduce((total, e) => total + Number(e.tonnes ?? 0), 0)

export const buildObligation = ({
  quarterly,
  evidence,
  targets = DEFAULT_TARGETS,
  categoryIds: ids = categoryIds
}) => {
  const rows = ids.map((category) => {
    const placed = sumQuarterCategory(quarterly, category)
    const target = targets.recycling[category] ?? 0
    const collectionTarget = targets.collection[category] ?? 0
    const obligation = placed * target
    const collectionObligation = placed * collectionTarget
    const accepted = sumEvidenceCategory(
      evidence.filter((e) => e.status === 'accepted'),
      category
    )
    return {
      category,
      placed,
      targetPercent: Math.round(target * 100),
      collectionTargetPercent: Math.round(collectionTarget * 100),
      obligation,
      collectionObligation,
      accepted,
      outstanding: obligation - accepted
    }
  })

  const totals = rows.reduce(
    (acc, row) => ({
      placed: acc.placed + row.placed,
      obligation: acc.obligation + row.obligation,
      accepted: acc.accepted + row.accepted,
      outstanding: acc.outstanding + row.outstanding
    }),
    { placed: 0, obligation: 0, accepted: 0, outstanding: 0 }
  )

  return { rows, totals }
}
