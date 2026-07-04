// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { runOperatorsPage } from './index.js'
import { storage, createOperator } from '../../storage-adapter.js'

const COPY = {
  acceptAction: 'Approve',
  rejectAction: 'Reject',
  acceptConfirm: 'Approve?',
  rejectConfirm: 'Reject?'
}

const buildDom = () => {
  document.body.innerHTML = `
    <table><tbody data-testid="operators-pending-body"></tbody></table>
    <p data-testid="operators-pending-empty" hidden></p>
    <table><tbody data-testid="operators-approved-body"></tbody></table>
    <p data-testid="operators-approved-empty" hidden></p>
    <script id="page-payload" type="application/json">${JSON.stringify({ view: 'list', copy: COPY })}</script>
  `
}

let schemeId
let reloadSpy

const addPending = (overrides) =>
  storage.saveOperator(
    createOperator({
      schemeId,
      schemeApprovalStatus: 'pending',
      approvalStatus: 'submitted',
      ...overrides
    })
  )

beforeEach(() => {
  globalThis.localStorage.clear()
  storage.seedDemoData()
  schemeId = storage.listSchemes()[0].id
  storage.setCurrentSchemeId(schemeId)
  reloadSpy = vi.fn()
})

afterEach(() => {
  globalThis.localStorage.clear()
  vi.restoreAllMocks()
})

describe('runOperatorsPage', () => {
  test('redirects to sign-in when no scheme is selected', () => {
    storage.clearCurrentSchemeId()
    buildDom()
    const assign = vi.fn()
    expect(runOperatorsPage(document, { assign })).toBe('redirected-to-sign-in')
    expect(assign).toHaveBeenCalledWith('/compliance-scheme/sign-in')
  })

  test('shows empty states when the scheme has no operators', () => {
    buildDom()
    expect(runOperatorsPage(document, { reload: reloadSpy })).toBe('rendered')
    expect(
      document.querySelector('[data-testid="operators-pending-empty"]').hidden
    ).toBe(false)
    expect(
      document.querySelector('[data-testid="operators-approved-empty"]').hidden
    ).toBe(false)
  })

  test('lists pending and approved operators for the scheme', () => {
    addPending({ name: 'Pending & ABTO', approvalType: 'abto' })
    addPending({ name: 'Pending ABE', approvalType: 'abe' })
    storage.saveOperator(
      createOperator({
        name: 'Approved with number',
        approvalType: 'abto',
        schemeId,
        schemeApprovalStatus: 'approved',
        approvalNumber: 'ABTO-EA-2026-000099'
      })
    )
    storage.saveOperator(
      createOperator({
        name: 'Approved without number',
        approvalType: 'abe',
        schemeId,
        schemeApprovalStatus: 'approved',
        approvalNumber: null
      })
    )

    buildDom()
    runOperatorsPage(document, { reload: reloadSpy })

    const pending = document.querySelector(
      '[data-testid="operators-pending-body"]'
    ).innerHTML
    expect(pending).toContain('Pending &amp; ABTO')
    expect(pending).toContain('ABTO')
    expect(pending).toContain('ABE')

    const approved = document.querySelector(
      '[data-testid="operators-approved-body"]'
    ).innerHTML
    expect(approved).toContain('Approved with number')
    expect(approved).toContain('ABTO-EA-2026-000099')
    expect(approved).toContain('Approved without number')
  })

  test('accept and reject only act when confirmed', () => {
    const accepted = addPending({ name: 'To accept' })
    const rejected = addPending({ name: 'To reject' })
    buildDom()
    runOperatorsPage(document, { reload: reloadSpy })

    const confirmSpy = vi.spyOn(globalThis, 'confirm')
    const acceptBtn = document.querySelector(
      `[data-testid="operators-pending-accept"][data-operator-id="${accepted.id}"]`
    )
    const rejectBtn = document.querySelector(
      `[data-testid="operators-pending-reject"][data-operator-id="${rejected.id}"]`
    )

    confirmSpy.mockReturnValue(false)
    acceptBtn.click()
    rejectBtn.click()
    expect(storage.getOperator(accepted.id).schemeApprovalStatus).toBe(
      'pending'
    )
    expect(storage.getOperator(rejected.id).schemeApprovalStatus).toBe(
      'pending'
    )
    expect(reloadSpy).not.toHaveBeenCalled()

    confirmSpy.mockReturnValue(true)
    acceptBtn.click()
    rejectBtn.click()
    expect(storage.getOperator(accepted.id).schemeApprovalStatus).toBe(
      'approved'
    )
    expect(storage.getOperator(rejected.id).schemeApprovalStatus).toBe(
      'rejected'
    )
    expect(reloadSpy).toHaveBeenCalledTimes(2)
  })
})
