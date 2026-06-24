// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, test } from 'vitest'

import { initNiOnboardingPersist } from './index.js'
import { getRegistration } from '../../storage.js'

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

describe('initNiOnboardingPersist', () => {
  test('persists the payload to the registration store', () => {
    setPayload({ bprn: 'NIP1234567', period: '2026', status: 'Registered' })

    const saved = initNiOnboardingPersist(globalThis.document)

    expect(saved.bprn).toBe('NIP1234567')
    expect(getRegistration().bprn).toBe('NIP1234567')
  })

  test('does nothing when there is no payload', () => {
    expect(initNiOnboardingPersist(globalThis.document)).toBeNull()
    expect(getRegistration()).toBeNull()
  })
})
