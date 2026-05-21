// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { renderConfirmation } from './index.js'
import { storage } from '../storage-adapter.js'

let assignSpy

const buildDom = () => {
  document.body.innerHTML = `
    <span data-testid="confirmation-bprn">…</span>
    <dd data-testid="confirmation-bprn-row">…</dd>
    <dd data-testid="confirmation-status">…</dd>
    <p data-testid="confirmation-intro">Default intro</p>
    <script id="page-payload" type="application/json">{"step":"confirmation","target":"hydrate","compliancePeriod":"2026"}</script>
  `
}

beforeEach(() => {
  globalThis.localStorage.clear()
  assignSpy = vi.fn()
  Object.defineProperty(globalThis, 'location', {
    value: { assign: assignSpy },
    writable: true,
    configurable: true
  })
})

afterEach(() => {
  globalThis.localStorage.clear()
})

describe('renderConfirmation', () => {
  test('redirects to sign-in when not authenticated', () => {
    buildDom()
    expect(renderConfirmation(document)).toBe(false)
    expect(assignSpy).toHaveBeenCalledWith('/sign-in')
  })

  test('renders BPRN and status when registration exists', () => {
    storage.setCurrentUser({ email: 'a@b.com' })
    storage.saveProducer({
      contactEmail: 'a@b.com',
      bprn: 'BPRN-EA-2026-000001',
      registeredAddress: { postcode: 'M1 4AA' }
    })
    const producer = storage.getProducerByEmail('a@b.com')
    storage.saveRegistration({
      producerId: producer.id,
      compliancePeriod: '2026',
      status: 'Submitted'
    })

    buildDom()
    const result = renderConfirmation(document)
    expect(result.bprn).toBe('BPRN-EA-2026-000001')
    expect(result.status).toBe('Submitted')
    expect(
      document.querySelector('[data-testid="confirmation-bprn"]').textContent
    ).toBe('BPRN-EA-2026-000001')
    expect(
      document.querySelector('[data-testid="confirmation-status"]').textContent
    ).toBe('Submitted')
  })

  test('falls back to "Pending" / "Started" when state is incomplete', () => {
    storage.setCurrentUser({ email: 'a@b.com' })
    buildDom()

    const result = renderConfirmation(document)
    expect(result.bprn).toBe('Pending')
    expect(result.status).toBe('Started')
  })

  test('uses default compliance period when payload missing', () => {
    storage.setCurrentUser({ email: 'a@b.com' })
    document.body.innerHTML = `<span data-testid="confirmation-bprn">…</span>`
    const result = renderConfirmation(document)
    expect(result.bprn).toBe('Pending')
  })

  test('reports Started status when registration is for a different period', () => {
    storage.setCurrentUser({ email: 'a@b.com' })
    storage.saveProducer({
      contactEmail: 'a@b.com',
      bprn: 'BPRN-EA-2026-000099',
      registeredAddress: { postcode: 'M1 4AA' }
    })
    const producer = storage.getProducerByEmail('a@b.com')
    storage.saveRegistration({
      producerId: producer.id,
      compliancePeriod: '2025',
      status: 'Approved'
    })

    buildDom()
    const result = renderConfirmation(document)
    expect(result.bprn).toBe('BPRN-EA-2026-000099')
    expect(result.status).toBe('Started')
  })

  test('compliance-scheme route shows "Awaiting scheme roster" and the named-scheme intro', () => {
    storage.setCurrentUser({ email: 'a@b.com' })
    storage.saveProducer({
      contactEmail: 'a@b.com',
      registeredAddress: { postcode: 'M1 4AA' }
    })
    const producer = storage.getProducerByEmail('a@b.com')
    const scheme = storage.saveScheme({
      name: 'Northern Battery Compliance Scheme'
    })
    storage.saveRegistration({
      producerId: producer.id,
      compliancePeriod: '2026',
      status: 'pendingScheme',
      producerRoute: 'complianceScheme',
      schemeId: scheme.id
    })

    buildDom()
    const result = renderConfirmation(document)
    expect(result.isSchemeRoute).toBe(true)
    expect(
      document.querySelector('[data-testid="confirmation-bprn"]').textContent
    ).toBe('Awaiting scheme roster')
    expect(
      document.querySelector('[data-testid="confirmation-intro"]').textContent
    ).toEqual(expect.stringContaining('Northern Battery Compliance Scheme'))
  })

  test('compliance-scheme route falls back to a generic intro when scheme record missing', () => {
    storage.setCurrentUser({ email: 'a@b.com' })
    storage.saveProducer({
      contactEmail: 'a@b.com',
      registeredAddress: { postcode: 'M1 4AA' }
    })
    const producer = storage.getProducerByEmail('a@b.com')
    storage.saveRegistration({
      producerId: producer.id,
      compliancePeriod: '2026',
      status: 'pendingScheme',
      producerRoute: 'complianceScheme',
      schemeId: 'no-such-scheme'
    })

    buildDom()
    renderConfirmation(document)
    expect(
      document.querySelector('[data-testid="confirmation-intro"]').textContent
    ).toEqual(expect.stringContaining('your chosen compliance scheme'))
  })

  test('compliance-scheme route with no schemeId still flips the bprn to awaiting-roster', () => {
    storage.setCurrentUser({ email: 'a@b.com' })
    storage.saveProducer({
      contactEmail: 'a@b.com',
      registeredAddress: { postcode: 'M1 4AA' }
    })
    const producer = storage.getProducerByEmail('a@b.com')
    storage.saveRegistration({
      producerId: producer.id,
      compliancePeriod: '2026',
      status: 'pendingScheme',
      producerRoute: 'complianceScheme'
    })

    buildDom()
    renderConfirmation(document)
    expect(
      document.querySelector('[data-testid="confirmation-bprn"]').textContent
    ).toBe('Awaiting scheme roster')
  })
})
