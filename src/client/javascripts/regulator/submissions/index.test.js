// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { runRegulatorSubmissionsPage } from './index.js'
import { storage } from '../../storage-adapter.js'

const submissionsHtml = (payload) => `
  <table><tbody data-testid="submissions-body"></tbody></table>
  <p data-testid="submissions-empty" hidden>No submissions found.</p>
  <script id="page-payload" type="application/json">${JSON.stringify(payload)}</script>
`

const defaultPayload = {
  view: 'list',
  compliancePeriodYear: '2026',
  copy: {
    typeLabels: {
      schemeQuarterly: 'Scheme quarterly',
      schemeIa: 'Scheme IA',
      operatorQuarterly: 'Operator quarterly',
      operatorAnnual: 'Operator annual'
    },
    statuses: {
      'not-started': 'Not started',
      'in-progress': 'In progress',
      submitted: 'Submitted'
    }
  },
  urls: {
    dashboard: '/regulator'
  }
}

let assignSpy

beforeEach(() => {
  globalThis.localStorage.clear()
  assignSpy = vi.fn()
})

afterEach(() => {
  globalThis.localStorage.clear()
})

describe('runRegulatorSubmissionsPage', () => {
  test('redirects to sign-in when no agency selected', () => {
    document.body.innerHTML = submissionsHtml(defaultPayload)
    const result = runRegulatorSubmissionsPage(document, { assign: assignSpy })
    expect(result).toBe('redirected-to-sign-in')
    expect(assignSpy).toHaveBeenCalledWith('/regulator/sign-in')
  })

  test('shows empty message when no submissions exist', () => {
    storage.seedDemoData()
    storage.setCurrentAgencyCode('EA')
    document.body.innerHTML = submissionsHtml(defaultPayload)
    const result = runRegulatorSubmissionsPage(document, { assign: assignSpy })
    expect(result).toBe('rendered-empty')
    const empty = document.querySelector('[data-testid="submissions-empty"]')
    expect(empty.hidden).toBe(false)
  })

  test('renders submission rows when submissions exist', () => {
    storage.seedDemoData()
    storage.setCurrentAgencyCode('EA')

    const scheme = storage.listSchemes()[0]
    storage.upsertQuarterlySubmission(scheme.id, '2026', 'Q1', {
      status: 'submitted'
    })

    document.body.innerHTML = submissionsHtml(defaultPayload)
    const result = runRegulatorSubmissionsPage(document, { assign: assignSpy })
    expect(result).toBe('rendered')
    const rows = document.querySelectorAll('[data-testid="submission-row"]')
    expect(rows.length).toBeGreaterThan(0)
    const empty = document.querySelector('[data-testid="submissions-empty"]')
    expect(empty.hidden).toBe(true)
  })

  test('renders scheme IA submissions', () => {
    storage.seedDemoData()
    storage.setCurrentAgencyCode('EA')

    const scheme = storage.listSchemes()[0]
    storage.upsertIaSubmission(scheme.id, '2026', {
      status: 'in-progress'
    })

    document.body.innerHTML = submissionsHtml(defaultPayload)
    const result = runRegulatorSubmissionsPage(document, { assign: assignSpy })
    expect(result).toBe('rendered')
    const typeCells = document.querySelectorAll(
      '[data-testid="submission-row-type"]'
    )
    const hasIa = [...typeCells].some((cell) =>
      cell.textContent.includes('Scheme IA')
    )
    expect(hasIa).toBe(true)
  })

  test('renders operator quarterly returns', () => {
    storage.seedDemoData()
    storage.setCurrentAgencyCode('EA')

    const operator = storage.listOperators()[0]
    storage.upsertOperatorQuarterlyReturn(operator.id, '2026', 'Q1', {
      status: 'submitted'
    })

    document.body.innerHTML = submissionsHtml(defaultPayload)
    const result = runRegulatorSubmissionsPage(document, { assign: assignSpy })
    expect(result).toBe('rendered')
    const typeCells = document.querySelectorAll(
      '[data-testid="submission-row-type"]'
    )
    const hasOpQ = [...typeCells].some((cell) =>
      cell.textContent.includes('Operator quarterly')
    )
    expect(hasOpQ).toBe(true)
  })

  test('renders operator annual returns', () => {
    storage.seedDemoData()
    storage.setCurrentAgencyCode('EA')

    const operator = storage.listOperators()[0]
    storage.upsertOperatorAnnualReturn(operator.id, '2026', {
      status: 'not-started'
    })

    document.body.innerHTML = submissionsHtml(defaultPayload)
    const result = runRegulatorSubmissionsPage(document, { assign: assignSpy })
    expect(result).toBe('rendered')
    const typeCells = document.querySelectorAll(
      '[data-testid="submission-row-type"]'
    )
    const hasOpA = [...typeCells].some((cell) =>
      cell.textContent.includes('Operator annual')
    )
    expect(hasOpA).toBe(true)
  })

  test('resolves entity name from operator for operator returns', () => {
    storage.seedDemoData()
    storage.setCurrentAgencyCode('EA')

    const operator = storage.listOperators()[0]
    storage.upsertOperatorQuarterlyReturn(operator.id, '2026', 'Q2', {
      status: 'in-progress'
    })

    document.body.innerHTML = submissionsHtml(defaultPayload)
    runRegulatorSubmissionsPage(document, { assign: assignSpy })
    const entityCells = document.querySelectorAll(
      '[data-testid="submission-row-entity"]'
    )
    const hasName = [...entityCells].some(
      (cell) => cell.textContent === operator.name
    )
    expect(hasName).toBe(true)
  })

  test('formats period with quarter when present', () => {
    storage.seedDemoData()
    storage.setCurrentAgencyCode('EA')

    const scheme = storage.listSchemes()[0]
    storage.upsertQuarterlySubmission(scheme.id, '2026', 'Q3', {
      status: 'not-started'
    })

    document.body.innerHTML = submissionsHtml(defaultPayload)
    runRegulatorSubmissionsPage(document, { assign: assignSpy })
    const periodCells = document.querySelectorAll(
      '[data-testid="submission-row-period"]'
    )
    const hasQ3 = [...periodCells].some(
      (cell) => cell.textContent === '2026 Q3'
    )
    expect(hasQ3).toBe(true)
  })
})
