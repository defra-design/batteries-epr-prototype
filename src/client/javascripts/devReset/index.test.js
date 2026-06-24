// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { performReset, wireResetButton } from './index.js'
import { storage } from '../storage-adapter.js'
import { storage as niStorage } from '../ni/storage.js'

let assignSpy
let location

beforeEach(() => {
  globalThis.localStorage.clear()
  assignSpy = vi.fn()
  location = { assign: assignSpy }
  document.body.innerHTML = ''
})

afterEach(() => {
  globalThis.localStorage.clear()
})

describe('performReset', () => {
  test('clears all namespaced storage and reseeds, then redirects', () => {
    storage.setCurrentUser({ email: 'a@b.com' })
    storage.saveProducer({
      contactEmail: 'a@b.com',
      companyName: 'Acme',
      registeredAddress: { postcode: 'M1 4AA' }
    })
    niStorage.saveRegistration({ bprn: 'NIP1234567' })
    niStorage.saveAnnualReturn({ period: '2026', reference: 'NI-AR-1' })
    expect(storage.getCurrentUser()).not.toBeNull()
    expect(niStorage.getRegistration()).not.toBeNull()

    performReset(location)

    expect(storage.getCurrentUser()).toBeNull()
    expect(niStorage.getRegistration()).toBeNull()
    expect(niStorage.listAnnualReturns()).toEqual([])
    expect(assignSpy).toHaveBeenCalledWith('/')
    const seededProducers = JSON.parse(
      globalThis.localStorage.getItem('npwd-batteries:producers')
    )
    expect(Object.keys(seededProducers).length).toBeGreaterThan(0)
  })
})

describe('wireResetButton', () => {
  test('returns false when the confirm button is missing', () => {
    document.body.innerHTML = ''
    expect(wireResetButton(document, location)).toBe(false)
  })

  test('binds a click listener that performs the reset', () => {
    document.body.innerHTML = `<button data-testid="dev-reset-confirm">Reset</button>`
    storage.setCurrentUser({ email: 'a@b.com' })

    expect(wireResetButton(document, location)).toBe(true)
    document.querySelector('[data-testid="dev-reset-confirm"]').click()

    expect(storage.getCurrentUser()).toBeNull()
    expect(assignSpy).toHaveBeenCalledWith('/')
  })
})
