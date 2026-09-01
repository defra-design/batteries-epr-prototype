// @vitest-environment jsdom
import { beforeEach, afterEach, describe, expect, test, vi } from 'vitest'

import { storage } from '../../storage-adapter.js'
import { runPrototypeRegistrationStep } from './wizard-step.js'

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

describe('runPrototypeRegistrationStep', () => {
  test('does nothing without a page payload', () => {
    document.body.innerHTML = '<form></form>'
    expect(runPrototypeRegistrationStep(document, fakeLocation())).toBe(
      'no-payload'
    )
  })

  test('persists saved fields and navigates to the next step', () => {
    setBody({
      step: 'tonnage',
      target: 'draft',
      savedFields: { tonnageBand: 'upTo1Tonne' },
      nextStep: '/next'
    })
    const loc = fakeLocation()

    expect(runPrototypeRegistrationStep(document, loc)).toBe('navigated')
    expect(storage.getPrototypeRegistration().tonnageBand).toBe('upTo1Tonne')
    expect(loc.assign).toHaveBeenCalledWith('/next')
  })

  test('persists saved fields without navigating when there is no next step', () => {
    setBody({
      step: 'complete',
      target: 'draft',
      savedFields: { tonnageBand: 'upTo1Tonne' },
      nextStep: null
    })
    const loc = fakeLocation()

    expect(runPrototypeRegistrationStep(document, loc)).toBe('persisted')
    expect(loc.assign).not.toHaveBeenCalled()
  })

  test('submits the registration on the declaration submit payload', () => {
    storage.savePrototypeRegistration({ schemeMembership: 'no' })
    setBody({
      step: 'declaration',
      target: 'submit',
      savedFields: null,
      nextStep: '/complete'
    })
    const loc = fakeLocation()

    expect(runPrototypeRegistrationStep(document, loc)).toBe('navigated')
    expect(storage.getPrototypeRegistration().status).toBe('submitted')
    expect(storage.getPrototypeRegistration().bprn).toBe('BPR00234567')
    expect(loc.assign).toHaveBeenCalledWith('/complete')
  })

  test('hydrates the form from the stored draft on GET', () => {
    storage.savePrototypeRegistration({ organisationName: 'Partner Power' })
    setBody(
      { step: 'partnershipDetails', target: 'hydrate', skipHydration: false },
      `<form>
        <input name="organisationName">
        <button data-testid="details-find-address" type="button"></button>
        <input data-testid="details-postcode">
        <select data-testid="details-address-select"></select>
        <div data-testid="details-address-select-wrapper" hidden></div>
        <a data-testid="details-manual-link" href="#"></a>
        <div data-testid="details-manual-address" hidden></div>
      </form>`
    )

    expect(runPrototypeRegistrationStep(document, fakeLocation())).toBe(
      'hydrated'
    )
    expect(document.querySelector('[name="organisationName"]').value).toBe(
      'Partner Power'
    )
  })

  test('skips hydration after a validation failure', () => {
    storage.savePrototypeRegistration({ tonnageBand: 'upTo1Tonne' })
    setBody(
      { step: 'tonnage', target: 'hydrate', skipHydration: true },
      '<form><input type="radio" name="tonnageBand" value="upTo1Tonne"></form>'
    )

    expect(runPrototypeRegistrationStep(document, fakeLocation())).toBe(
      'preserved'
    )
    expect(document.querySelector('[name="tonnageBand"]').checked).toBe(false)
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

    runPrototypeRegistrationStep(document, fakeLocation())
    document.querySelector('[data-testid="companies-house-search"]').click()

    expect(
      document.querySelector('[data-testid="companies-house-name"]').value
    ).toBe('Demo Power Cells Ltd')
  })

  test('renders the check answers rows from the draft', () => {
    storage.savePrototypeRegistration({
      isPortable: true,
      tonnageBand: 'upTo1Tonne',
      organisationType: 'limitedCompany',
      organisationName: 'Battery Producer Ltd',
      addressLine1: '13 Cherry Lane',
      addressTown: 'London',
      appropriatePersonName: 'Scarlet Elfcup',
      appropriatePersonEmail: 'scarlet@batteryproducer.co.uk',
      appropriatePersonRole: 'Director',
      schemeMembership: 'no'
    })
    setBody(
      { step: 'checkAnswers', target: 'hydrate', skipHydration: false },
      `<dl>
        ${[
          'batteryTypes',
          'tonnage',
          'organisationType',
          'organisationName',
          'organisationAddress',
          'appropriatePersonName',
          'appropriatePersonEmail',
          'appropriatePersonRole',
          'schemeMembership',
          'scheme'
        ]
          .map(
            (rowKey) =>
              `<div data-testid="check-answers-row-${rowKey}"><dd data-testid="check-answers-value-${rowKey}"></dd></div>`
          )
          .join('')}
      </dl>`
    )

    runPrototypeRegistrationStep(document, fakeLocation())

    expect(
      document.querySelector('[data-testid="check-answers-value-batteryTypes"]')
        .textContent
    ).toBe('Portable batteries')
    expect(
      document.querySelector('[data-testid="check-answers-row-scheme"]').hidden
    ).toBe(true)
  })

  test('renders the confirmation panel from the submitted draft', () => {
    storage.savePrototypeRegistration({ schemeMembership: 'no' })
    storage.submitPrototypeRegistration()
    setBody(
      { step: 'complete', target: 'hydrate', skipHydration: false },
      `<div>
        <h1 data-testid="complete-panel-title"></h1>
        <div data-testid="complete-panel-body"><strong data-testid="complete-bprn"></strong></div>
        <span data-testid="complete-email"></span>
        <li data-testid="complete-bprn-bullet"></li>
      </div>`
    )

    runPrototypeRegistrationStep(document, fakeLocation())

    expect(
      document.querySelector('[data-testid="complete-bprn"]').textContent
    ).toBe('BPR00234567')
  })
})
