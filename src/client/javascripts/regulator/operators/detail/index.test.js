// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { runRegulatorOperatorDetail } from './index.js'
import { storage } from '../../../storage-adapter.js'

const detailHtml = (payload) => `
  <p data-testid="operator-detail-not-found" hidden>Not found.</p>
  <dl data-testid="operator-detail-list">
    <dd data-testid="operator-detail-name"></dd>
    <dd data-testid="operator-detail-type"></dd>
    <dd data-testid="operator-detail-company-reg"></dd>
    <dd data-testid="operator-detail-address"></dd>
    <dd data-testid="operator-detail-sites"></dd>
    <dd data-testid="operator-detail-status"></dd>
    <dd data-testid="operator-detail-agency"></dd>
    <dd data-testid="operator-detail-approval-number"></dd>
  </dl>
  <div data-testid="operator-detail-actions" hidden></div>
  <p data-testid="operator-detail-withdraw" hidden><a data-testid="operator-detail-withdraw-link" href=""></a></p>
  <script id="page-payload" type="application/json">${JSON.stringify(payload)}</script>
`

let assignSpy

beforeEach(() => {
  globalThis.localStorage.clear()
  assignSpy = vi.fn()
  storage.seedDemoData()
  storage.setCurrentAgencyCode('EA')
})

afterEach(() => {
  globalThis.localStorage.clear()
})

describe('runRegulatorOperatorDetail', () => {
  test('hydrates operator fields when operator exists', () => {
    const operators = storage.listOperators()
    const operator = operators[0]
    document.body.innerHTML = detailHtml({
      view: 'detail',
      target: 'hydrate',
      operatorId: operator.id
    })
    const result = runRegulatorOperatorDetail(document, { assign: assignSpy })
    expect(result).toBe('hydrated')
    expect(document.querySelector('[data-testid="operator-detail-name"]').textContent).toBe(operator.name)
  })

  test('shows not-found when operator does not exist', () => {
    document.body.innerHTML = detailHtml({
      view: 'detail',
      target: 'hydrate',
      operatorId: 'nonexistent-id'
    })
    const result = runRegulatorOperatorDetail(document, { assign: assignSpy })
    expect(result).toBe('not-found')
    expect(document.querySelector('[data-testid="operator-detail-not-found"]').hidden).toBe(false)
  })

  test('shows action panel for submitted operators', () => {
    const submitted = storage.listOperators().find((o) => o.approvalStatus === 'submitted')
    if (!submitted) return
    document.body.innerHTML = detailHtml({
      view: 'detail',
      target: 'hydrate',
      operatorId: submitted.id
    })
    runRegulatorOperatorDetail(document, { assign: assignSpy })
    expect(document.querySelector('[data-testid="operator-detail-actions"]').hidden).toBe(false)
  })

  test('hides action panel for approved operators', () => {
    const approved = storage.listOperators().find((o) => o.approvalStatus === 'approved')
    document.body.innerHTML = detailHtml({
      view: 'detail',
      target: 'hydrate',
      operatorId: approved.id
    })
    runRegulatorOperatorDetail(document, { assign: assignSpy })
    expect(document.querySelector('[data-testid="operator-detail-actions"]').hidden).toBe(true)
  })

  test('persist approve calls approveOperator and navigates', () => {
    const submitted = storage.listOperators().find((o) => o.approvalStatus === 'submitted')
    if (!submitted) return
    document.body.innerHTML = detailHtml({
      view: 'detail',
      target: 'persist',
      operatorId: submitted.id,
      action: 'approve',
      approvalNumber: 'ABTO-TEST-001'
    })
    const result = runRegulatorOperatorDetail(document, { assign: assignSpy })
    expect(result).toBe('navigated')
    expect(assignSpy).toHaveBeenCalledWith('/regulator/operators')
    const updated = storage.getOperator(submitted.id)
    expect(updated.approvalStatus).toBe('approved')
    expect(updated.approvalNumber).toBe('ABTO-TEST-001')
  })

  test('persist reject calls rejectOperator and navigates', () => {
    const submitted = storage.listOperators().find((o) => o.approvalStatus === 'submitted')
    if (!submitted) return
    document.body.innerHTML = detailHtml({
      view: 'detail',
      target: 'persist',
      operatorId: submitted.id,
      action: 'reject'
    })
    const result = runRegulatorOperatorDetail(document, { assign: assignSpy })
    expect(result).toBe('navigated')
    expect(assignSpy).toHaveBeenCalledWith('/regulator/operators')
    const updated = storage.getOperator(submitted.id)
    expect(updated.approvalStatus).toBe('rejected')
  })

  test('shows withdraw link for approved operators', () => {
    const approved = storage.listOperators().find((o) => o.approvalStatus === 'approved')
    document.body.innerHTML = detailHtml({
      view: 'detail',
      target: 'hydrate',
      operatorId: approved.id
    })
    runRegulatorOperatorDetail(document, { assign: assignSpy })
    const withdrawEl = document.querySelector('[data-testid="operator-detail-withdraw"]')
    expect(withdrawEl.hidden).toBe(false)
    const withdrawLink = document.querySelector('[data-testid="operator-detail-withdraw-link"]')
    expect(withdrawLink.href).toContain(`/regulator/operators/${approved.id}/withdraw`)
  })

  test('hides withdraw link for submitted operators', () => {
    const submitted = storage.listOperators().find((o) => o.approvalStatus === 'submitted')
    if (!submitted) return
    document.body.innerHTML = detailHtml({
      view: 'detail',
      target: 'hydrate',
      operatorId: submitted.id
    })
    runRegulatorOperatorDetail(document, { assign: assignSpy })
    const withdrawEl = document.querySelector('[data-testid="operator-detail-withdraw"]')
    expect(withdrawEl.hidden).toBe(true)
  })
})
