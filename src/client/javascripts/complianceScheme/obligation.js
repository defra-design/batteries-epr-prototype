export const CATEGORIES = ['portable', 'industrial', 'automotive']

export const TARGET_PERCENTAGES = {
  portable: 0.45,
  industrial: 0.5,
  automotive: 0.5
}

const sumQuarterCategory = (quarterly, category) =>
  quarterly.reduce(
    (total, q) => total + Number(q.marketData?.[category] ?? 0),
    0
  )

const sumEvidenceCategory = (evidence, category) =>
  evidence
    .filter((e) => e.category === category)
    .reduce((total, e) => total + Number(e.tonnes ?? 0), 0)

export const buildObligation = ({ quarterly, evidence }) => {
  const rows = CATEGORIES.map((category) => {
    const placed = sumQuarterCategory(quarterly, category)
    const target = TARGET_PERCENTAGES[category]
    const obligation = placed * target
    const accepted = sumEvidenceCategory(
      evidence.filter((e) => e.status === 'accepted'),
      category
    )
    return {
      category,
      placed,
      targetPercent: Math.round(target * 100),
      obligation,
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
