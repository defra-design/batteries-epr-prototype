import { storage } from '../storage-adapter.js'

export const CATEGORIES = ['portable', 'industrial', 'automotive']

export const TARGET_PERCENTAGES = {
  portable: 0.45,
  industrial: 0.5,
  automotive: 0.5
}

export const COLLECTION_TARGET_PERCENTAGES = {
  portable: 0.45,
  industrial: 1,
  automotive: 1
}

const DEFAULT_TARGETS = {
  recycling: TARGET_PERCENTAGES,
  collection: COLLECTION_TARGET_PERCENTAGES
}

const RULE_VERSION = 'GB-playground-v1'

const toFractions = (percentByCategory) =>
  Object.fromEntries(
    CATEGORIES.map((category) => [
      category,
      Number(percentByCategory[category]) / 100
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
  targets = DEFAULT_TARGETS
}) => {
  const rows = CATEGORIES.map((category) => {
    const placed = sumQuarterCategory(quarterly, category)
    const target = targets.recycling[category]
    const collectionTarget = targets.collection[category]
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

const toWholePercentages = (targets) => ({
  collection: Object.fromEntries(
    CATEGORIES.map((category) => [
      category,
      Math.round(targets.collection[category] * 100)
    ])
  ),
  recycling: Object.fromEntries(
    CATEGORIES.map((category) => [
      category,
      Math.round(targets.recycling[category] * 100)
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
  targets = resolveTargets(scheme?.agencyCode),
  calculatedAt = new Date().toISOString()
}) => {
  const { rows, totals } = buildObligation({ quarterly, evidence, targets })
  const config = latestConfigEntry(scheme?.agencyCode)

  return {
    schemeId: scheme.id,
    schemeName: scheme.name,
    agencyCode: scheme.agencyCode,
    compliancePeriodYear,
    calculatedAt,
    batteryCategories: [...CATEGORIES],
    targets: toWholePercentages(targets),
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
