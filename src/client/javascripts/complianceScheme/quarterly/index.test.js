// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { runQuarterlyStep } from './index.js'
import { storage, createSchemeMember } from '../../storage-adapter.js'

const buildDom = (payload, formHtml = '') => {
  document.body.innerHTML = `
    ${formHtml}
    <script id="page-payload" type="application/json">${JSON.stringify(payload)}</script>
  `
}

const buildMemberListDom = (payload) => {
  document.body.innerHTML = `
    <table><tbody data-testid="quarterly-member-list-body"></tbody></table>
    <p data-testid="quarterly-member-list-empty" hidden></p>
    <script id="page-payload" type="application/json">${JSON.stringify(payload)}</script>
  `
}

const buildCheckDom = (payload) => {
  document.body.innerHTML = `
    <table>
      <tbody data-testid="quarterly-check-body"></tbody>
      <tfoot>
        <tr>
          <td data-testid="quarterly-check-total-market-portable"></td>
          <td data-testid="quarterly-check-total-market-industrial"></td>
          <td data-testid="quarterly-check-total-market-automotive"></td>
          <td data-testid="quarterly-check-total-waste-portable"></td>
          <td data-testid="quarterly-check-total-waste-industrial"></td>
          <td data-testid="quarterly-check-total-waste-automotive"></td>
        </tr>
      </tfoot>
    </table>
    <script id="page-payload" type="application/json">${JSON.stringify(payload)}</script>
  `
}

const buildMemberFormDom = (payload) => {
  document.body.innerHTML = `
    <p data-testid="quarterly-member-name"></p>
    <form>
      <input name="portable" />
      <input name="industrial" />
      <input name="automotive" />
    </form>
    <script id="page-payload" type="application/json">${JSON.stringify(payload)}</script>
  `
}

let assignSpy
let scheme
let member

beforeEach(() => {
  globalThis.localStorage.clear()
  storage.seedDemoData()
  scheme = storage.listSchemes()[0]
  storage.setCurrentSchemeId(scheme.id)
  member = storage.saveSchemeMember(
    createSchemeMember({
      schemeId: scheme.id,
      producerBprn: 'BPRN-EA-2026-000099',
      companyName: 'Test & Producer Ltd',
      compliancePeriod: '2026'
    })
  )
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

describe('runQuarterlyStep persist (scheme-level)', () => {
  test('declaration patch sets status=submitted and submittedOn', () => {
    storage.initQuarterlyMemberData(scheme.id, '2026', 'Q1')

    buildDom({
      view: 'quarterly',
      step: 'declaration',
      quarter: 'Q1',
      compliancePeriodYear: '2026',
      target: 'persist',
      patch: { status: 'submitted', submittedOn: '2026-05-01T00:00:00Z' },
      next: '/compliance-scheme/quarterly/Q1/confirmation'
    })

    runQuarterlyStep(document, globalThis.location)

    const submission = storage.findQuarterlySubmission(scheme.id, '2026', 'Q1')
    expect(submission.status).toBe('submitted')
    expect(submission.submittedOn).toBe('2026-05-01T00:00:00Z')
  })

  test('persist without next returns persisted without navigating', () => {
    buildDom({
      view: 'quarterly',
      step: 'declaration',
      quarter: 'Q1',
      compliancePeriodYear: '2026',
      target: 'persist',
      patch: { status: 'submitted' },
      next: null
    })
    expect(runQuarterlyStep(document, globalThis.location)).toBe('persisted')
    expect(assignSpy).not.toHaveBeenCalled()
  })
})

describe('runQuarterlyStep member persist', () => {
  test('persists market data for a member and navigates to waste-data', () => {
    storage.initQuarterlyMemberData(scheme.id, '2026', 'Q1')

    buildDom({
      view: 'quarterly-member',
      quarter: 'Q1',
      memberId: member.id,
      dataType: 'market-data',
      compliancePeriodYear: '2026',
      target: 'persist',
      patch: {
        marketData: { portable: '1', industrial: '2', automotive: '3' }
      },
      next: '/compliance-scheme/quarterly/Q1/member-list'
    })

    expect(runQuarterlyStep(document, globalThis.location)).toBe('navigated')

    const submission = storage.findQuarterlySubmission(scheme.id, '2026', 'Q1')
    const entry = submission.memberData.find((m) => m.memberId === member.id)
    expect(entry.marketData).toEqual({
      portable: '1',
      industrial: '2',
      automotive: '3'
    })
  })

  test('persists waste data for a member and navigates to member-list', () => {
    storage.initQuarterlyMemberData(scheme.id, '2026', 'Q1')

    buildDom({
      view: 'quarterly-member',
      quarter: 'Q1',
      memberId: member.id,
      dataType: 'waste-data',
      compliancePeriodYear: '2026',
      target: 'persist',
      patch: {
        wasteData: { portable: '0.5', industrial: '0.25', automotive: '0.125' }
      },
      next: '/compliance-scheme/quarterly/Q1/member-list'
    })

    expect(runQuarterlyStep(document, globalThis.location)).toBe('navigated')

    const submission = storage.findQuarterlySubmission(scheme.id, '2026', 'Q1')
    const entry = submission.memberData.find((m) => m.memberId === member.id)
    expect(entry.wasteData).toEqual({
      portable: '0.5',
      industrial: '0.25',
      automotive: '0.125'
    })
  })
})

describe('runQuarterlyStep hydrate', () => {
  test('member-list initialises member data and renders rows', () => {
    buildMemberListDom({
      view: 'quarterly',
      step: 'member-list',
      quarter: 'Q1',
      compliancePeriodYear: '2026',
      target: 'hydrate',
      next: '/compliance-scheme/quarterly/Q1/check-answers',
      memberStepUrlTemplate:
        '/compliance-scheme/quarterly/Q1/member/{memberId}/{dataType}'
    })

    expect(runQuarterlyStep(document, globalThis.location)).toBe('hydrated')
    const body = document.querySelector(
      '[data-testid="quarterly-member-list-body"]'
    )
    expect(body.innerHTML).toContain('Test &amp; Producer Ltd')
    expect(body.innerHTML).toContain('BPRN-EA-2026-000099')
    expect(body.innerHTML).toContain('Not entered')
  })

  test('member-list shows entered tags after data is entered', () => {
    storage.initQuarterlyMemberData(scheme.id, '2026', 'Q1')
    storage.upsertQuarterlyMemberTonnage(scheme.id, '2026', 'Q1', member.id, {
      marketData: { portable: '1', industrial: '2', automotive: '3' },
      wasteData: { portable: '0.5', industrial: '0', automotive: '0' }
    })

    buildMemberListDom({
      view: 'quarterly',
      step: 'member-list',
      quarter: 'Q1',
      compliancePeriodYear: '2026',
      target: 'hydrate',
      next: '/compliance-scheme/quarterly/Q1/check-answers',
      memberStepUrlTemplate:
        '/compliance-scheme/quarterly/Q1/member/{memberId}/{dataType}'
    })

    runQuarterlyStep(document, globalThis.location)
    const body = document.querySelector(
      '[data-testid="quarterly-member-list-body"]'
    )
    expect(body.innerHTML).toContain('Edit')
    expect(body.innerHTML).not.toContain('Not entered')
  })

  test('member-list shows empty message when no members', () => {
    storage.saveSchemeMember({ ...member, leftOn: new Date().toISOString() })

    buildMemberListDom({
      view: 'quarterly',
      step: 'member-list',
      quarter: 'Q1',
      compliancePeriodYear: '2026',
      target: 'hydrate',
      next: '/compliance-scheme/quarterly/Q1/check-answers',
      memberStepUrlTemplate:
        '/compliance-scheme/quarterly/Q1/member/{memberId}/{dataType}'
    })

    runQuarterlyStep(document, globalThis.location)
    const empty = document.querySelector(
      '[data-testid="quarterly-member-list-empty"]'
    )
    expect(empty.hidden).toBe(false)
  })

  test('member hydrate populates form with existing data', () => {
    storage.initQuarterlyMemberData(scheme.id, '2026', 'Q1')
    storage.upsertQuarterlyMemberTonnage(scheme.id, '2026', 'Q1', member.id, {
      marketData: { portable: '5', industrial: '6', automotive: '7' }
    })

    buildMemberFormDom({
      view: 'quarterly-member',
      quarter: 'Q1',
      memberId: member.id,
      dataType: 'market-data',
      compliancePeriodYear: '2026',
      target: 'hydrate'
    })

    expect(runQuarterlyStep(document, globalThis.location)).toBe('hydrated')
    expect(document.querySelector('input[name="portable"]').value).toBe('5')
    expect(document.querySelector('input[name="industrial"]').value).toBe('6')
    expect(document.querySelector('input[name="automotive"]').value).toBe('7')
  })

  test('member hydrate populates form with existing waste data', () => {
    storage.initQuarterlyMemberData(scheme.id, '2026', 'Q1')
    storage.upsertQuarterlyMemberTonnage(scheme.id, '2026', 'Q1', member.id, {
      wasteData: { portable: '0.1', industrial: '0.2', automotive: '0.3' }
    })

    buildMemberFormDom({
      view: 'quarterly-member',
      quarter: 'Q1',
      memberId: member.id,
      dataType: 'waste-data',
      compliancePeriodYear: '2026',
      target: 'hydrate'
    })

    runQuarterlyStep(document, globalThis.location)
    expect(document.querySelector('input[name="portable"]').value).toBe('0.1')
  })

  test('member hydrate shows member name and BPRN', () => {
    storage.initQuarterlyMemberData(scheme.id, '2026', 'Q1')

    buildMemberFormDom({
      view: 'quarterly-member',
      quarter: 'Q1',
      memberId: member.id,
      dataType: 'market-data',
      compliancePeriodYear: '2026',
      target: 'hydrate'
    })

    runQuarterlyStep(document, globalThis.location)
    const nameEl = document.querySelector(
      '[data-testid="quarterly-member-name"]'
    )
    expect(nameEl.textContent).toContain('Test & Producer Ltd')
    expect(nameEl.textContent).toContain('BPRN-EA-2026-000099')
  })

  test('check-answers shows em-dashes for members with no data', () => {
    storage.initQuarterlyMemberData(scheme.id, '2026', 'Q1')

    buildCheckDom({
      view: 'quarterly',
      step: 'check-answers',
      quarter: 'Q1',
      compliancePeriodYear: '2026',
      target: 'hydrate',
      memberStepUrlTemplate:
        '/compliance-scheme/quarterly/Q1/member/{memberId}/{dataType}'
    })

    runQuarterlyStep(document, globalThis.location)
    const body = document.querySelector('[data-testid="quarterly-check-body"]')
    expect(body.innerHTML).toContain('—')
    expect(
      document.querySelector(
        '[data-testid="quarterly-check-total-market-portable"]'
      ).textContent
    ).toBe('0.000')
  })

  test('check-answers populates per-member rows and totals', () => {
    storage.initQuarterlyMemberData(scheme.id, '2026', 'Q1')
    storage.upsertQuarterlyMemberTonnage(scheme.id, '2026', 'Q1', member.id, {
      marketData: { portable: '1', industrial: '2', automotive: '3' },
      wasteData: { portable: '0.1', industrial: '0.2', automotive: '0.3' }
    })

    buildCheckDom({
      view: 'quarterly',
      step: 'check-answers',
      quarter: 'Q1',
      compliancePeriodYear: '2026',
      target: 'hydrate',
      memberStepUrlTemplate:
        '/compliance-scheme/quarterly/Q1/member/{memberId}/{dataType}'
    })

    expect(runQuarterlyStep(document, globalThis.location)).toBe('hydrated')
    const body = document.querySelector('[data-testid="quarterly-check-body"]')
    expect(body.innerHTML).toContain('Test &amp; Producer Ltd')
    expect(body.innerHTML).toContain('1')
    expect(
      document.querySelector(
        '[data-testid="quarterly-check-total-market-portable"]'
      ).textContent
    ).toBe('1.000')
    expect(
      document.querySelector(
        '[data-testid="quarterly-check-total-waste-automotive"]'
      ).textContent
    ).toBe('0.300')
  })

  test('check-answers handles missing submission gracefully', () => {
    buildCheckDom({
      view: 'quarterly',
      step: 'check-answers',
      quarter: 'Q1',
      compliancePeriodYear: '2026',
      target: 'hydrate',
      memberStepUrlTemplate:
        '/compliance-scheme/quarterly/Q1/member/{memberId}/{dataType}'
    })
    expect(runQuarterlyStep(document, globalThis.location)).toBe('hydrated')
    const body = document.querySelector('[data-testid="quarterly-check-body"]')
    expect(body.innerHTML).toBe('')
  })

  test('member hydrate is a no-op when member not found', () => {
    storage.initQuarterlyMemberData(scheme.id, '2026', 'Q1')

    buildMemberFormDom({
      view: 'quarterly-member',
      quarter: 'Q1',
      memberId: 'nonexistent',
      dataType: 'market-data',
      compliancePeriodYear: '2026',
      target: 'hydrate'
    })

    expect(runQuarterlyStep(document, globalThis.location)).toBe('hydrated')
    expect(document.querySelector('input[name="portable"]').value).toBe('')
  })

  test('member hydrate is a no-op when no submission exists', () => {
    buildMemberFormDom({
      view: 'quarterly-member',
      quarter: 'Q1',
      memberId: member.id,
      dataType: 'waste-data',
      compliancePeriodYear: '2026',
      target: 'hydrate'
    })
    expect(runQuarterlyStep(document, globalThis.location)).toBe('hydrated')
  })

  test('declaration hydrate marks the checkbox when status=submitted', () => {
    storage.upsertQuarterlySubmission(scheme.id, '2026', 'Q1', {
      status: 'submitted'
    })
    buildDom(
      {
        view: 'quarterly',
        step: 'declaration',
        quarter: 'Q1',
        compliancePeriodYear: '2026',
        target: 'hydrate'
      },
      '<form><input type="checkbox" name="declarationAccepted" value="yes" /></form>'
    )
    runQuarterlyStep(document, globalThis.location)
    expect(
      document.querySelector('input[name="declarationAccepted"]').checked
    ).toBe(true)
  })

  test('declaration hydrate leaves checkbox unchecked when status not submitted', () => {
    buildDom(
      {
        view: 'quarterly',
        step: 'declaration',
        quarter: 'Q1',
        compliancePeriodYear: '2026',
        target: 'hydrate'
      },
      '<form><input type="checkbox" name="declarationAccepted" value="yes" /></form>'
    )
    runQuarterlyStep(document, globalThis.location)
    expect(
      document.querySelector('input[name="declarationAccepted"]').checked
    ).toBe(false)
  })

  test('confirmation step needs no form or summary', () => {
    buildDom({
      view: 'quarterly',
      step: 'confirmation',
      quarter: 'Q1',
      compliancePeriodYear: '2026',
      target: 'hydrate'
    })
    expect(runQuarterlyStep(document, globalThis.location)).toBe('hydrated')
  })

  test('redirects to the sign-in picker when no current scheme is selected', () => {
    storage.clearCurrentSchemeId()
    buildDom({
      view: 'quarterly',
      step: 'member-list',
      quarter: 'Q1',
      compliancePeriodYear: '2026',
      target: 'hydrate'
    })
    expect(runQuarterlyStep(document, globalThis.location)).toBe(
      'redirected-to-sign-in'
    )
    expect(assignSpy).toHaveBeenCalledWith('/compliance-scheme/sign-in')
  })
})
