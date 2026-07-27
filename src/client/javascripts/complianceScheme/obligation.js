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

const RULE_VERSION = 'GB-playground-v1'

const isYearMap = (value) =>
  value !== null && typeof value === 'object' && !Array.isArray(value)

const targetForYear = (value, compliancePeriodYear) => {
  if (!isYearMap(value)) return Number(value ?? 0)
  const year = Number(compliancePeriodYear ?? new Date().getUTCFullYear())
  const configuredYears = Object.keys(value)
    .map(Number)
    .filter((configuredYear) => Number.isInteger(configuredYear))
    .filter((configuredYear) => configuredYear <= year)
    .sort((a, b) => b - a)
  const effectiveYear = configuredYears[0]
  return effectiveYear ? Number(value[String(effectiveYear)] ?? 0) : 0
}

const toFractionsForYear = (targets, ids, compliancePeriodYear) => {
  const pick = (field) =>
    Object.fromEntries(
      ids.map((id) => [
        id,
        targetForYear(targets?.[field]?.[id], compliancePeriodYear) / 100
      ])
    )
  return { recycling: pick('recycling'), collection: pick('collection') }
}

export const resolveTargets = (agencyCode, compliancePeriodYear) => {
  const ids = storage
    .resolveCategories(agencyCode)
    .map((category) => category.id)
  const stored = agencyCode ? storage.getRegulatorTargets(agencyCode) : null
  if (stored) return toFractionsForYear(stored, ids, compliancePeriodYear)
  const source = DEFAULT_TARGETS
  const pick = (field) =>
    Object.fromEntries(ids.map((id) => [id, source[field][id] ?? 0]))
  return { recycling: pick('recycling'), collection: pick('collection') }
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

const toWholePercentages = (targets, ids) => ({
  collection: Object.fromEntries(
    ids.map((category) => [
      category,
      Math.round((targets.collection[category] ?? 0) * 100)
    ])
  ),
  recycling: Object.fromEntries(
    ids.map((category) => [
      category,
      Math.round((targets.recycling[category] ?? 0) * 100)
    ])
  )
})

const latestConfigEntry = (agencyCode) =>
  agencyCode ? (storage.listConfigAuditEntries(agencyCode)[0] ?? null) : null

export const buildObligationSnapshot = ({
  scheme,
  compliancePeriodYear,
  quarterly,
  evidence,
  targets = resolveTargets(scheme?.agencyCode, compliancePeriodYear),
  calculatedAt = new Date().toISOString()
}) => {
  const categories = storage.resolveCategories(scheme?.agencyCode)
  const ids = categories.map((category) => category.id)
  const { rows, totals } = buildObligation({
    quarterly,
    evidence,
    targets,
    categoryIds: ids
  })
  const config = latestConfigEntry(scheme?.agencyCode)

  return {
    schemeId: scheme.id,
    schemeName: scheme.name,
    agencyCode: scheme.agencyCode,
    compliancePeriodYear,
    calculatedAt,
    batteryCategories: ids,
    categoryLabels: Object.fromEntries(
      categories.map((category) => [category.id, category.label])
    ),
    targets: toWholePercentages(targets, ids),
    rules: {
      version: RULE_VERSION,
      configSource: 'regulatorTargets',
      configVersion: config?.id ?? 'default',
      configDate: config?.at ?? null,
      changedBy: config?.actorName ?? null
    },
    rows,
    totals
  }
}
