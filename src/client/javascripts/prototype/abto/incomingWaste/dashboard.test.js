// @vitest-environment jsdom
import { afterEach, describe, expect, test } from 'vitest'

import { renderIncomingDeliveries } from './dashboard.js'

const payload = {
  operatorName: 'Halton Battery Processing Ltd',
  verifyAction: 'Verify',
  compareUrlTemplate: '/prototype/abto/incoming-waste/{deliveryId}'
}

const delivery = {
  id: 'BT2026-0093',
  schemeName: 'IronWave Compliance',
  reportedTonnes: 60.25,
  measuredTonnes: null,
  reportedOn: '2026-09-04T10:15:00.000Z',
  receivingOperator: 'Halton Battery Processing Ltd'
}

const setBody = () => {
  document.body.innerHTML = `
    <table data-testid="abto-dashboard-table"><tbody>
      <tr class="govuk-table__row"><td>seeded</td><td></td></tr>
    </tbody></table>`
}

const rows = () => document.querySelectorAll('tbody tr')

afterEach(() => {
  document.body.innerHTML = ''
})

describe('renderIncomingDeliveries', () => {
  test('appends a reported delivery in the same wording as the seeded rows', () => {
    setBody()
    renderIncomingDeliveries(document, [delivery], payload)

    expect(rows()).toHaveLength(2)
    expect(rows()[1].querySelector('td').textContent).toBe(
      'IronWave Compliance — reported 4 Sep 2026, 60.250t, batch BT2026-0093'
    )
  })

  test('links Verify to the comparison screen for the batch', () => {
    setBody()
    renderIncomingDeliveries(document, [delivery], payload)

    const link = document.querySelector(
      '[data-testid="abto-dashboard-verify-BT2026-0093"]'
    )
    expect(link.getAttribute('href')).toBe(
      '/prototype/abto/incoming-waste/BT2026-0093'
    )
    expect(link.textContent).toBe('Verify')
  })

  test('ignores deliveries for a different receiving operator', () => {
    setBody()
    renderIncomingDeliveries(
      document,
      [{ ...delivery, receivingOperator: 'Somebody Else Ltd' }],
      payload
    )

    expect(rows()).toHaveLength(1)
  })

  test('does nothing when there are no reported deliveries', () => {
    setBody()
    renderIncomingDeliveries(document, [], payload)

    expect(rows()).toHaveLength(1)
  })

  test('does not throw when the table is missing', () => {
    document.body.innerHTML = ''
    expect(() =>
      renderIncomingDeliveries(document, [delivery], payload)
    ).not.toThrow()
  })
})
