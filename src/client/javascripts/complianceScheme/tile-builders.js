export const QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4']

const approvalAction = (status, urls, copy) => {
  if (status === 'not-started') {
    return { text: copy.startAction, href: urls.applicationStart }
  }
  if (status === 'in-progress') {
    return { text: copy.continueAction, href: urls.applicationStart }
  }
  return { text: copy.viewAction, href: urls.applicationCheckAnswers }
}

export const buildApprovalTile = (scheme, urls, copy) => {
  const status = scheme?.approvalStatus ?? 'not-started'
  return {
    status,
    statusLabel: copy.statuses[status],
    approvalNumber: scheme?.approvalNumber ?? null,
    approvedOn: scheme?.approvedOn ?? null,
    submittedOn: scheme?.submittedOn ?? null,
    action: approvalAction(status, urls, copy)
  }
}

export const buildMembersTile = (members, urls, copy) => ({
  count: members.length,
  manageHref: urls.members,
  manageActionText: copy.manageAction
})

const sumTonnes = (items) =>
  items.reduce((total, item) => total + Number(item.tonnes ?? 0), 0)

export const buildEvidenceTile = (scheme, evidence, obligation, urls, copy) => {
  const accepted = evidence.filter((e) => e.status === 'accepted')
  const awaiting = evidence.filter((e) => e.status === 'awaiting-acceptance')
  const acceptedTonnes = sumTonnes(accepted)
  const awaitingTonnes = sumTonnes(awaiting)
  const obligationTonnes = obligation.totals.obligation
  return {
    acceptedTonnes: acceptedTonnes.toFixed(3),
    awaitingTonnes: awaitingTonnes.toFixed(3),
    obligationTonnes: obligationTonnes.toFixed(3),
    deltaTonnes: (obligationTonnes - acceptedTonnes).toFixed(3),
    manageHref: urls.evidence,
    manageActionText: copy.manageAction,
    availability: {
      on: Boolean(scheme?.evidenceAvailable),
      label: scheme?.evidenceAvailable
        ? copy.availabilityOn
        : copy.availabilityOff,
      toggleHref: urls.evidenceAvailability,
      toggleActionText: copy.availabilityToggleAction
    }
  }
}

const quarterlyHref = (urls, quarter, step) =>
  urls.quarterly
    .replace('{quarter}', quarter)
    .replace('{step}', step)

const quarterAction = (status, quarter, urls, copy) => {
  if (status === 'not-started') {
    return {
      text: copy.startAction,
      href: quarterlyHref(urls, quarter, 'market-data')
    }
  }
  if (status === 'in-progress') {
    return {
      text: copy.continueAction,
      href: quarterlyHref(urls, quarter, 'market-data')
    }
  }
  return {
    text: copy.viewAction,
    href: quarterlyHref(urls, quarter, 'check-answers')
  }
}

export const buildQuarterlyTile = (scheme, submissions, urls, copy) => {
  const isGated = scheme?.approvalStatus !== 'approved'
  const quarters = QUARTERS.map((quarter) => {
    const submission = submissions.find((s) => s.quarter === quarter)
    const status = submission?.status ?? 'not-started'
    return {
      quarter,
      status,
      statusLabel: copy.statuses[status],
      action: isGated ? null : quarterAction(status, quarter, urls, copy)
    }
  })
  return { gated: isGated, disabledHint: copy.disabledHint, quarters }
}

const iaHref = (urls, step) => urls.ia.replace('{step}', step)

const iaAction = (status, urls, copy) => {
  if (status === 'not-started') {
    return { text: copy.startAction, href: iaHref(urls, 'placed') }
  }
  if (status === 'in-progress') {
    return { text: copy.continueAction, href: iaHref(urls, 'placed') }
  }
  return { text: copy.viewAction, href: iaHref(urls, 'check-answers') }
}

export const buildIaTile = (scheme, submissions, urls, copy) => {
  const isGated = scheme?.approvalStatus !== 'approved'
  const submission = submissions[0]
  const status = submission?.status ?? 'not-started'
  return {
    gated: isGated,
    disabledHint: copy.disabledHint,
    status,
    statusLabel: status,
    action: isGated ? null : iaAction(status, urls, copy)
  }
}

export const buildObligationBreakdownTile = (urls, copy) => ({
  viewHref: urls.obligation,
  viewActionText: copy.viewAction
})

export const buildDashboardViewModel = ({
  scheme,
  members,
  quarterly,
  ia,
  evidence,
  obligation,
  urls,
  copy
}) => ({
  scheme: { id: scheme?.id ?? null, name: scheme?.name ?? null },
  approval: buildApprovalTile(scheme, urls, copy.approval),
  members: buildMembersTile(members, urls, copy.members),
  evidence: buildEvidenceTile(scheme, evidence, obligation, urls, copy.evidence),
  quarterly: buildQuarterlyTile(scheme, quarterly, urls, copy.quarterly),
  ia: buildIaTile(scheme, ia, urls, copy.ia),
  obligationBreakdown: buildObligationBreakdownTile(
    urls,
    copy.obligationBreakdown
  )
})
