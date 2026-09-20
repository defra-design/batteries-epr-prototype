// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { storage } from '../../../storage-adapter.js'
import { runPrototypeWasteDataStep } from './wizard-step.js'

const setBody = (payload, extraHtml = '') => {
  document.body.innerHTML = `
    <script id="page-payload" type="application/json">${JSON.stringify(payload)}</script>
    ${extraHtml}
  `
}

const fakeLocation = () => ({ assign: vi.fn() })

const figures = { collectedTonnes: '80.900', deliveredTonnes: '60.250' }

beforeEach(() => {
  globalThis.localStorage.clear()
})

afterEach(() => {
  globalThis.localStorage.clear()
  document.body.innerHTML = ''
})

describe('runPrototypeWasteDataStep', () => {
  test('does nothing without a page payload', () => {
    document.body.innerHTML = ''
    expect(runPrototypeWasteDataStep(document, fakeLocation())).toBe(
      'no-payload'
    )
  })

  test('saves the typed figures and navigates to the next step', () => {
    setBody({
      step: 'enter',
      target: 'save',
      savedFields: figures,
      nextStep: '/check'
    })
    const loc = fakeLocation()

    expect(runPrototypeWasteDataStep(document, loc)).toBe('navigated')
    expect(storage.getPrototypeWasteData()).toMatchObject(figures)
    expect(loc.assign).toHaveBeenCalledWith('/check')
  })

  test('submits the return, hands the delivery to the ABTO and navigates', () => {
    storage.savePrototypeWasteData(figures)
    setBody({
      step: 'declaration',
      target: 'submit',
      submission: {
        schemeName: 'IronWave Compliance',
        submittedBy: 'Priya Shah',
        receivingOperator: 'Halton Battery Processing Ltd'
      },
      nextStep: '/submitted'
    })
    const loc = fakeLocation()

    expect(runPrototypeWasteDataStep(document, loc)).toBe('navigated')
    expect(storage.getPrototypeWasteData().status).toBe('submitted')
    expect(storage.getPrototypeAbtoDeliveries()).toHaveLength(1)
    expect(loc.assign).toHaveBeenCalledWith('/submitted')
  })

  test('hydrates the enter form from the stored draft', () => {
    storage.savePrototypeWasteData(figures)
    setBody(
      { step: 'enter', target: 'hydrate', skipHydration: false },
      '<form><input name="collectedTonnes"><input name="deliveredTonnes"></form>'
    )

    expect(runPrototypeWasteDataStep(document, fakeLocation())).toBe('hydrated')
    expect(document.querySelector('[name="collectedTonnes"]').value).toBe(
      '80.900'
    )
    expect(document.querySelector('[name="deliveredTonnes"]').value).toBe(
      '60.250'
    )
  })

  test('leaves the form alone when the server re-rendered it with errors', () => {
    storage.savePrototypeWasteData(figures)
    setBody(
      { step: 'enter', target: 'hydrate', skipHydration: true },
      '<form><input name="collectedTonnes" value="80.9"></form>'
    )

    runPrototypeWasteDataStep(document, fakeLocation())
    expect(document.querySelector('[name="collectedTonnes"]').value).toBe(
      '80.9'
    )
  })

  test.each(['check', 'declaration'])(
    'sends the user back to enter from %s when no figures are stored',
    (step) => {
      setBody({ step, target: 'hydrate', enterUrl: '/enter' })
      const loc = fakeLocation()

      expect(runPrototypeWasteDataStep(document, loc)).toBe('redirected')
      expect(loc.assign).toHaveBeenCalledWith('/enter')
    }
  )

  test('shows the typed figures on the check screen', () => {
    storage.savePrototypeWasteData(figures)
    setBody(
      { step: 'check', target: 'hydrate', enterUrl: '/enter' },
      '<span data-testid="waste-data-check-collected">—</span><span data-testid="waste-data-check-delivered">—</span>'
    )

    expect(runPrototypeWasteDataStep(document, fakeLocation())).toBe('hydrated')
    expect(
      document.querySelector('[data-testid="waste-data-check-collected"]')
        .textContent
    ).toBe('80.900')
    expect(
      document.querySelector('[data-testid="waste-data-check-delivered"]')
        .textContent
    ).toBe('60.250')
  })

  test('sends the user to the account home from submitted when nothing was submitted', () => {
    setBody({ step: 'submitted', target: 'hydrate', accountHomeUrl: '/home' })
    const loc = fakeLocation()

    expect(runPrototypeWasteDataStep(document, loc)).toBe('redirected')
    expect(loc.assign).toHaveBeenCalledWith('/home')
  })

  test('shows what was submitted on the submitted screen', () => {
    storage.savePrototypeWasteData(figures)
    storage.submitPrototypeWasteData({
      schemeName: 'IronWave Compliance',
      submittedBy: 'Priya Shah',
      receivingOperator: 'Halton Battery Processing Ltd'
    })
    setBody(
      {
        step: 'submitted',
        target: 'hydrate',
        accountHomeUrl: '/home',
        referenceTemplate: 'Your reference number is {reference}.',
        collectedTemplate: '{tonnes} tonnes',
        deliveredTemplate: '{tonnes} tonnes, to Halton Battery Processing Ltd',
        submittedByTemplate: 'Priya Shah, {date}'
      },
      `<p data-testid="waste-data-submitted-reference"></p>
       <span data-testid="waste-data-submitted-collected"></span>
       <span data-testid="waste-data-submitted-delivered"></span>
       <span data-testid="waste-data-submitted-by"></span>`
    )

    expect(runPrototypeWasteDataStep(document, fakeLocation())).toBe('hydrated')

    const text = (id) =>
      document.querySelector(`[data-testid="${id}"]`).textContent
    expect(text('waste-data-submitted-reference')).toBe(
      'Your reference number is WD-2026-Q3-00093.'
    )
    expect(text('waste-data-submitted-collected')).toBe('80.900 tonnes')
    expect(text('waste-data-submitted-delivered')).toBe(
      '60.250 tonnes, to Halton Battery Processing Ltd'
    )
    expect(text('waste-data-submitted-by')).toMatch(
      /^Priya Shah, \d{1,2} [A-Z][a-z]+ 20\d\d$/
    )
  })
})
