// @vitest-environment jsdom
import { afterEach, describe, expect, test } from 'vitest'

import { renderCheckAnswers } from './check-answers.js'

const rowKeys = [
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

const buildRows = () => {
  document.body.innerHTML = `<dl>${rowKeys
    .map(
      (rowKey) =>
        `<div data-testid="check-answers-row-${rowKey}"><dd data-testid="check-answers-value-${rowKey}"></dd></div>`
    )
    .join('')}</dl>`
}

const valueOf = (rowKey) =>
  document.querySelector(`[data-testid="check-answers-value-${rowKey}"]`)
    .textContent

afterEach(() => {
  document.body.innerHTML = ''
})

describe('renderCheckAnswers', () => {
  test('renders every answer including the scheme row for members', () => {
    buildRows()
    renderCheckAnswers(document, {
      isPortable: true,
      isIndustrial: true,
      isAutomotive: true,
      tonnageBand: 'upTo1Tonne',
      organisationType: 'limitedCompany',
      organisationName: 'Battery Producer Ltd',
      addressLine1: '13 Cherry Lane',
      addressTown: 'London',
      addressPostcode: 'N1 1AA',
      appropriatePersonName: 'Scarlet Elfcup',
      appropriatePersonEmail: 'scarlet@batteryproducer.co.uk',
      appropriatePersonRole: 'Director',
      schemeMembership: 'yes',
      schemeId: 'valpak'
    })

    expect(valueOf('batteryTypes')).toBe(
      'Portable batteries, Industrial batteries, Automotive batteries'
    )
    expect(valueOf('tonnage')).toBe('Less than 1 tonne (1000kg)')
    expect(valueOf('organisationType')).toBe('Limited company')
    expect(valueOf('organisationAddress')).toBe(
      '13 Cherry Lane, London, N1 1AA'
    )
    expect(valueOf('schemeMembership')).toBe('Yes')
    expect(valueOf('scheme')).toBe('Valpak Ltd')
    expect(
      document.querySelector('[data-testid="check-answers-row-scheme"]').hidden
    ).toBe(false)
  })

  test('hides the scheme row and dashes missing values for non members', () => {
    buildRows()
    renderCheckAnswers(document, {
      overseasAddress: '1 Strasse, Berlin',
      addressPostcode: 'LS1 4DP',
      schemeMembership: 'no'
    })

    expect(valueOf('batteryTypes')).toBe('—')
    expect(valueOf('organisationName')).toBe('—')
    expect(valueOf('organisationAddress')).toBe('1 Strasse, Berlin, LS1 4DP')
    expect(
      document.querySelector('[data-testid="check-answers-row-scheme"]').hidden
    ).toBe(true)
  })

  test('dashes the scheme name when the member has not chosen a scheme', () => {
    buildRows()
    renderCheckAnswers(document, { schemeMembership: 'yes' })

    expect(valueOf('scheme')).toBe('—')
  })
})
