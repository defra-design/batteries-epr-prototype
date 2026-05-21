// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { runEvidencePage, __testing__ } from './index.js'
import {
  storage,
  createEvidence,
  createSchemeMember
} from '../../storage-adapter.js'

const LIST_COPY = {
  removeAction: 'Remove',
  viewAction: 'View',
  categories: {
    portable: 'Portable',
    industrial: 'Industrial',
    automotive: 'Automotive'
  },
  statuses: {
    'awaiting-acceptance': 'Awaiting',
    accepted: 'Accepted',
    'awaiting-authorisation': 'Awaiting auth',
    cancelled: 'Cancelled'
  },
  transferLabels: { XOUT: 'Out', XIN: 'In' }
}

const LIST_PAYLOAD = {
  view: 'list',
  compliancePeriodYear: '2026',
  copy: LIST_COPY,
  urls: {
    issue: '/compliance-scheme/evidence/issue/recipient',
    availability: '/compliance-scheme/evidence/availability',
    detailTemplate: '/compliance-scheme/evidence/{evidenceId}',
    dashboard: '/compliance-scheme'
  }
}

const buildListDom = (payload = LIST_PAYLOAD) => {
  document.body.innerHTML = `
    <table><tbody data-testid="evidence-body"></tbody></table>
    <p data-testid="evidence-empty" hidden></p>
    <script id="page-payload" type="application/json">${JSON.stringify(payload)}</script>
  `
}

const buildDom = (payload, html = '') => {
  document.body.innerHTML = `
    ${html}
    <script id="page-payload" type="application/json">${JSON.stringify(payload)}</script>
  `
}

const buildRecipientDom = (payload) => {
  document.body.innerHTML = `
    <p data-testid="evidence-issue-no-members" hidden></p>
    <div data-testid="evidence-issue-recipient-radios"></div>
    <form></form>
    <script id="page-payload" type="application/json">${JSON.stringify(payload)}</script>
  `
}

const buildDeclarationDom = (payload) => {
  document.body.innerHTML = `
    <dd data-testid="evidence-issue-summary-recipient"></dd>
    <dd data-testid="evidence-issue-summary-category"></dd>
    <dd data-testid="evidence-issue-summary-tonnes"></dd>
    <script id="page-payload" type="application/json">${JSON.stringify(payload)}</script>
  `
}

const buildDetailDom = (payload) => {
  document.body.innerHTML = `
    <p data-testid="evidence-detail-not-found" hidden></p>
    <dl data-testid="evidence-detail-list">
      <dd data-testid="evidence-detail-recipient"></dd>
      <dd data-testid="evidence-detail-category"></dd>
      <dd data-testid="evidence-detail-tonnes"></dd>
      <dd data-testid="evidence-detail-status"></dd>
      <dd data-testid="evidence-detail-issued"></dd>
      <dd data-testid="evidence-detail-transfer"></dd>
    </dl>
    <div data-testid="evidence-detail-buttons"></div>
    <p data-testid="evidence-detail-no-actions" hidden></p>
    <script id="page-payload" type="application/json">${JSON.stringify(payload)}</script>
  `
}

const buildTransferDom = (payload) => {
  document.body.innerHTML = `
    <p data-testid="evidence-transfer-not-found" hidden></p>
    <p data-testid="evidence-transfer-ineligible" hidden></p>
    <p data-testid="evidence-transfer-no-candidates" hidden></p>
    <form data-testid="evidence-transfer-form">
      <div data-testid="evidence-transfer-candidates"></div>
    </form>
    <script id="page-payload" type="application/json">${JSON.stringify(payload)}</script>
  `
}

const buildAvailabilityDom = (payload) => {
  document.body.innerHTML = `
    <span data-testid="evidence-availability-current"></span>
    <script id="page-payload" type="application/json">${JSON.stringify(payload)}</script>
  `
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

describe('evidence list', () => {
  test('shows empty state when no evidence exists', () => {
    buildListDom()
    expect(runEvidencePage(document, globalThis.location)).toBe('list')
    expect(
      document.querySelector('[data-testid="evidence-empty"]').hidden
    ).toBe(false)
  })

  test('renders rows for evidence in the active year', () => {
    const [scheme] = storage.listSchemes()
    storage.saveEvidence(
      createEvidence({
        schemeId: scheme.id,
        compliancePeriodYear: '2026',
        recipientBprn: 'BPRN-1',
        recipientName: 'Acme & Sons',
        tonnes: '2.500',
        category: 'portable',
        status: 'awaiting-acceptance'
      })
    )
    storage.saveEvidence(
      createEvidence({
        schemeId: scheme.id,
        compliancePeriodYear: '2027',
        recipientBprn: 'BPRN-2',
        category: 'portable',
        tonnes: '5.000'
      })
    )
    buildListDom()
    runEvidencePage(document, globalThis.location)
    expect(
      document.querySelectorAll('[data-testid="evidence-row"]')
    ).toHaveLength(1)
    expect(
      document.querySelector('[data-testid="evidence-row-recipient"]').innerHTML
    ).toContain('Acme &amp; Sons')
    expect(
      document.querySelector('[data-testid="evidence-row-status"]').textContent
    ).toBe('Awaiting')
  })

  test('renders transferred-out label when transferDirection is set', () => {
    const [scheme] = storage.listSchemes()
    storage.saveEvidence(
      createEvidence({
        schemeId: scheme.id,
        compliancePeriodYear: '2026',
        recipientBprn: 'BPRN-1',
        tonnes: '1',
        category: 'portable',
        transferDirection: 'XOUT'
      })
    )
    buildListDom()
    runEvidencePage(document, globalThis.location)
    expect(
      document.querySelector('[data-testid="evidence-row-transfer"]').textContent
    ).toBe('Out')
  })
})

describe('evidence issue wizard', () => {
  const baseHydrate = (step) => ({
    view: 'issue',
    step,
    compliancePeriodYear: '2026',
    target: 'hydrate'
  })

  test('recipient step renders radio per active member; pre-checks the drafted choice', () => {
    const [scheme] = storage.listSchemes()
    storage.saveSchemeMember(
      createSchemeMember({
        schemeId: scheme.id,
        producerBprn: 'BPRN-A',
        companyName: 'Alpha',
        joinedOn: '2026-01-01T00:00:00Z'
      })
    )
    storage.saveSchemeMember(
      createSchemeMember({
        schemeId: scheme.id,
        producerBprn: 'BPRN-B',
        companyName: 'Beta',
        joinedOn: '2026-01-01T00:00:00Z'
      })
    )
    __testing__.writeDraft({ recipientBprn: 'BPRN-B' })
    buildRecipientDom(baseHydrate('recipient'))
    expect(runEvidencePage(document, globalThis.location)).toBe('hydrated')
    const options = document.querySelectorAll(
      '[data-testid="evidence-issue-recipient-option"]'
    )
    expect(options).toHaveLength(2)
    const checkedRadio = document.querySelector(
      'input[name="recipientBprn"]:checked'
    )
    expect(checkedRadio.value).toBe('BPRN-B')
  })

  test('recipient step shows no-members message when no active members exist', () => {
    buildRecipientDom(baseHydrate('recipient'))
    runEvidencePage(document, globalThis.location)
    expect(
      document.querySelector('[data-testid="evidence-issue-no-members"]').hidden
    ).toBe(false)
  })

  test('recipient persist writes a draft and navigates', () => {
    buildDom({
      view: 'issue',
      step: 'recipient',
      compliancePeriodYear: '2026',
      target: 'persist',
      patch: { recipientBprn: 'BPRN-A' },
      next: '/compliance-scheme/evidence/issue/tonnes'
    })
    expect(runEvidencePage(document, globalThis.location)).toBe('navigated')
    expect(__testing__.readDraft()).toEqual({ recipientBprn: 'BPRN-A' })
    expect(assignSpy).toHaveBeenCalledWith(
      '/compliance-scheme/evidence/issue/tonnes'
    )
  })

  test('tonnes hydrate fills form from draft', () => {
    __testing__.writeDraft({ category: 'portable', tonnes: '1.5' })
    buildDom(
      baseHydrate('tonnes'),
      '<form><input name="category" /><input name="tonnes" /></form>'
    )
    runEvidencePage(document, globalThis.location)
    expect(document.querySelector('input[name="tonnes"]').value).toBe('1.5')
  })

  test('declaration hydrate renders summary from draft and active member', () => {
    const [scheme] = storage.listSchemes()
    storage.saveSchemeMember(
      createSchemeMember({
        schemeId: scheme.id,
        producerBprn: 'BPRN-A',
        companyName: 'Alpha',
        joinedOn: '2026-01-01T00:00:00Z'
      })
    )
    __testing__.writeDraft({
      recipientBprn: 'BPRN-A',
      category: 'industrial',
      tonnes: '7'
    })
    buildDeclarationDom(baseHydrate('declaration'))
    runEvidencePage(document, globalThis.location)
    expect(
      document.querySelector(
        '[data-testid="evidence-issue-summary-recipient"]'
      ).textContent
    ).toContain('Alpha')
    expect(
      document.querySelector('[data-testid="evidence-issue-summary-tonnes"]')
        .textContent
    ).toBe('7')
  })

  test('declaration hydrate falls back to raw BPRN when member is unknown', () => {
    __testing__.writeDraft({
      recipientBprn: 'BPRN-UNKNOWN',
      category: 'portable',
      tonnes: '1'
    })
    buildDeclarationDom(baseHydrate('declaration'))
    runEvidencePage(document, globalThis.location)
    expect(
      document.querySelector(
        '[data-testid="evidence-issue-summary-recipient"]'
      ).textContent
    ).toBe('BPRN-UNKNOWN')
  })

  test('declaration commit creates evidence and clears the draft', () => {
    const [scheme] = storage.listSchemes()
    storage.saveSchemeMember(
      createSchemeMember({
        schemeId: scheme.id,
        producerBprn: 'BPRN-A',
        companyName: 'Alpha',
        joinedOn: '2026-01-01T00:00:00Z'
      })
    )
    __testing__.writeDraft({
      recipientBprn: 'BPRN-A',
      category: 'portable',
      tonnes: '2.000'
    })
    buildDom({
      view: 'issue',
      step: 'declaration',
      compliancePeriodYear: '2026',
      target: 'persist',
      patch: { commit: true },
      next: '/compliance-scheme/evidence/issue/confirmation'
    })
    runEvidencePage(document, globalThis.location)
    const items = storage.listEvidence(scheme.id, '2026')
    expect(items).toHaveLength(1)
    expect(items[0].category).toBe('portable')
    expect(items[0].recipientName).toBe('Alpha')
    expect(items[0].status).toBe('awaiting-acceptance')
    expect(__testing__.readDraft()).toEqual({})
    expect(assignSpy).toHaveBeenCalled()
  })

  test('confirmation step is a no-op hydrate', () => {
    buildDom(baseHydrate('confirmation'))
    expect(runEvidencePage(document, globalThis.location)).toBe('hydrated')
  })

  test('commit when recipient is unknown still creates evidence without recipientName', () => {
    const [scheme] = storage.listSchemes()
    __testing__.writeDraft({
      recipientBprn: 'BPRN-UNKNOWN',
      category: 'portable',
      tonnes: '1'
    })
    buildDom({
      view: 'issue',
      step: 'declaration',
      compliancePeriodYear: '2026',
      target: 'persist',
      patch: { commit: true },
      next: '/compliance-scheme/evidence/issue/confirmation'
    })
    runEvidencePage(document, globalThis.location)
    const [item] = storage.listEvidence(scheme.id, '2026')
    expect(item.recipientName).toBeNull()
  })
})

describe('evidence detail', () => {
  test('hydrate shows fields for an awaiting-acceptance item', () => {
    const [scheme] = storage.listSchemes()
    const item = storage.saveEvidence(
      createEvidence({
        schemeId: scheme.id,
        compliancePeriodYear: '2026',
        recipientBprn: 'BPRN-1',
        recipientName: 'Acme',
        category: 'portable',
        tonnes: '3.000',
        status: 'awaiting-acceptance',
        issuedOn: '2026-04-01T00:00:00Z'
      })
    )
    buildDetailDom({
      view: 'detail',
      target: 'hydrate',
      evidenceId: item.id
    })
    runEvidencePage(document, globalThis.location)
    expect(
      document.querySelector('[data-testid="evidence-detail-recipient"]')
        .textContent
    ).toBe('Acme')
    expect(
      document.querySelector('[data-testid="evidence-detail-buttons"]').hidden
    ).toBe(false)
    expect(
      document.querySelector('[data-testid="evidence-detail-transfer"]')
        .textContent
    ).toBe('—')
  })

  test('hydrate shows not-found message when id is unknown', () => {
    buildDetailDom({
      view: 'detail',
      target: 'hydrate',
      evidenceId: 'missing'
    })
    runEvidencePage(document, globalThis.location)
    expect(
      document.querySelector('[data-testid="evidence-detail-not-found"]').hidden
    ).toBe(false)
  })

  test('hydrate hides action buttons when status is already accepted', () => {
    const [scheme] = storage.listSchemes()
    const item = storage.saveEvidence(
      createEvidence({
        schemeId: scheme.id,
        compliancePeriodYear: '2026',
        recipientBprn: 'BPRN-1',
        category: 'portable',
        tonnes: '1',
        status: 'accepted',
        transferDirection: 'XOUT',
        counterpartySchemeId: 'other-scheme'
      })
    )
    buildDetailDom({
      view: 'detail',
      target: 'hydrate',
      evidenceId: item.id
    })
    runEvidencePage(document, globalThis.location)
    expect(
      document.querySelector('[data-testid="evidence-detail-buttons"]').hidden
    ).toBe(true)
    expect(
      document.querySelector('[data-testid="evidence-detail-no-actions"]').hidden
    ).toBe(false)
    expect(
      document.querySelector('[data-testid="evidence-detail-transfer"]')
        .textContent
    ).toContain('XOUT')
  })

  test('persist updates status and navigates', () => {
    const [scheme] = storage.listSchemes()
    const item = storage.saveEvidence(
      createEvidence({
        schemeId: scheme.id,
        compliancePeriodYear: '2026',
        recipientBprn: 'BPRN-1',
        category: 'portable',
        tonnes: '1',
        status: 'awaiting-acceptance'
      })
    )
    buildDom({
      view: 'detail',
      target: 'persist',
      evidenceId: item.id,
      newStatus: 'accepted',
      next: '/compliance-scheme/evidence'
    })
    runEvidencePage(document, globalThis.location)
    expect(storage.findEvidence(item.id).status).toBe('accepted')
    expect(assignSpy).toHaveBeenCalledWith('/compliance-scheme/evidence')
  })
})

describe('evidence transfer', () => {
  test('hydrate renders candidate schemes (excluding current)', () => {
    const [scheme] = storage.listSchemes()
    const item = storage.saveEvidence(
      createEvidence({
        schemeId: scheme.id,
        compliancePeriodYear: '2026',
        recipientBprn: 'BPRN-1',
        category: 'portable',
        tonnes: '1',
        status: 'awaiting-acceptance'
      })
    )
    buildTransferDom({
      view: 'transfer',
      target: 'hydrate',
      evidenceId: item.id
    })
    runEvidencePage(document, globalThis.location)
    expect(
      document.querySelectorAll('[data-testid="evidence-transfer-option"]')
        .length
    ).toBeGreaterThanOrEqual(1)
  })

  test('hydrate shows not-found when id is unknown', () => {
    buildTransferDom({
      view: 'transfer',
      target: 'hydrate',
      evidenceId: 'missing'
    })
    runEvidencePage(document, globalThis.location)
    expect(
      document.querySelector('[data-testid="evidence-transfer-not-found"]')
        .hidden
    ).toBe(false)
  })

  test('hydrate shows ineligible when already transferred', () => {
    const [scheme] = storage.listSchemes()
    const item = storage.saveEvidence(
      createEvidence({
        schemeId: scheme.id,
        compliancePeriodYear: '2026',
        recipientBprn: 'BPRN-1',
        category: 'portable',
        tonnes: '1',
        status: 'awaiting-authorisation',
        transferDirection: 'XOUT'
      })
    )
    buildTransferDom({
      view: 'transfer',
      target: 'hydrate',
      evidenceId: item.id
    })
    runEvidencePage(document, globalThis.location)
    expect(
      document.querySelector('[data-testid="evidence-transfer-ineligible"]')
        .hidden
    ).toBe(false)
  })

  test('hydrate shows no-candidates message when no other schemes exist', () => {
    globalThis.localStorage.removeItem('npwd-batteries:schemes')
    storage.saveScheme({
      id: 'solo',
      name: 'Solo',
      approvalStatus: 'approved',
      evidenceAvailable: true
    })
    storage.setCurrentSchemeId('solo')
    const item = storage.saveEvidence(
      createEvidence({
        schemeId: 'solo',
        compliancePeriodYear: '2026',
        recipientBprn: 'BPRN-1',
        category: 'portable',
        tonnes: '1',
        status: 'awaiting-acceptance'
      })
    )
    buildTransferDom({
      view: 'transfer',
      target: 'hydrate',
      evidenceId: item.id
    })
    runEvidencePage(document, globalThis.location)
    expect(
      document.querySelector('[data-testid="evidence-transfer-no-candidates"]')
        .hidden
    ).toBe(false)
  })

  test('persist sets transferDirection and navigates', () => {
    const [scheme] = storage.listSchemes()
    const item = storage.saveEvidence(
      createEvidence({
        schemeId: scheme.id,
        compliancePeriodYear: '2026',
        recipientBprn: 'BPRN-1',
        category: 'portable',
        tonnes: '1',
        status: 'awaiting-acceptance'
      })
    )
    buildDom({
      view: 'transfer',
      target: 'persist',
      evidenceId: item.id,
      counterpartySchemeId: 'cp-1',
      next: '/compliance-scheme/evidence'
    })
    runEvidencePage(document, globalThis.location)
    const stored = storage.findEvidence(item.id)
    expect(stored.transferDirection).toBe('XOUT')
    expect(stored.counterpartySchemeId).toBe('cp-1')
    expect(stored.status).toBe('awaiting-authorisation')
    expect(assignSpy).toHaveBeenCalledWith('/compliance-scheme/evidence')
  })
})

describe('evidence availability', () => {
  test('hydrate reflects current availability (Available)', () => {
    buildAvailabilityDom({ view: 'availability', target: 'hydrate' })
    runEvidencePage(document, globalThis.location)
    expect(
      document.querySelector('[data-testid="evidence-availability-current"]')
        .textContent
    ).toBe('Available')
  })

  test('hydrate reflects current availability (Not available)', () => {
    const [scheme] = storage.listSchemes()
    storage.setEvidenceAvailability(scheme.id, false)
    buildAvailabilityDom({ view: 'availability', target: 'hydrate' })
    runEvidencePage(document, globalThis.location)
    expect(
      document.querySelector('[data-testid="evidence-availability-current"]')
        .textContent
    ).toBe('Not available')
  })

  test('persist flips the availability and navigates', () => {
    const [scheme] = storage.listSchemes()
    buildDom({
      view: 'availability',
      target: 'persist',
      next: '/compliance-scheme/evidence'
    })
    runEvidencePage(document, globalThis.location)
    expect(storage.getScheme(scheme.id).evidenceAvailable).toBe(false)
    expect(assignSpy).toHaveBeenCalledWith('/compliance-scheme/evidence')
  })

  test('redirects to the sign-in picker when no current scheme is selected', () => {
    storage.clearCurrentSchemeId()
    buildListDom()
    expect(runEvidencePage(document, globalThis.location)).toBe(
      'redirected-to-sign-in'
    )
    expect(assignSpy).toHaveBeenCalledWith('/compliance-scheme/sign-in')
  })
})
