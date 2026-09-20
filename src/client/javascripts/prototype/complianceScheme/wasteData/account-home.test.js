// @vitest-environment jsdom
import { afterEach, describe, expect, test } from 'vitest'

import { renderAccountHome } from './account-home.js'

const payload = {
  step: 'accountHome',
  quarter: 3,
  submittedStatus: {
    label: 'Submitted',
    colour: 'blue',
    actionText: 'View waste data'
  },
  submittedUrl: '/submitted',
  collectedValueTemplate: '{tonnes} tonnes'
}

const setBody = () => {
  document.body.innerHTML = `
    <strong class="govuk-tag govuk-tag--grey" data-testid="waste-data-quarter-3-status">Not started</strong>
    <a href="/start" data-testid="waste-data-quarter-3-action">Record what you collected<span class="govuk-visually-hidden"> for Q3 2026</span></a>
    <dd data-testid="waste-data-collected-value">Not yet recorded</dd>
  `
}

const text = (testId) =>
  document.querySelector(`[data-testid="${testId}"]`).textContent

afterEach(() => {
  document.body.innerHTML = ''
})

describe('renderAccountHome', () => {
  test('leaves the seeded state alone when nothing has been recorded', () => {
    setBody()
    renderAccountHome(document, {}, payload)

    expect(text('waste-data-collected-value')).toBe('Not yet recorded')
    expect(text('waste-data-quarter-3-status')).toBe('Not started')
  })

  test('shows the collected figure once it has been typed, without changing the status', () => {
    setBody()
    renderAccountHome(document, { collectedTonnes: '80.900' }, payload)

    expect(text('waste-data-collected-value')).toBe('80.900 tonnes')
    expect(text('waste-data-quarter-3-status')).toBe('Not started')
  })

  test('marks the quarter submitted, recolours the tag and repoints the action', () => {
    setBody()
    renderAccountHome(
      document,
      { collectedTonnes: '80.900', status: 'submitted' },
      payload
    )

    const tag = document.querySelector(
      '[data-testid="waste-data-quarter-3-status"]'
    )
    const action = document.querySelector(
      '[data-testid="waste-data-quarter-3-action"]'
    )

    expect(tag.textContent).toBe('Submitted')
    expect(tag.className).toContain('govuk-tag--blue')
    expect(tag.className).not.toContain('govuk-tag--grey')
    expect(action.getAttribute('href')).toBe('/submitted')
    expect(action.firstChild.textContent).toBe('View waste data')
    expect(action.textContent).toContain('for Q3 2026')
  })

  test('does not throw when the page has none of the hooks', () => {
    document.body.innerHTML = ''
    expect(() =>
      renderAccountHome(
        document,
        { status: 'submitted', collectedTonnes: '1.000' },
        payload
      )
    ).not.toThrow()
  })
})
