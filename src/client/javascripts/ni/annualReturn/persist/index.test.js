// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, test } from 'vitest'

import { initNiAnnualReturnPersist } from './index.js'
import { getAnnualReturn } from '../../storage.js'

const setPayload = (value) => {
  const script = globalThis.document.createElement('script')
  script.id = 'ni-persist-payload'
  script.type = 'application/json'
  script.textContent = JSON.stringify(value)
  globalThis.document.body.appendChild(script)
}

beforeEach(() => {
  globalThis.localStorage.clear()
  globalThis.document.body.innerHTML = ''
})

afterEach(() => {
  globalThis.localStorage.clear()
})

describe('initNiAnnualReturnPersist', () => {
  test('persists the payload to the annual returns store', () => {
    setPayload({
      period: '2026',
      reference: 'NI-AR-100001',
      status: 'Submitted'
    })

    const saved = initNiAnnualReturnPersist(globalThis.document)

    expect(saved.reference).toBe('NI-AR-100001')
    expect(getAnnualReturn('2026').reference).toBe('NI-AR-100001')
  })

  test('does nothing when there is no payload', () => {
    expect(initNiAnnualReturnPersist(globalThis.document)).toBeNull()
    expect(getAnnualReturn('2026')).toBeNull()
  })
})
