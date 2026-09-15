// @vitest-environment jsdom
import { afterEach, describe, expect, test } from 'vitest'

import { paths } from '../../../../../config/paths.js'
import { renderCheckAnswers } from './check-answers.js'

const rowKeys = [
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

const buildRows = () => {
  document.body.innerHTML = `<dl>${rowKeys
    .map(
      (rowKey) =>
        `<div>
          <dd data-testid="check-answers-value-${rowKey}"></dd>
        </div>`
    )
    .join('')}
    <a data-testid="check-answers-change-organisationName" href="#"></a>
    <a data-testid="check-answers-change-organisationAddress" href="#"></a>
  </dl>`
}

const valueOf = (rowKey) =>
  document.querySelector(`[data-testid="check-answers-value-${rowKey}"]`)
    .textContent

afterEach(() => {
  document.body.innerHTML = ''
})

describe('renderCheckAnswers', () => {
  test('renders every answer from the draft', () => {
    buildRows()
    renderCheckAnswers(document, {
      organisationType: 'limitedCompany',
      organisationName: 'Battery Producer Ltd',
      addressLine1: '13 Cherry Lane',
      addressTown: 'London',
      addressPostcode: 'N1 1AA',
      legalNoticesBuilding: '15',
      legalNoticesPostcode: 'AA3 1AB',
      appropriatePersonName: 'Scarlet Elfcup',
      appropriatePersonEmail: 'scarlet@batteryproducer.co.uk',
      isPortable: true,
      isIndustrial: true,
      isAutomotive: false,
      tonnageBand: 'upTo1Tonne',
      dateJoinedIso: '2025-03-05'
    })

    expect(valueOf('organisationType')).toBe('Limited company')
    expect(valueOf('organisationName')).toBe('Battery Producer Ltd')
    expect(valueOf('organisationAddress')).toBe(
      '13 Cherry Lane, London, N1 1AA'
    )
    expect(valueOf('legalNoticesAddress')).toBe('15, AA3 1AB')
    expect(valueOf('appropriatePersonName')).toBe('Scarlet Elfcup')
    expect(valueOf('appropriatePersonEmail')).toBe(
      'scarlet@batteryproducer.co.uk'
    )
    expect(valueOf('batteryTypes')).toBe(
      'Portable batteries, Industrial batteries'
    )
    expect(valueOf('tonnage')).toBe('Less than 1 tonne (1000kg)')
    expect(valueOf('dateJoined')).toBe('2025-03-05')
  })

  test('includes automotive in the battery types summary when selected', () => {
    buildRows()
    renderCheckAnswers(document, { isAutomotive: true })

    expect(valueOf('batteryTypes')).toBe('Automotive batteries')
  })

  test('dashes missing values', () => {
    buildRows()
    renderCheckAnswers(document, {})

    expect(valueOf('organisationName')).toBe('—')
    expect(valueOf('batteryTypes')).toBe('—')
    expect(valueOf('dateJoined')).toBe('—')
  })

  test('points the organisation name/address Change links at the branch detail screen', () => {
    buildRows()
    renderCheckAnswers(document, { organisationType: 'soleTrader' })

    const returnParam = `?return=${encodeURIComponent(paths.prototypeMembersListAddMemberCheckAnswers)}`
    const expected = `${paths.prototypeMembersListAddMemberSoleTraderDetails}${returnParam}`

    expect(
      document
        .querySelector('[data-testid="check-answers-change-organisationName"]')
        .getAttribute('href')
    ).toBe(expected)
    expect(
      document
        .querySelector(
          '[data-testid="check-answers-change-organisationAddress"]'
        )
        .getAttribute('href')
    ).toBe(expected)
  })

  test('leaves the Change links untouched when no organisation type has been chosen yet', () => {
    buildRows()
    renderCheckAnswers(document, {})

    expect(
      document
        .querySelector('[data-testid="check-answers-change-organisationName"]')
        .getAttribute('href')
    ).toBe('#')
  })
})
