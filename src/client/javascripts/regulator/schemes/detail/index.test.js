// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { runRegulatorSchemeDetail } from './index.js'
import { storage } from '../../../storage-adapter.js'

const detailHtml = (payload) => `
  <p data-testid="scheme-detail-not-found" hidden>Not found.</p>
  <dl data-testid="scheme-detail-list">
    <dd data-testid="scheme-detail-name"></dd>
    <dd data-testid="scheme-detail-operator"></dd>
    <dd data-testid="scheme-detail-address"></dd>
    <dd data-testid="scheme-detail-contact-address"></dd>
    <dd data-testid="scheme-detail-operational-plan"></dd>
    <dd data-testid="scheme-detail-partners"></dd>
    <dd data-testid="scheme-detail-offences"></dd>
    <dd data-testid="scheme-detail-status"></dd>
    <dd data-testid="scheme-detail-agency"></dd>
    <dd data-testid="scheme-detail-approval-number"></dd>
  </dl>
  <div data-testid="scheme-detail-actions" hidden></div>
  <p data-testid="scheme-detail-withdraw" hidden><a data-testid="scheme-detail-withdraw-link" href=""></a></p>
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

describe('runRegulatorSchemeDetail', () => {
  test('hydrates scheme fields when scheme exists', () => {
    const schemes = storage.listSchemes()
    const scheme = schemes[0]
    document.body.innerHTML = detailHtml({
      view: 'detail',
      target: 'hydrate',
      schemeId: scheme.id
    })
    const result = runRegulatorSchemeDetail(document, { assign: assignSpy })
    expect(result).toBe('hydrated')
    expect(document.querySelector('[data-testid="scheme-detail-name"]').textContent).toBe(scheme.name)
  })

  test('shows not-found when scheme does not exist', () => {
    document.body.innerHTML = detailHtml({
      view: 'detail',
      target: 'hydrate',
      schemeId: 'nonexistent-id'
    })
    const result = runRegulatorSchemeDetail(document, { assign: assignSpy })
    expect(result).toBe('not-found')
    expect(document.querySelector('[data-testid="scheme-detail-not-found"]').hidden).toBe(false)
  })

  test('shows action panel for submitted schemes', () => {
    const submitted = storage.listSchemes().find((s) => s.approvalStatus === 'submitted')
    if (!submitted) return
    document.body.innerHTML = detailHtml({
      view: 'detail',
      target: 'hydrate',
      schemeId: submitted.id
    })
    runRegulatorSchemeDetail(document, { assign: assignSpy })
    expect(document.querySelector('[data-testid="scheme-detail-actions"]').hidden).toBe(false)
  })

  test('hides action panel for approved schemes', () => {
    const approved = storage.listSchemes().find((s) => s.approvalStatus === 'approved')
    document.body.innerHTML = detailHtml({
      view: 'detail',
      target: 'hydrate',
      schemeId: approved.id
    })
    runRegulatorSchemeDetail(document, { assign: assignSpy })
    expect(document.querySelector('[data-testid="scheme-detail-actions"]').hidden).toBe(true)
  })

  test('persist approve calls approveScheme and navigates', () => {
    const submitted = storage.listSchemes().find((s) => s.approvalStatus === 'submitted')
    if (!submitted) return
    document.body.innerHTML = detailHtml({
      view: 'detail',
      target: 'persist',
      schemeId: submitted.id,
      action: 'approve',
      approvalNumber: 'BCS-TEST-001'
    })
    const result = runRegulatorSchemeDetail(document, { assign: assignSpy })
    expect(result).toBe('navigated')
    expect(assignSpy).toHaveBeenCalledWith('/regulator/schemes')
    const updated = storage.getScheme(submitted.id)
    expect(updated.approvalStatus).toBe('approved')
    expect(updated.approvalNumber).toBe('BCS-TEST-001')
  })

  test('persist reject calls rejectScheme and navigates', () => {
    const submitted = storage.listSchemes().find((s) => s.approvalStatus === 'submitted')
    if (!submitted) return
    document.body.innerHTML = detailHtml({
      view: 'detail',
      target: 'persist',
      schemeId: submitted.id,
      action: 'reject'
    })
    const result = runRegulatorSchemeDetail(document, { assign: assignSpy })
    expect(result).toBe('navigated')
    expect(assignSpy).toHaveBeenCalledWith('/regulator/schemes')
    const updated = storage.getScheme(submitted.id)
    expect(updated.approvalStatus).toBe('rejected')
  })

  test('shows withdraw link for approved schemes', () => {
    const approved = storage.listSchemes().find((s) => s.approvalStatus === 'approved')
    document.body.innerHTML = detailHtml({
      view: 'detail',
      target: 'hydrate',
      schemeId: approved.id
    })
    runRegulatorSchemeDetail(document, { assign: assignSpy })
    const withdrawEl = document.querySelector('[data-testid="scheme-detail-withdraw"]')
    expect(withdrawEl.hidden).toBe(false)
    const withdrawLink = document.querySelector('[data-testid="scheme-detail-withdraw-link"]')
    expect(withdrawLink.href).toContain(`/regulator/schemes/${approved.id}/withdraw`)
  })

  test('hides withdraw link for submitted schemes', () => {
    const submitted = storage.listSchemes().find((s) => s.approvalStatus === 'submitted')
    if (!submitted) return
    document.body.innerHTML = detailHtml({
      view: 'detail',
      target: 'hydrate',
      schemeId: submitted.id
    })
    runRegulatorSchemeDetail(document, { assign: assignSpy })
    const withdrawEl = document.querySelector('[data-testid="scheme-detail-withdraw"]')
    expect(withdrawEl.hidden).toBe(true)
  })
})
