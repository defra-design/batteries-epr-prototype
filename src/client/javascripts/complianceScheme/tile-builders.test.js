import {
  QUARTERS,
  buildApprovalTile,
  buildMembersTile,
  buildEvidenceTile,
  buildQuarterlyTile,
  buildIaTile,
  buildObligationBreakdownTile,
  buildDashboardViewModel
} from './tile-builders.js'

const urls = {
  applicationStart: '/compliance-scheme/application/scheme-details',
  applicationCheckAnswers: '/compliance-scheme/application/check-answers',
  members: '/compliance-scheme/members',
  evidence: '/compliance-scheme/evidence',
  evidenceAvailability: '/compliance-scheme/evidence/availability',
  quarterly: '/compliance-scheme/quarterly/{quarter}/{step}',
  ia: '/compliance-scheme/industrial-automotive/{step}',
  obligation: '/compliance-scheme/obligation'
}

const copy = {
  approval: {
    statuses: {
      'not-started': 'Not started',
      'in-progress': 'In progress',
      submitted: 'Submitted',
      approved: 'Approved'
    },
    startAction: 'Start application',
    continueAction: 'Continue application',
    viewAction: 'View application'
  },
  members: { manageAction: 'Manage members' },
  evidence: {
    manageAction: 'Manage evidence',
    availabilityOn: 'Available to members',
    availabilityOff: 'Not available to members',
    availabilityToggleAction: 'Change availability'
  },
  quarterly: {
    disabledHint: 'Available after your scheme is approved.',
    startAction: 'Start',
    continueAction: 'Continue',
    viewAction: 'View',
    statuses: {
      'not-started': 'Not started',
      'in-progress': 'In progress',
      submitted: 'Submitted'
    }
  },
  ia: {
    disabledHint: 'Available after your scheme is approved.',
    startAction: 'Start',
    continueAction: 'Continue',
    viewAction: 'View'
  },
  obligationBreakdown: { viewAction: 'View obligation breakdown' }
}

const approvedScheme = {
  id: 's1',
  name: 'Northern',
  approvalStatus: 'approved',
  approvalNumber: 'BCS/2026/001',
  approvedOn: '2026-01-15T00:00:00Z',
  submittedOn: '2026-01-02T00:00:00Z',
  evidenceAvailable: true
}

describe('QUARTERS', () => {
  test('lists four quarters in order', () => {
    expect(QUARTERS).toEqual(['Q1', 'Q2', 'Q3', 'Q4'])
  })
})

describe('buildApprovalTile', () => {
  test('not-started shows start action', () => {
    const tile = buildApprovalTile(null, urls, copy.approval)
    expect(tile.status).toBe('not-started')
    expect(tile.statusLabel).toBe('Not started')
    expect(tile.action).toEqual({
      text: 'Start application',
      href: urls.applicationStart
    })
    expect(tile.approvalNumber).toBeNull()
  })

  test('in-progress shows continue action', () => {
    const tile = buildApprovalTile(
      { approvalStatus: 'in-progress' },
      urls,
      copy.approval
    )
    expect(tile.action.text).toBe('Continue application')
    expect(tile.action.href).toBe(urls.applicationStart)
  })

  test('submitted shows view action', () => {
    const tile = buildApprovalTile(
      { approvalStatus: 'submitted', submittedOn: '2026-01-02' },
      urls,
      copy.approval
    )
    expect(tile.action.text).toBe('View application')
    expect(tile.action.href).toBe(urls.applicationCheckAnswers)
    expect(tile.submittedOn).toBe('2026-01-02')
  })

  test('approved surfaces approval metadata', () => {
    const tile = buildApprovalTile(approvedScheme, urls, copy.approval)
    expect(tile.statusLabel).toBe('Approved')
    expect(tile.approvalNumber).toBe('BCS/2026/001')
    expect(tile.approvedOn).toBe('2026-01-15T00:00:00Z')
  })
})

describe('buildMembersTile', () => {
  test('counts the supplied (pre-filtered) member list', () => {
    const tile = buildMembersTile(
      [{ leftOn: null }, { leftOn: null }],
      urls,
      copy.members
    )
    expect(tile.count).toBe(2)
    expect(tile.manageHref).toBe(urls.members)
    expect(tile.manageActionText).toBe('Manage members')
  })

  test('zero members for empty input', () => {
    expect(buildMembersTile([], urls, copy.members).count).toBe(0)
  })
})

const zeroObligation = {
  totals: { obligation: 0, accepted: 0, awaiting: 0, outstanding: 0 }
}

describe('buildEvidenceTile', () => {
  test('sums accepted vs awaiting and surfaces availability on', () => {
    const tile = buildEvidenceTile(
      approvedScheme,
      [
        { status: 'accepted', tonnes: '1.500' },
        { status: 'accepted', tonnes: '0.750' },
        { status: 'awaiting-acceptance', tonnes: '2.000' }
      ],
      zeroObligation,
      urls,
      copy.evidence
    )
    expect(tile.acceptedTonnes).toBe('2.250')
    expect(tile.awaitingTonnes).toBe('2.000')
    expect(tile.obligationTonnes).toBe('0.000')
    expect(tile.deltaTonnes).toBe('-2.250')
    expect(tile.availability.on).toBe(true)
    expect(tile.availability.label).toBe('Available to members')
  })

  test('availability off when scheme missing or flag false', () => {
    const off = buildEvidenceTile(null, [], zeroObligation, urls, copy.evidence)
    expect(off.availability.on).toBe(false)
    expect(off.availability.label).toBe('Not available to members')
    expect(off.acceptedTonnes).toBe('0.000')
  })

  test('uses the supplied obligation total for the delta', () => {
    const tile = buildEvidenceTile(
      approvedScheme,
      [{ status: 'accepted', tonnes: '10' }],
      {
        totals: { obligation: 50, accepted: 10, awaiting: 0, outstanding: 40 }
      },
      urls,
      copy.evidence
    )
    expect(tile.obligationTonnes).toBe('50.000')
    expect(tile.deltaTonnes).toBe('40.000')
  })

  test('coerces missing tonnes to zero', () => {
    const tile = buildEvidenceTile(
      approvedScheme,
      [{ status: 'accepted' }],
      zeroObligation,
      urls,
      copy.evidence
    )
    expect(tile.acceptedTonnes).toBe('0.000')
  })
})

describe('buildQuarterlyTile', () => {
  test('gated when scheme not approved', () => {
    const tile = buildQuarterlyTile(
      { approvalStatus: 'submitted' },
      [],
      urls,
      copy.quarterly
    )
    expect(tile.gated).toBe(true)
    expect(tile.quarters).toHaveLength(4)
    expect(tile.quarters[0].action).toBeNull()
    expect(tile.quarters[0].statusLabel).toBe('Not started')
  })

  test('ungated when approved, picks start for unstarted quarters', () => {
    const tile = buildQuarterlyTile(approvedScheme, [], urls, copy.quarterly)
    expect(tile.gated).toBe(false)
    expect(tile.quarters[0].action).toEqual({
      text: 'Start',
      href: '/compliance-scheme/quarterly/Q1/member-list'
    })
  })

  test('picks continue for in-progress quarters', () => {
    const tile = buildQuarterlyTile(
      approvedScheme,
      [{ quarter: 'Q2', status: 'in-progress' }],
      urls,
      copy.quarterly
    )
    const q2 = tile.quarters.find((q) => q.quarter === 'Q2')
    expect(q2.action.text).toBe('Continue')
    expect(q2.action.href).toBe('/compliance-scheme/quarterly/Q2/member-list')
  })

  test('picks view for submitted quarters', () => {
    const tile = buildQuarterlyTile(
      approvedScheme,
      [{ quarter: 'Q3', status: 'submitted' }],
      urls,
      copy.quarterly
    )
    const q3 = tile.quarters.find((q) => q.quarter === 'Q3')
    expect(q3.action.text).toBe('View')
    expect(q3.action.href).toBe('/compliance-scheme/quarterly/Q3/check-answers')
    expect(q3.statusLabel).toBe('Submitted')
  })
})

describe('buildIaTile', () => {
  test('gated when scheme not approved', () => {
    const tile = buildIaTile(
      { approvalStatus: 'not-started' },
      [],
      urls,
      copy.ia
    )
    expect(tile.gated).toBe(true)
    expect(tile.action).toBeNull()
  })

  test('start when ungated and no submission', () => {
    const tile = buildIaTile(approvedScheme, [], urls, copy.ia)
    expect(tile.action).toEqual({
      text: 'Start',
      href: '/compliance-scheme/industrial-automotive/member-list'
    })
  })

  test('continue when ungated and in-progress', () => {
    const tile = buildIaTile(
      approvedScheme,
      [{ status: 'in-progress' }],
      urls,
      copy.ia
    )
    expect(tile.action.text).toBe('Continue')
    expect(tile.action.href).toBe(
      '/compliance-scheme/industrial-automotive/member-list'
    )
  })

  test('view when ungated and submitted', () => {
    const tile = buildIaTile(
      approvedScheme,
      [{ status: 'submitted' }],
      urls,
      copy.ia
    )
    expect(tile.action.text).toBe('View')
    expect(tile.action.href).toBe(
      '/compliance-scheme/industrial-automotive/check-answers'
    )
  })
})

describe('buildObligationBreakdownTile', () => {
  test('surfaces obligation URL and copy', () => {
    const tile = buildObligationBreakdownTile(urls, copy.obligationBreakdown)
    expect(tile.viewHref).toBe(urls.obligation)
    expect(tile.viewActionText).toBe('View obligation breakdown')
  })
})

describe('buildDashboardViewModel', () => {
  test('composes every tile for an approved scheme', () => {
    const vm = buildDashboardViewModel({
      scheme: approvedScheme,
      members: [{ leftOn: null }],
      quarterly: [{ quarter: 'Q1', status: 'submitted' }],
      ia: [{ status: 'in-progress' }],
      evidence: [{ status: 'accepted', tonnes: '1.000' }],
      obligation: zeroObligation,
      urls,
      copy
    })
    expect(vm.scheme.name).toBe('Northern')
    expect(vm.approval.statusLabel).toBe('Approved')
    expect(vm.members.count).toBe(1)
    expect(vm.evidence.acceptedTonnes).toBe('1.000')
    expect(vm.quarterly.gated).toBe(false)
    expect(vm.ia.gated).toBe(false)
    expect(vm.obligationBreakdown.viewHref).toBe(urls.obligation)
  })

  test('composes view model when no scheme provided', () => {
    const vm = buildDashboardViewModel({
      scheme: null,
      members: [],
      quarterly: [],
      ia: [],
      evidence: [],
      obligation: zeroObligation,
      urls,
      copy
    })
    expect(vm.scheme.id).toBeNull()
    expect(vm.scheme.name).toBeNull()
    expect(vm.approval.status).toBe('not-started')
    expect(vm.quarterly.gated).toBe(true)
    expect(vm.ia.gated).toBe(true)
  })
})
