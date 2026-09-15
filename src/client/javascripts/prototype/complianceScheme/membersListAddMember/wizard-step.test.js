// @vitest-environment jsdom
import { beforeEach, afterEach, describe, expect, test, vi } from 'vitest'

import { storage } from '../../../storage-adapter.js'
import { runPrototypeMembersListAddMemberStep } from './wizard-step.js'

const setBody = (payload, formHtml = '') => {
  document.body.innerHTML = `
    <script id="page-payload" type="application/json">${JSON.stringify(payload)}</script>
    ${formHtml}
  `
}

const fakeLocation = () => ({ assign: vi.fn() })

beforeEach(() => {
  globalThis.localStorage.clear()
})

afterEach(() => {
  globalThis.localStorage.clear()
  document.body.innerHTML = ''
})

describe('runPrototypeMembersListAddMemberStep', () => {
  test('does nothing without a page payload', () => {
    document.body.innerHTML = '<form></form>'
    expect(runPrototypeMembersListAddMemberStep(document, fakeLocation())).toBe(
      'no-payload'
    )
  })

  test('persists saved fields and navigates to the next step', () => {
    setBody({
      step: 'organisationType',
      target: 'draft',
      savedFields: { organisationType: 'soleTrader' },
      nextStep: '/next'
    })
    const loc = fakeLocation()

    expect(runPrototypeMembersListAddMemberStep(document, loc)).toBe(
      'navigated'
    )
    expect(storage.getPrototypeMembersListAddMember().organisationType).toBe(
      'soleTrader'
    )
    expect(loc.assign).toHaveBeenCalledWith('/next')
  })

  test('persists saved fields without navigating when there is no next step', () => {
    setBody({
      step: 'organisationType',
      target: 'draft',
      savedFields: { organisationType: 'soleTrader' },
      nextStep: null
    })
    const loc = fakeLocation()

    expect(runPrototypeMembersListAddMemberStep(document, loc)).toBe(
      'persisted'
    )
    expect(loc.assign).not.toHaveBeenCalled()
  })

  test('hydrates the form from the stored draft on GET', () => {
    storage.savePrototypeMembersListAddMember({
      organisationType: 'soleTrader'
    })
    setBody(
      { step: 'organisationType', target: 'hydrate', skipHydration: false },
      '<form><input type="radio" name="organisationType" value="soleTrader"></form>'
    )

    expect(runPrototypeMembersListAddMemberStep(document, fakeLocation())).toBe(
      'hydrated'
    )
    expect(document.querySelector('[name="organisationType"]').checked).toBe(
      true
    )
  })

  test('skips hydration after a validation failure', () => {
    storage.savePrototypeMembersListAddMember({
      organisationType: 'soleTrader'
    })
    setBody(
      { step: 'organisationType', target: 'hydrate', skipHydration: true },
      '<form><input type="radio" name="organisationType" value="soleTrader"></form>'
    )

    expect(runPrototypeMembersListAddMemberStep(document, fakeLocation())).toBe(
      'preserved'
    )
    expect(document.querySelector('[name="organisationType"]').checked).toBe(
      false
    )
  })

  test('wires the companies house search on that step', () => {
    setBody(
      { step: 'companiesHouse', target: 'hydrate', skipHydration: false },
      `<form>
        <input data-testid="companies-house-name">
        <input data-testid="companies-house-number" value="12345678">
        <button data-testid="companies-house-search" type="button"></button>
        <div data-testid="companies-house-result" hidden>
          <p data-testid="companies-house-result-summary"></p>
        </div>
        <p data-testid="companies-house-not-found" hidden></p>
        <input type="hidden" data-testid="companies-house-address-line1" name="addressLine1">
        <input type="hidden" data-testid="companies-house-address-town" name="addressTown">
        <input type="hidden" data-testid="companies-house-address-postcode" name="addressPostcode">
      </form>`
    )

    runPrototypeMembersListAddMemberStep(document, fakeLocation())
    document.querySelector('[data-testid="companies-house-search"]').click()

    expect(
      document.querySelector('[data-testid="companies-house-name"]').value
    ).toBe('Demo Power Cells Ltd')
  })

  test('wires the address lookup on address steps', () => {
    setBody(
      { step: 'soleTraderDetails', target: 'hydrate', skipHydration: false },
      `<form>
        <button data-testid="details-find-address" type="button"></button>
        <input data-testid="details-postcode" value="LS1 4DP">
        <select data-testid="details-address-select"></select>
        <div data-testid="details-address-select-wrapper" hidden></div>
        <a data-testid="details-manual-link" href="#"></a>
        <div data-testid="details-manual-address" hidden></div>
        <input type="hidden" data-testid="details-address-line1" name="addressLine1">
        <input type="hidden" data-testid="details-address-town" name="addressTown">
      </form>`
    )

    runPrototypeMembersListAddMemberStep(document, fakeLocation())
    document.querySelector('[data-testid="details-find-address"]').click()

    expect(
      document.querySelector('[data-testid="details-address-select-wrapper"]')
        .hidden
    ).toBe(false)
  })

  test('renders the check answers rows from the draft', () => {
    storage.savePrototypeMembersListAddMember({
      organisationType: 'limitedCompany',
      organisationName: 'Battery Producer Ltd'
    })
    setBody(
      { step: 'checkAnswers', target: 'hydrate', skipHydration: false },
      `<dl>
        ${[
          'organisationType',
          'organisationName',
          'organisationAddress',
          'legalNoticesAddress',
          'appropriatePersonName',
          'appropriatePersonEmail',
          'batteryTypes',
          'tonnage',
          'dateJoined'
        ]
          .map(
            (rowKey) => `<dd data-testid="check-answers-value-${rowKey}"></dd>`
          )
          .join('')}
        <a data-testid="check-answers-change-organisationName" href="#"></a>
        <a data-testid="check-answers-change-organisationAddress" href="#"></a>
      </dl>`
    )

    runPrototypeMembersListAddMemberStep(document, fakeLocation())

    expect(
      document.querySelector(
        '[data-testid="check-answers-value-organisationName"]'
      ).textContent
    ).toBe('Battery Producer Ltd')
  })
})
