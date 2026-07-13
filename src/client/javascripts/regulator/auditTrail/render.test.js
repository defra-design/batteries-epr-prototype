// @vitest-environment jsdom
import { beforeEach, describe, expect, test } from 'vitest'

import {
  describeAuditEntry,
  renderAuditEntries,
  renderAuditTable
} from './render.js'

const copy = {
  empty: 'No changes yet.',
  notSet: 'Not set',
  fieldLabels: { collection: 'collection', recycling: 'recycling' },
  categoryLabels: {
    portable: 'portable',
    industrial: 'industrial',
    automotive: 'automotive'
  }
}

const entry = (overrides) => ({
  id: 'a',
  at: '2026-01-05T09:14:00.000Z',
  agencyCode: 'EA',
  actorName: 'Priya Shah',
  field: 'recycling',
  category: 'portable',
  previousValue: 40,
  newValue: 45,
  ...overrides
})

describe('describeAuditEntry', () => {
  test('describes a value change in plain language', () => {
    expect(describeAuditEntry(entry(), copy)).toBe(
      'Priya Shah (EA) changed the portable recycling target from 40% to 45%'
    )
  })

  test('describes a first-time set when there is no previous value', () => {
    expect(describeAuditEntry(entry({ previousValue: null }), copy)).toBe(
      'Priya Shah (EA) set the portable recycling target to 45%'
    )
  })
})

describe('renderAuditEntries', () => {
  let list

  beforeEach(() => {
    document.body.innerHTML = '<ol data-testid="list"></ol>'
    list = document.querySelector('[data-testid="list"]')
  })

  test('renders one list item per entry, most-recent-first order preserved', () => {
    renderAuditEntries(list, [entry(), entry({ newValue: 50 })], copy)
    const items = list.querySelectorAll('[data-testid="audit-entry"]')
    expect(items.length).toBe(2)
    expect(items[0].textContent).toContain('5 Jan 2026')
    expect(items[0].textContent).toContain('from 40% to 45%')
  })

  test('renders the empty message when there are no entries', () => {
    renderAuditEntries(list, [], copy)
    expect(
      list.querySelector('[data-testid="audit-entry-empty"]').textContent
    ).toBe('No changes yet.')
  })

  test('escapes an invalid date to an empty string', () => {
    renderAuditEntries(list, [entry({ at: 'not-a-date' })], copy)
    const item = list.querySelector('[data-testid="audit-entry"]')
    expect(item.querySelector('strong').textContent).toBe('')
  })

  test('does nothing when the list element is missing', () => {
    expect(() => renderAuditEntries(null, [entry()], copy)).not.toThrow()
  })

  test('escapes special characters in the actor name', () => {
    renderAuditEntries(list, [entry({ actorName: 'Ben & <Co>' })], copy)
    const item = list.querySelector('[data-testid="audit-entry"]')
    expect(item.innerHTML).toContain('Ben &amp; &lt;Co&gt;')
  })
})

describe('renderAuditTable', () => {
  let tbody
  let empty

  beforeEach(() => {
    document.body.innerHTML = `
      <table><tbody data-testid="tbody"></tbody></table>
      <p data-testid="empty" hidden></p>
    `
    tbody = document.querySelector('[data-testid="tbody"]')
    empty = document.querySelector('[data-testid="empty"]')
  })

  test('renders a row per entry with a capitalised target and % values', () => {
    const result = renderAuditTable(
      tbody,
      empty,
      [entry(), entry({ newValue: 50 })],
      copy
    )
    expect(result).toBe('rendered')
    expect(empty.hidden).toBe(true)
    const rows = tbody.querySelectorAll('[data-testid="audit-entry"]')
    expect(rows.length).toBe(2)
    const cells = rows[0].querySelectorAll('td')
    expect(cells[0].textContent).toBe('5 Jan 2026')
    expect(cells[1].textContent).toBe('Portable recycling')
    expect(cells[2].textContent).toBe('40%')
    expect(cells[3].textContent).toBe('45%')
    expect(cells[4].textContent).toBe('Priya Shah (EA)')
  })

  test('shows the not-set label when there is no previous value', () => {
    renderAuditTable(tbody, empty, [entry({ previousValue: null })], copy)
    const cells = tbody.querySelectorAll('td')
    expect(cells[2].textContent).toBe('Not set')
  })

  test('reveals the empty paragraph and clears the body when there are no entries', () => {
    tbody.innerHTML = '<tr><td>stale</td></tr>'
    const result = renderAuditTable(tbody, empty, [], copy)
    expect(result).toBe('rendered-empty')
    expect(empty.hidden).toBe(false)
    expect(tbody.innerHTML).toBe('')
  })

  test('escapes special characters in cell values', () => {
    renderAuditTable(tbody, empty, [entry({ actorName: 'Ben & <Co>' })], copy)
    const changedBy = tbody.querySelectorAll('td')[4]
    expect(changedBy.innerHTML).toContain('Ben &amp; &lt;Co&gt;')
  })
})
