// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { runRegulatorProducerDetail } from './index.js'
import { storage } from '../../../storage-adapter.js'

const detailHtml = (payload) => `
  <p data-testid="producer-detail-not-found" hidden>Not found.</p>
  <dl data-testid="producer-detail-list">
    <dd data-testid="producer-detail-bprn"></dd>
    <dd data-testid="producer-detail-company-name"></dd>
    <dd data-testid="producer-detail-trading-name"></dd>
    <dd data-testid="producer-detail-company-reg"></dd>
    <dd data-testid="producer-detail-address"></dd>
    <dd data-testid="producer-detail-contact"></dd>
    <dd data-testid="producer-detail-battery-types"></dd>
    <dd data-testid="producer-detail-agency"></dd>
    <dd data-testid="producer-detail-status"></dd>
  </dl>
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

describe('runRegulatorProducerDetail', () => {
  test('hydrates producer fields when producer exists', () => {
    const producers = storage.listAllProducers()
    const producer = producers[0]
    document.body.innerHTML = detailHtml({
      view: 'detail',
      target: 'hydrate',
      producerId: producer.id
    })
    const result = runRegulatorProducerDetail(document, { assign: assignSpy })
    expect(result).toBe('hydrated')
    expect(document.querySelector('[data-testid="producer-detail-company-name"]').textContent).toBe(producer.companyName)
  })

  test('shows not-found when producer does not exist', () => {
    document.body.innerHTML = detailHtml({
      view: 'detail',
      target: 'hydrate',
      producerId: 'nonexistent-id'
    })
    const result = runRegulatorProducerDetail(document, { assign: assignSpy })
    expect(result).toBe('not-found')
    expect(document.querySelector('[data-testid="producer-detail-not-found"]').hidden).toBe(false)
  })
})
