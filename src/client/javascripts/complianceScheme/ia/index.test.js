// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { runIaStep } from './index.js'
import { storage, createSchemeMember } from '../../storage-adapter.js'

const buildDom = (payload, formHtml = '') => {
  document.body.innerHTML = `
    ${formHtml}
    <script id="page-payload" type="application/json">${JSON.stringify(payload)}</script>
  `
}

const buildMemberListDom = (payload) => {
  document.body.innerHTML = `
    <table><tbody data-testid="ia-member-list-body"></tbody></table>
    <p data-testid="ia-member-list-empty" hidden></p>
    <script id="page-payload" type="application/json">${JSON.stringify(payload)}</script>
  `
}

const buildCheckDom = (payload) => {
  document.body.innerHTML = `
    <table>
      <tbody data-testid="ia-check-body"></tbody>
      <tfoot>
        <tr>
          <td data-testid="ia-check-total-placed-industrial"></td>
          <td data-testid="ia-check-total-placed-automotive"></td>
          <td data-testid="ia-check-total-exported-industrial"></td>
          <td data-testid="ia-check-total-exported-automotive"></td>
          <td data-testid="ia-check-total-taken-back-industrial"></td>
          <td data-testid="ia-check-total-taken-back-automotive"></td>
          <td data-testid="ia-check-total-delivered-industrial"></td>
          <td data-testid="ia-check-total-delivered-automotive"></td>
        </tr>
      </tfoot>
    </table>
    <script id="page-payload" type="application/json">${JSON.stringify(payload)}</script>
  `
}

const buildMemberFormDom = (payload) => {
  document.body.innerHTML = `
    <p data-testid="ia-member-name"></p>
    <form>
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
      producerBprn: 'BPRN-EA-2026-000098',
      companyName: 'IA Test & Producer Ltd',
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

describe('runIaStep persist (scheme-level)', () => {
  test('declaration patch sets status=submitted', () => {
    storage.initIaMemberData(scheme.id, '2026')

    buildDom({
      view: 'ia',
      step: 'declaration',
      compliancePeriodYear: '2026',
      target: 'persist',
      patch: { status: 'submitted' },
      next: '/compliance-scheme/industrial-automotive/confirmation'
    })

    runIaStep(document, globalThis.location)
    const submission = storage.findIaSubmission(scheme.id, '2026')
    expect(submission.status).toBe('submitted')
  })

  test('persists without next returns persisted', () => {
    buildDom({
      view: 'ia',
      step: 'declaration',
      compliancePeriodYear: '2026',
      target: 'persist',
      patch: { status: 'submitted' },
      next: null
    })
    expect(runIaStep(document, globalThis.location)).toBe('persisted')
    expect(assignSpy).not.toHaveBeenCalled()
  })
})

describe('runIaStep member persist', () => {
  test('persists placed data without next returns persisted', () => {
    storage.initIaMemberData(scheme.id, '2026')

    buildDom({
      view: 'ia-member',
      step: 'placed',
      memberId: member.id,
      compliancePeriodYear: '2026',
      target: 'persist',
      patch: { placed: { industrial: '10', automotive: '5' } },
      next: null
    })

    expect(runIaStep(document, globalThis.location)).toBe('persisted')
    expect(assignSpy).not.toHaveBeenCalled()
  })

  test('persists placed data for a member and navigates', () => {
    storage.initIaMemberData(scheme.id, '2026')

    buildDom({
      view: 'ia-member',
      step: 'placed',
      memberId: member.id,
      compliancePeriodYear: '2026',
      target: 'persist',
      patch: { placed: { industrial: '10', automotive: '5' } },
      next: `/compliance-scheme/industrial-automotive/member/${member.id}/exported`
    })

    expect(runIaStep(document, globalThis.location)).toBe('navigated')

    const submission = storage.findIaSubmission(scheme.id, '2026')
    const entry = submission.memberData.find((m) => m.memberId === member.id)
    expect(entry.placed).toEqual({ industrial: '10', automotive: '5' })
  })
})

describe('runIaStep hydrate', () => {
  test('member-list initialises member data and renders rows', () => {
    buildMemberListDom({
      view: 'ia',
      step: 'member-list',
      compliancePeriodYear: '2026',
      target: 'hydrate',
      next: '/compliance-scheme/industrial-automotive/check-answers',
      memberStepUrlTemplate:
        '/compliance-scheme/industrial-automotive/member/{memberId}/placed'
    })

    expect(runIaStep(document, globalThis.location)).toBe('hydrated')
    const body = document.querySelector('[data-testid="ia-member-list-body"]')
    expect(body.innerHTML).toContain('IA Test &amp; Producer Ltd')
    expect(body.innerHTML).toContain('BPRN-EA-2026-000098')
    expect(body.innerHTML).toContain('Not entered')
  })

  test('member-list shows entered tags after data is complete', () => {
    storage.initIaMemberData(scheme.id, '2026')
    storage.upsertIaMemberTonnage(scheme.id, '2026', member.id, {
      placed: { industrial: '1', automotive: '2' },
      exported: { industrial: '0', automotive: '0' },
      takenBack: { industrial: '0', automotive: '0' },
      delivered: { industrial: '0', automotive: '0' }
    })

    buildMemberListDom({
      view: 'ia',
      step: 'member-list',
      compliancePeriodYear: '2026',
      target: 'hydrate',
      next: '/compliance-scheme/industrial-automotive/check-answers',
      memberStepUrlTemplate:
        '/compliance-scheme/industrial-automotive/member/{memberId}/placed'
    })

    runIaStep(document, globalThis.location)
    const body = document.querySelector('[data-testid="ia-member-list-body"]')
    expect(body.innerHTML).toContain('Edit')
    expect(body.innerHTML).not.toContain('Not entered')
  })

  test('member-list shows empty message when no members', () => {
    storage.saveSchemeMember({ ...member, leftOn: new Date().toISOString() })

    buildMemberListDom({
      view: 'ia',
      step: 'member-list',
      compliancePeriodYear: '2026',
      target: 'hydrate',
      next: '/compliance-scheme/industrial-automotive/check-answers',
      memberStepUrlTemplate:
        '/compliance-scheme/industrial-automotive/member/{memberId}/placed'
    })

    runIaStep(document, globalThis.location)
    const empty = document.querySelector('[data-testid="ia-member-list-empty"]')
    expect(empty.hidden).toBe(false)
  })

  test('member hydrate populates form with existing data', () => {
    storage.initIaMemberData(scheme.id, '2026')
    storage.upsertIaMemberTonnage(scheme.id, '2026', member.id, {
      placed: { industrial: '7', automotive: '8' }
    })

    buildMemberFormDom({
      view: 'ia-member',
      step: 'placed',
      memberId: member.id,
      compliancePeriodYear: '2026',
      target: 'hydrate'
    })

    expect(runIaStep(document, globalThis.location)).toBe('hydrated')
    expect(document.querySelector('input[name="industrial"]').value).toBe('7')
    expect(document.querySelector('input[name="automotive"]').value).toBe('8')
  })

  test('member hydrate shows member name and BPRN', () => {
    storage.initIaMemberData(scheme.id, '2026')

    buildMemberFormDom({
      view: 'ia-member',
      step: 'placed',
      memberId: member.id,
      compliancePeriodYear: '2026',
      target: 'hydrate'
    })

    runIaStep(document, globalThis.location)
    const nameEl = document.querySelector('[data-testid="ia-member-name"]')
    expect(nameEl.textContent).toContain('IA Test & Producer Ltd')
    expect(nameEl.textContent).toContain('BPRN-EA-2026-000098')
  })

  test('check-answers shows em-dashes for members with no data', () => {
    storage.initIaMemberData(scheme.id, '2026')

    buildCheckDom({
      view: 'ia',
      step: 'check-answers',
      compliancePeriodYear: '2026',
      target: 'hydrate',
      memberStepUrlTemplate:
        '/compliance-scheme/industrial-automotive/member/{memberId}/placed'
    })

    runIaStep(document, globalThis.location)
    const body = document.querySelector('[data-testid="ia-check-body"]')
    expect(body.innerHTML).toContain('—')
    expect(
      document.querySelector('[data-testid="ia-check-total-placed-industrial"]')
        .textContent
    ).toBe('0.000')
  })

  test('check-answers populates per-member rows and totals', () => {
    storage.initIaMemberData(scheme.id, '2026')
    storage.upsertIaMemberTonnage(scheme.id, '2026', member.id, {
      placed: { industrial: '10', automotive: '5' },
      exported: { industrial: '1', automotive: '0.5' },
      takenBack: { industrial: '2', automotive: '1' },
      delivered: { industrial: '3', automotive: '2' }
    })

    buildCheckDom({
      view: 'ia',
      step: 'check-answers',
      compliancePeriodYear: '2026',
      target: 'hydrate',
      memberStepUrlTemplate:
        '/compliance-scheme/industrial-automotive/member/{memberId}/placed'
    })

    expect(runIaStep(document, globalThis.location)).toBe('hydrated')
    const body = document.querySelector('[data-testid="ia-check-body"]')
    expect(body.innerHTML).toContain('IA Test &amp; Producer Ltd')
    expect(
      document.querySelector('[data-testid="ia-check-total-placed-industrial"]')
        .textContent
    ).toBe('10.000')
    expect(
      document.querySelector(
        '[data-testid="ia-check-total-delivered-automotive"]'
      ).textContent
    ).toBe('2.000')
  })

  test('check-answers handles missing submission gracefully', () => {
    buildCheckDom({
      view: 'ia',
      step: 'check-answers',
      compliancePeriodYear: '2026',
      target: 'hydrate',
      memberStepUrlTemplate:
        '/compliance-scheme/industrial-automotive/member/{memberId}/placed'
    })
    expect(runIaStep(document, globalThis.location)).toBe('hydrated')
    const body = document.querySelector('[data-testid="ia-check-body"]')
    expect(body.innerHTML).toBe('')
  })

  test('member hydrate is a no-op when member not found in submission', () => {
    storage.initIaMemberData(scheme.id, '2026')

    buildMemberFormDom({
      view: 'ia-member',
      step: 'placed',
      memberId: 'nonexistent-member',
      compliancePeriodYear: '2026',
      target: 'hydrate'
    })

    expect(runIaStep(document, globalThis.location)).toBe('hydrated')
    expect(document.querySelector('input[name="industrial"]').value).toBe('')
  })

  test('member hydrate is a no-op when no submission exists', () => {
    buildMemberFormDom({
      view: 'ia-member',
      step: 'placed',
      memberId: member.id,
      compliancePeriodYear: '2026',
      target: 'hydrate'
    })
    expect(runIaStep(document, globalThis.location)).toBe('hydrated')
  })

  test('declaration hydrate marks the checkbox when status=submitted', () => {
    storage.upsertIaSubmission(scheme.id, '2026', { status: 'submitted' })
    buildDom(
      {
        view: 'ia',
        step: 'declaration',
        compliancePeriodYear: '2026',
        target: 'hydrate'
      },
      '<form><input type="checkbox" name="declarationAccepted" value="yes" /></form>'
    )
    runIaStep(document, globalThis.location)
    expect(
      document.querySelector('input[name="declarationAccepted"]').checked
    ).toBe(true)
  })

  test('declaration hydrate leaves checkbox unchecked when status not submitted', () => {
    buildDom(
      {
        view: 'ia',
        step: 'declaration',
        compliancePeriodYear: '2026',
        target: 'hydrate'
      },
      '<form><input type="checkbox" name="declarationAccepted" value="yes" /></form>'
    )
    runIaStep(document, globalThis.location)
    expect(
      document.querySelector('input[name="declarationAccepted"]').checked
    ).toBe(false)
  })

  test('confirmation step needs no form or summary', () => {
    buildDom({
      view: 'ia',
      step: 'confirmation',
      compliancePeriodYear: '2026',
      target: 'hydrate'
    })
    expect(runIaStep(document, globalThis.location)).toBe('hydrated')
  })

  test('redirects to the sign-in picker when no current scheme is selected', () => {
    storage.clearCurrentSchemeId()
    buildDom({
      view: 'ia',
      step: 'member-list',
      compliancePeriodYear: '2026',
      target: 'hydrate'
    })
    expect(runIaStep(document, globalThis.location)).toBe(
      'redirected-to-sign-in'
    )
    expect(assignSpy).toHaveBeenCalledWith('/compliance-scheme/sign-in')
  })
})
