// @vitest-environment jsdom
import { beforeEach, afterEach, describe, expect, test, vi } from 'vitest'

import { storage } from '../../storage-adapter.js'
import { runPrototypeSubmissionStep } from './wizard-step.js'

const setBody = (payload, html = '') => {
  document.body.innerHTML = `
    <script id="page-payload" type="application/json">${JSON.stringify(payload)}</script>
    ${html}
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

describe('runPrototypeSubmissionStep', () => {
  test('does nothing without a page payload', () => {
    document.body.innerHTML = '<form></form>'
    expect(runPrototypeSubmissionStep(document, fakeLocation())).toBe(
      'no-payload'
    )
  })

  test('persists registration-target fields into the registration draft', () => {
    setBody({
      step: 'tonnage',
      target: 'registration',
      savedFields: { tonnageBand: 'upTo1Tonne' },
      nextStep: '/next'
    })
    const loc = fakeLocation()

    expect(runPrototypeSubmissionStep(document, loc)).toBe('navigated')
    expect(storage.getPrototypeRegistration().tonnageBand).toBe('upTo1Tonne')
    expect(storage.getPrototypeSubmission()).toEqual({})
    expect(loc.assign).toHaveBeenCalledWith('/next')
  })

  test('persists submission-target fields into the submission draft', () => {
    setBody({
      step: 'brandQuestion',
      target: 'submission',
      savedFields: { hasBrand: 'yes' },
      nextStep: null
    })
    const loc = fakeLocation()

    expect(runPrototypeSubmissionStep(document, loc)).toBe('persisted')
    expect(storage.getPrototypeSubmission().hasBrand).toBe('yes')
    expect(loc.assign).not.toHaveBeenCalled()
  })

  test('submits the submission on the check data submit payload', () => {
    setBody({
      step: 'checkData',
      target: 'submit',
      savedFields: { declFirstName: 'Scarlet' },
      nextStep: '/pay'
    })
    const loc = fakeLocation()

    expect(runPrototypeSubmissionStep(document, loc)).toBe('navigated')
    const draft = storage.getPrototypeSubmission()
    expect(draft.declFirstName).toBe('Scarlet')
    expect(draft.status).toBe('submitted')
    expect(loc.assign).toHaveBeenCalledWith('/pay')
  })

  test('completes payment on the payment payload', () => {
    setBody({
      step: 'payment',
      target: 'payment',
      savedFields: null,
      nextStep: '/done'
    })
    const loc = fakeLocation()

    expect(runPrototypeSubmissionStep(document, loc)).toBe('navigated')
    const draft = storage.getPrototypeSubmission()
    expect(draft.status).toBe('paid')
    expect(draft.paymentReference).toMatch(/^S185756-/)
  })

  test('hydrates forms from both drafts on GET', () => {
    storage.savePrototypeRegistration({ tonnageBand: 'upTo1Tonne' })
    storage.savePrototypeSubmission({ unit: 'tonnes' })
    setBody(
      { step: 'tonnage', target: 'hydrate', skipHydration: false },
      '<form><input type="radio" name="tonnageBand" value="upTo1Tonne"></form>'
    )

    expect(runPrototypeSubmissionStep(document, fakeLocation())).toBe(
      'hydrated'
    )
    expect(document.querySelector('[name="tonnageBand"]').checked).toBe(true)
  })

  test('skips hydration after a validation failure', () => {
    storage.savePrototypeRegistration({ tonnageBand: 'upTo1Tonne' })
    setBody(
      { step: 'tonnage', target: 'hydrate', skipHydration: true },
      '<form><input type="radio" name="tonnageBand" value="upTo1Tonne"></form>'
    )

    expect(runPrototypeSubmissionStep(document, fakeLocation())).toBe(
      'preserved'
    )
    expect(document.querySelector('[name="tonnageBand"]').checked).toBe(false)
  })

  test('fills the account company name from the registration draft', () => {
    storage.savePrototypeRegistration({
      organisationName: 'Demo Power Cells Ltd'
    })
    setBody(
      { step: 'account', target: 'hydrate', skipHydration: false },
      '<h1 data-testid="account-company-name">Default</h1>'
    )

    runPrototypeSubmissionStep(document, fakeLocation())
    expect(
      document.querySelector('[data-testid="account-company-name"]').textContent
    ).toBe('Demo Power Cells Ltd')
  })

  test('wires the brand add step without generic hydration', () => {
    storage.savePrototypeSubmission({ brandNames: ['Bunny Batteries'] })
    setBody(
      { step: 'brandAdd', target: 'hydrate', skipHydration: false },
      `<form>
        <div data-testid="brand-add-fields">
          <input name="brandNames" data-testid="brand-add-input">
        </div>
        <a href="#" data-testid="brand-add-another"></a>
      </form>`
    )

    runPrototypeSubmissionStep(document, fakeLocation())
    expect(
      document.querySelector('[data-testid="brand-add-input"]').value
    ).toBe('Bunny Batteries')
  })

  test('renders the check data summary on that step', () => {
    storage.savePrototypeRegistration({ isPortable: true })
    storage.savePrototypeSubmission({
      hasBrand: 'no',
      unit: 'kilograms',
      weightLeadAcid: '45',
      weightNickelCadmium: '10',
      weightOther: '50'
    })
    setBody(
      { step: 'checkData', target: 'hydrate', skipHydration: false },
      [
        'batteryTypes',
        'brandNames',
        'leadAcid',
        'nickelCadmium',
        'other',
        'total'
      ]
        .map((rowKey) => `<dd data-testid="check-data-value-${rowKey}"></dd>`)
        .join('')
    )

    runPrototypeSubmissionStep(document, fakeLocation())
    expect(
      document.querySelector('[data-testid="check-data-value-total"]')
        .textContent
    ).toBe('105kg')
    expect(
      document.querySelector('[data-testid="check-data-value-brandNames"]')
        .textContent
    ).toBe('None')
  })

  test('renders the registration answers on the check registration step', () => {
    storage.savePrototypeRegistration({
      isPortable: true,
      schemeMembership: 'no'
    })
    setBody(
      { step: 'checkRegistration', target: 'hydrate', skipHydration: false },
      `<dl>${[
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
        .join('')}</dl>`
    )

    runPrototypeSubmissionStep(document, fakeLocation())
    expect(
      document.querySelector('[data-testid="check-answers-value-batteryTypes"]')
        .textContent
    ).toBe('Portable batteries')
  })

  test('renders the brand confirm list on that step', () => {
    storage.savePrototypeSubmission({ brandNames: ['Bunny Batteries'] })
    setBody(
      { step: 'brandConfirm', target: 'hydrate', skipHydration: false },
      `<p data-testid="brand-confirm-check" hidden></p>
       <p data-testid="brand-confirm-empty" hidden></p>
       <dl data-testid="brand-confirm-list"></dl>`
    )

    runPrototypeSubmissionStep(document, fakeLocation())
    expect(
      document.querySelectorAll('[data-testid="brand-confirm-remove"]').length
    ).toBe(1)
  })

  test('wires the running total on the data step', () => {
    setBody(
      { step: 'data', target: 'hydrate', skipHydration: false },
      `<form>
        <input type="radio" name="unit" value="kilograms" checked>
        <input name="weightLeadAcid" value="5">
        <input name="weightNickelCadmium">
        <input name="weightOther">
        <span data-testid="data-total"></span>
      </form>`
    )

    runPrototypeSubmissionStep(document, fakeLocation())
    expect(
      document.querySelector('[data-testid="data-total"]').textContent
    ).toBe('5kg')
  })

  test('creates the payment reference on the payment step', () => {
    setBody(
      { step: 'payment', target: 'hydrate', skipHydration: false },
      '<dd data-testid="payment-reference"></dd>'
    )

    runPrototypeSubmissionStep(document, fakeLocation())
    expect(
      document.querySelector('[data-testid="payment-reference"]').textContent
    ).toMatch(/^S185756-/)
  })

  test('renders the payment reference on the confirmation step', () => {
    storage.savePrototypeSubmission({
      paymentReference: 'S185756-20260901120000'
    })
    setBody(
      { step: 'paymentConfirmed', target: 'hydrate', skipHydration: false },
      '<strong data-testid="payment-confirmed-reference"></strong>'
    )

    runPrototypeSubmissionStep(document, fakeLocation())
    expect(
      document.querySelector('[data-testid="payment-confirmed-reference"]')
        .textContent
    ).toBe('S185756-20260901120000')
  })
})
