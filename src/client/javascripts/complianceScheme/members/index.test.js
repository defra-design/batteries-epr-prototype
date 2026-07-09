// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { runMembersPage } from './index.js'
import { storage, createSchemeMember } from '../../storage-adapter.js'

const buildListDom = (payload) => {
  document.body.innerHTML = `
    <table><tbody data-testid="members-pending-body"></tbody></table>
    <p data-testid="members-pending-empty" hidden></p>
    <table><tbody data-testid="members-active-body"></tbody></table>
    <p data-testid="members-active-empty" hidden></p>
    <table><tbody data-testid="members-history-body"></tbody></table>
    <p data-testid="members-history-empty" hidden></p>
    <script id="page-payload" type="application/json">${JSON.stringify(payload)}</script>
  `
}

const buildAddDom = (payload) => {
  document.body.innerHTML = `
    <form></form>
    <script id="page-payload" type="application/json">${JSON.stringify(payload)}</script>
  `
}

const buildRemoveDom = (payload) => {
  document.body.innerHTML = `
    <p data-testid="members-remove-name">
      <span data-testid="members-remove-member-name"></span>
      <span data-testid="members-remove-member-bprn"></span>
    </p>
    <p data-testid="members-remove-not-found" hidden></p>
    <button data-testid="members-remove-confirm">Confirm</button>
    <script id="page-payload" type="application/json">${JSON.stringify(payload)}</script>
  `
}

const LIST_PAYLOAD = {
  view: 'list',
  compliancePeriodYear: '2026',
  copy: {
    removeAction: 'Remove',
    acceptAction: 'Accept',
    rejectAction: 'Reject',
    acceptConfirm: 'Accept this producer into the scheme?',
    rejectConfirm: 'Reject this producer’s request to join?'
  },
  urls: {
    add: '/compliance-scheme/members/add',
    removeTemplate: '/compliance-scheme/members/{memberId}/remove',
    dashboard: '/compliance-scheme'
  }
}

let assignSpy

beforeEach(() => {
  globalThis.localStorage.clear()
  storage.seedDemoData()
  storage.setCurrentSchemeId(storage.listSchemes()[0].id)
  assignSpy = vi.fn()
  Object.defineProperty(globalThis, 'location', {
    value: { assign: assignSpy, reload: vi.fn() },
    writable: true,
    configurable: true
  })
})

afterEach(() => {
  globalThis.localStorage.clear()
})

describe('members list view', () => {
  test('shows empty messages when no members exist', () => {
    buildListDom(LIST_PAYLOAD)
    expect(runMembersPage(document, globalThis.location)).toBe('list')
    expect(
      document.querySelector('[data-testid="members-active-empty"]').hidden
    ).toBe(false)
    expect(
      document.querySelector('[data-testid="members-history-empty"]').hidden
    ).toBe(false)
  })

  test('renders active and history rows separately', () => {
    const [scheme] = storage.listSchemes()
    storage.saveSchemeMember(
      createSchemeMember({
        schemeId: scheme.id,
        producerBprn: 'BPRN-EA-2026-000001',
        companyName: 'Active Co',
        joinedOn: '2026-02-01T00:00:00Z'
      })
    )
    storage.saveSchemeMember(
      createSchemeMember({
        schemeId: scheme.id,
        producerBprn: 'BPRN-EA-2026-000002',
        companyName: 'Gone Co & Sons',
        joinedOn: '2026-02-01T00:00:00Z',
        leftOn: '2026-04-01T00:00:00Z'
      })
    )

    buildListDom(LIST_PAYLOAD)
    runMembersPage(document, globalThis.location)

    expect(
      document.querySelectorAll('[data-testid="members-active-row"]')
    ).toHaveLength(1)
    expect(
      document.querySelectorAll('[data-testid="members-history-row"]')
    ).toHaveLength(1)
    expect(
      document.querySelector('[data-testid="members-active-bprn"]').textContent
    ).toBe('BPRN-EA-2026-000001')
    expect(
      document.querySelector('[data-testid="members-active-remove"]').href
    ).toMatch(/\/compliance-scheme\/members\/[0-9a-f-]+\/remove$/)
    expect(
      document.querySelector('[data-testid="members-history-row"]').innerHTML
    ).toContain('Gone Co &amp; Sons')
    expect(
      document.querySelector('[data-testid="members-active-empty"]').hidden
    ).toBe(true)
    expect(
      document.querySelector('[data-testid="members-history-empty"]').hidden
    ).toBe(true)
  })

  test('hides members joined after the active compliance period', () => {
    const [scheme] = storage.listSchemes()
    storage.saveSchemeMember(
      createSchemeMember({
        schemeId: scheme.id,
        producerBprn: 'BPRN-EA-2026-000001',
        companyName: '2026 member',
        joinedOn: '2026-04-01T00:00:00Z'
      })
    )
    storage.saveSchemeMember(
      createSchemeMember({
        schemeId: scheme.id,
        producerBprn: 'BPRN-EA-2027-000002',
        companyName: 'Future member',
        joinedOn: '2027-03-01T00:00:00Z'
      })
    )

    buildListDom({ ...LIST_PAYLOAD, compliancePeriodYear: '2026' })
    runMembersPage(document, globalThis.location)
    expect(
      document.querySelectorAll('[data-testid="members-active-row"]')
    ).toHaveLength(1)
    expect(
      document.querySelector('[data-testid="members-active-company"]')
        .textContent
    ).toBe('2026 member')
  })

  test('treats members who left this year or earlier as history', () => {
    const [scheme] = storage.listSchemes()
    storage.saveSchemeMember(
      createSchemeMember({
        schemeId: scheme.id,
        producerBprn: 'BPRN-EA-2026-000003',
        companyName: 'Long-standing',
        joinedOn: '2026-01-01T00:00:00Z'
      })
    )
    storage.saveSchemeMember(
      createSchemeMember({
        schemeId: scheme.id,
        producerBprn: 'BPRN-EA-2026-000004',
        companyName: 'Left in 2026',
        joinedOn: '2026-01-01T00:00:00Z',
        leftOn: '2026-12-01T00:00:00Z'
      })
    )
    storage.saveSchemeMember(
      createSchemeMember({
        schemeId: scheme.id,
        producerBprn: 'BPRN-EA-2026-000005',
        companyName: 'Leaves in 2027',
        joinedOn: '2026-01-01T00:00:00Z',
        leftOn: '2027-04-01T00:00:00Z'
      })
    )

    buildListDom({ ...LIST_PAYLOAD, compliancePeriodYear: '2026' })
    runMembersPage(document, globalThis.location)
    expect(
      document.querySelectorAll('[data-testid="members-active-row"]')
    ).toHaveLength(2)
    expect(
      document.querySelectorAll('[data-testid="members-history-row"]')
    ).toHaveLength(1)

    buildListDom({ ...LIST_PAYLOAD, compliancePeriodYear: '2027' })
    runMembersPage(document, globalThis.location)
    expect(
      document.querySelectorAll('[data-testid="members-active-row"]')
    ).toHaveLength(1)
    expect(
      document.querySelectorAll('[data-testid="members-history-row"]')
    ).toHaveLength(2)
  })
})

describe('members pending acceptance', () => {
  const seedPendingMember = (scheme, overrides = {}) =>
    storage.saveSchemeMember(
      createSchemeMember({
        schemeId: scheme.id,
        producerEmail: 'pending@x.com',
        companyName: 'Pending Co',
        compliancePeriod: '2026',
        status: 'pendingAcceptance',
        joinedOn: '2026-02-01T00:00:00Z',
        ...overrides
      })
    )

  test('renders one row per pending member and hides the empty message', () => {
    const [scheme] = storage.listSchemes()
    seedPendingMember(scheme)
    buildListDom(LIST_PAYLOAD)
    runMembersPage(document, globalThis.location)
    const rows = document.querySelectorAll(
      '[data-testid="members-pending-row"]'
    )
    expect(rows).toHaveLength(1)
    expect(rows[0].dataset.memberId).toBeTruthy()
    expect(
      document.querySelector('[data-testid="members-pending-company"]')
        .textContent
    ).toBe('Pending Co')
    expect(
      document.querySelector('[data-testid="members-pending-empty"]').hidden
    ).toBe(true)
  })

  test('shows the empty pending message when no pending members exist', () => {
    buildListDom(LIST_PAYLOAD)
    runMembersPage(document, globalThis.location)
    expect(
      document.querySelector('[data-testid="members-pending-empty"]').hidden
    ).toBe(false)
  })

  test('accept button flips the member to active when confirmed and reloads', () => {
    const [scheme] = storage.listSchemes()
    const member = seedPendingMember(scheme)
    const confirmSpy = vi.spyOn(globalThis, 'confirm').mockReturnValue(true)

    buildListDom(LIST_PAYLOAD)
    runMembersPage(document, globalThis.location)
    document.querySelector('[data-testid="members-pending-accept"]').click()

    const updated = storage.listSchemeMembers().find((m) => m.id === member.id)
    expect(updated.status).toBe('active')
    expect(updated.producerBprn).toMatch(/^BPRN-/)
    expect(globalThis.location.reload).toHaveBeenCalled()
    confirmSpy.mockRestore()
  })

  test('accept button is a no-op when the operator declines the confirm', () => {
    const [scheme] = storage.listSchemes()
    const member = seedPendingMember(scheme)
    const confirmSpy = vi.spyOn(globalThis, 'confirm').mockReturnValue(false)

    buildListDom(LIST_PAYLOAD)
    runMembersPage(document, globalThis.location)
    document.querySelector('[data-testid="members-pending-accept"]').click()

    expect(
      storage.listSchemeMembers().find((m) => m.id === member.id).status
    ).toBe('pendingAcceptance')
    expect(globalThis.location.reload).not.toHaveBeenCalled()
    confirmSpy.mockRestore()
  })

  test('reject button closes the membership when confirmed', () => {
    const [scheme] = storage.listSchemes()
    const member = seedPendingMember(scheme)
    const confirmSpy = vi.spyOn(globalThis, 'confirm').mockReturnValue(true)

    buildListDom(LIST_PAYLOAD)
    runMembersPage(document, globalThis.location)
    document.querySelector('[data-testid="members-pending-reject"]').click()

    const updated = storage.listSchemeMembers().find((m) => m.id === member.id)
    expect(updated.status).toBe('rejected')
    expect(updated.reasonForLeaving).toBe('rejected-by-scheme')
    confirmSpy.mockRestore()
  })

  test('reject button is a no-op when declined', () => {
    const [scheme] = storage.listSchemes()
    const member = seedPendingMember(scheme)
    const confirmSpy = vi.spyOn(globalThis, 'confirm').mockReturnValue(false)

    buildListDom(LIST_PAYLOAD)
    runMembersPage(document, globalThis.location)
    document.querySelector('[data-testid="members-pending-reject"]').click()

    expect(
      storage.listSchemeMembers().find((m) => m.id === member.id).status
    ).toBe('pendingAcceptance')
    confirmSpy.mockRestore()
  })
})

describe('members add view', () => {
  test('hydrate does nothing observable beyond returning hydrated', () => {
    buildAddDom({ view: 'add', target: 'hydrate' })
    expect(runMembersPage(document, globalThis.location)).toBe('hydrated')
    expect(storage.listSchemeMembers()).toHaveLength(0)
  })

  test('persist appends the member and navigates to the list', () => {
    buildAddDom({
      view: 'add',
      target: 'persist',
      member: {
        producerBprn: 'BPRN-EA-2026-000010',
        companyName: 'New Member Co'
      },
      next: '/compliance-scheme/members'
    })

    expect(runMembersPage(document, globalThis.location)).toBe('navigated')
    const [member] = storage.listSchemeMembers()
    expect(member.producerBprn).toBe('BPRN-EA-2026-000010')
    expect(member.companyName).toBe('New Member Co')
    expect(member.leftOn).toBeNull()
    expect(member.joinedOn).toBeTruthy()
    expect(assignSpy).toHaveBeenCalledWith('/compliance-scheme/members')
  })
})

describe('members remove view', () => {
  test('hydrate shows the member name when present', () => {
    const [scheme] = storage.listSchemes()
    const member = storage.saveSchemeMember(
      createSchemeMember({
        schemeId: scheme.id,
        producerBprn: 'BPRN-EA-2026-000001',
        companyName: 'About to leave'
      })
    )
    buildRemoveDom({ view: 'remove', target: 'hydrate', memberId: member.id })
    expect(runMembersPage(document, globalThis.location)).toBe('hydrated')
    expect(
      document.querySelector('[data-testid="members-remove-member-name"]')
        .textContent
    ).toBe('About to leave')
    expect(
      document.querySelector('[data-testid="members-remove-not-found"]').hidden
    ).toBe(true)
  })

  test('hydrate shows not-found message when memberId is unknown', () => {
    buildRemoveDom({
      view: 'remove',
      target: 'hydrate',
      memberId: 'missing'
    })
    runMembersPage(document, globalThis.location)
    expect(
      document.querySelector('[data-testid="members-remove-not-found"]').hidden
    ).toBe(false)
    expect(
      document.querySelector('[data-testid="members-remove-confirm"]').disabled
    ).toBe(true)
  })

  test('hydrate shows not-found when member is already removed', () => {
    const [scheme] = storage.listSchemes()
    const member = storage.saveSchemeMember(
      createSchemeMember({
        schemeId: scheme.id,
        producerBprn: 'BPRN-EA-2026-000003',
        companyName: 'Already gone',
        leftOn: '2026-04-01T00:00:00Z'
      })
    )
    buildRemoveDom({ view: 'remove', target: 'hydrate', memberId: member.id })
    runMembersPage(document, globalThis.location)
    expect(
      document.querySelector('[data-testid="members-remove-not-found"]').hidden
    ).toBe(false)
  })

  test('persist marks the member as left and navigates to the list', () => {
    const [scheme] = storage.listSchemes()
    const member = storage.saveSchemeMember(
      createSchemeMember({
        schemeId: scheme.id,
        producerBprn: 'BPRN-EA-2026-000004',
        companyName: 'Leaving'
      })
    )
    buildRemoveDom({
      view: 'remove',
      target: 'persist',
      memberId: member.id,
      next: '/compliance-scheme/members'
    })

    expect(runMembersPage(document, globalThis.location)).toBe('navigated')
    const stored = storage
      .listSchemeMembers(scheme.id)
      .find((m) => m.id === member.id)
    expect(stored.leftOn).toBeTruthy()
    expect(assignSpy).toHaveBeenCalledWith('/compliance-scheme/members')
  })

  test('persist on an unknown member still navigates without mutating state', () => {
    buildRemoveDom({
      view: 'remove',
      target: 'persist',
      memberId: 'missing',
      next: '/compliance-scheme/members'
    })
    runMembersPage(document, globalThis.location)
    expect(storage.listSchemeMembers()).toHaveLength(0)
    expect(assignSpy).toHaveBeenCalledWith('/compliance-scheme/members')
  })

  test('persist on an already-removed member is a no-op aside from navigation', () => {
    const [scheme] = storage.listSchemes()
    const member = storage.saveSchemeMember(
      createSchemeMember({
        schemeId: scheme.id,
        producerBprn: 'BPRN-EA-2026-000005',
        companyName: 'Done',
        leftOn: '2026-04-01T00:00:00Z'
      })
    )
    const before = storage
      .listSchemeMembers(scheme.id)
      .find((m) => m.id === member.id).leftOn
    buildRemoveDom({
      view: 'remove',
      target: 'persist',
      memberId: member.id,
      next: '/compliance-scheme/members'
    })
    runMembersPage(document, globalThis.location)
    const after = storage
      .listSchemeMembers(scheme.id)
      .find((m) => m.id === member.id).leftOn
    expect(after).toBe(before)
  })

  test('redirects to the sign-in picker when no current scheme is selected', () => {
    storage.clearCurrentSchemeId()
    buildListDom(LIST_PAYLOAD)
    expect(runMembersPage(document, globalThis.location)).toBe(
      'redirected-to-sign-in'
    )
    expect(assignSpy).toHaveBeenCalledWith('/compliance-scheme/sign-in')
  })
})
