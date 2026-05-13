// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import {
  STORAGE_KEYS,
  createProducer,
  createRegistration,
  createSubmission,
  storage
} from './storage-adapter.js'
import seedData from './storage-seed.json'

const baseProducer = (overrides = {}) =>
  createProducer({
    contactEmail: 'test@example.com',
    companyName: 'Test Co',
    companyRegistrationNo: '12345678',
    registeredAddress: {
      line1: '1 Test St',
      line2: null,
      line3: null,
      line4: null,
      town: 'Testville',
      postcode: 'TS1 1AA',
      countryCode: 'GB'
    },
    serviceOfNoticeAddress: null,
    primaryContact: {
      firstName: 'Test',
      lastName: 'User',
      position: 'Tester',
      phone: '01234567890',
      email: 'test@example.com'
    },
    brandNames: ['TestBrand'],
    batteryTypes: {
      isPortable: true,
      isIndustrial: false,
      isAutomotive: false
    },
    agencyCode: 'EA',
    status: 'Active',
    ...overrides
  })

beforeEach(() => {
  globalThis.localStorage.clear()
})

afterEach(() => {
  globalThis.localStorage.clear()
})

describe('createProducer / createRegistration / createSubmission', () => {
  test('createProducer fills sensible defaults', () => {
    const p = createProducer()

    expect(p.id).toMatch(/^[0-9a-f-]{36}$/)
    expect(p.version).toBe(0)
    expect(p.bprn).toBeNull()
    expect(p.brandNames).toEqual([])
    expect(p.batteryTypes).toEqual({
      isPortable: false,
      isIndustrial: false,
      isAutomotive: false
    })
    expect(p.status).toBe('Active')
    expect(p.createdAt).toMatch(/T/)
  })

  test('createRegistration fills defaults including default fee object', () => {
    const r = createRegistration()
    expect(r.status).toBe('Started')
    expect(r.fee).toEqual({
      amountPence: 0,
      paymentId: null,
      status: 'NotStarted'
    })
    expect(r.brandNamesSnapshot).toEqual([])
  })

  test('createSubmission coerces numeric tonnages to 3dp strings', () => {
    const s = createSubmission({
      lines: [
        {
          category: 'portable',
          activity: 'placed',
          chemistry: 'leadAcid',
          tonnes: 0.123
        },
        {
          category: 'portable',
          activity: 'placed',
          chemistry: 'nickelCadmium',
          tonnes: '0.500'
        },
        { category: 'portable', activity: 'placed', chemistry: 'other' }
      ]
    })

    expect(s.lines[0].tonnes).toBe('0.123')
    expect(s.lines[1].tonnes).toBe('0.500')
    expect(s.lines[2].tonnes).toBe('0.000')
    expect(s.totals).toEqual({
      placedTotal: '0.000',
      collectedTotal: '0.000',
      deliveredTotal: '0.000',
      exportedTotal: '0.000'
    })
  })

  test('createProducer preserves explicitly provided batteryTypes', () => {
    const types = { isPortable: false, isIndustrial: true, isAutomotive: true }
    const p = createProducer({ batteryTypes: types })
    expect(p.batteryTypes).toEqual(types)
  })

  test('factories pass through provided id, version, timestamps', () => {
    const fixed = {
      id: '11111111-2222-3333-4444-555555555555',
      version: 7,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-02-01T00:00:00Z'
    }
    const p = createProducer(fixed)
    expect(p.id).toBe(fixed.id)
    expect(p.version).toBe(0)
    expect(p.createdAt).toBe(fixed.createdAt)
    expect(p.updatedAt).toBe(fixed.updatedAt)

    const r = createRegistration(fixed)
    expect(r.id).toBe(fixed.id)
    expect(r.createdAt).toBe(fixed.createdAt)

    const s = createSubmission(fixed)
    expect(s.id).toBe(fixed.id)
  })
})

describe('identity', () => {
  test('getCurrentUser returns null when no session', () => {
    expect(storage.getCurrentUser()).toBeNull()
  })

  test('setCurrentUser writes and getCurrentUser reads', () => {
    storage.setCurrentUser({ email: 'a@b.com' })
    expect(storage.getCurrentUser()).toEqual({ email: 'a@b.com' })
  })

  test('signOut removes the current user', () => {
    storage.setCurrentUser({ email: 'a@b.com' })
    storage.signOut()
    expect(storage.getCurrentUser()).toBeNull()
  })

  test('getCurrentUser swallows malformed JSON and warns', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    globalThis.localStorage.setItem(STORAGE_KEYS.currentUser, '{not json')
    expect(storage.getCurrentUser()).toBeNull()
    expect(warn).toHaveBeenCalled()
    warn.mockRestore()
  })
})

describe('producers', () => {
  test('getProducerByEmail returns null when missing', () => {
    expect(storage.getProducerByEmail('nobody@x.com')).toBeNull()
  })

  test('saveProducer assigns an id, version 0, and persists by email', () => {
    const saved = storage.saveProducer(baseProducer())
    expect(saved.id).toMatch(/^[0-9a-f-]{36}$/)
    expect(saved.version).toBe(0)
    expect(storage.getProducerByEmail('test@example.com')).toEqual(saved)
  })

  test('saveProducer bumps version on subsequent saves and preserves createdAt', async () => {
    const first = storage.saveProducer(baseProducer())
    await new Promise((resolve) => setTimeout(resolve, 5))
    const second = storage.saveProducer({
      ...first,
      companyName: 'Test Co Ltd'
    })

    expect(second.id).toBe(first.id)
    expect(second.version).toBe(1)
    expect(second.createdAt).toBe(first.createdAt)
    expect(second.updatedAt).not.toBe(first.updatedAt)
    expect(second.companyName).toBe('Test Co Ltd')
  })

  test('saveProducer throws without a contactEmail', () => {
    expect(() => storage.saveProducer({ companyName: 'X' })).toThrow(
      /contactEmail/
    )
  })
})

describe('registrations', () => {
  test('getRegistration returns null when missing', () => {
    expect(storage.getRegistration('nope')).toBeNull()
  })

  test('saveRegistration assigns id, persists, and bumps version on update', () => {
    const r1 = storage.saveRegistration(
      createRegistration({ producerId: 'p1', compliancePeriod: '2026' })
    )
    expect(r1.id).toMatch(/^[0-9a-f-]{36}$/)
    expect(r1.version).toBe(0)
    expect(storage.getRegistration(r1.id)).toEqual(r1)

    const r2 = storage.saveRegistration({ ...r1, status: 'Submitted' })
    expect(r2.id).toBe(r1.id)
    expect(r2.version).toBe(1)
    expect(r2.status).toBe('Submitted')
  })

  test('saveRegistration assigns a fresh id when none is provided', () => {
    const saved = storage.saveRegistration({ producerId: 'p1' })
    expect(saved.id).toMatch(/^[0-9a-f-]{36}$/)
    expect(saved.version).toBe(0)
  })

  test('saveRegistration with an unknown explicit id treats it as new', () => {
    const newId = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'
    const saved = storage.saveRegistration({
      ...createRegistration({ producerId: 'p1' }),
      id: newId
    })
    expect(saved.id).toBe(newId)
    expect(saved.version).toBe(0)
  })

  test('saveProducer rebuilds createdAt/version when the existing record is missing them', () => {
    const partial = {
      contactEmail: 'partial@example.com',
      companyName: 'Partial Co'
    }
    globalThis.localStorage.setItem(
      STORAGE_KEYS.producers,
      JSON.stringify({ 'partial@example.com': partial })
    )
    const saved = storage.saveProducer({ ...partial, companyName: 'Updated' })
    expect(saved.version).toBe(1)
    expect(saved.createdAt).toMatch(/T/)
    expect(saved.companyName).toBe('Updated')
  })

  test('listRegistrationsForProducer returns only the matching producer', () => {
    storage.saveRegistration(createRegistration({ producerId: 'a' }))
    storage.saveRegistration(createRegistration({ producerId: 'a' }))
    storage.saveRegistration(createRegistration({ producerId: 'b' }))

    expect(storage.listRegistrationsForProducer('a')).toHaveLength(2)
    expect(storage.listRegistrationsForProducer('b')).toHaveLength(1)
    expect(storage.listRegistrationsForProducer('c')).toHaveLength(0)
  })
})

describe('submissions', () => {
  test('getSubmission returns null when missing', () => {
    expect(storage.getSubmission('nope')).toBeNull()
  })

  test('saveSubmission coerces tonnes and persists', () => {
    const submission = storage.saveSubmission(
      createSubmission({
        registrationId: 'r1',
        lines: [
          {
            category: 'portable',
            activity: 'placed',
            chemistry: 'leadAcid',
            tonnes: 1
          }
        ]
      })
    )

    expect(submission.lines[0].tonnes).toBe('1.000')
    expect(storage.getSubmission(submission.id)).toEqual(submission)
  })

  test('saveSubmission with no lines preserves an empty list', () => {
    const submission = storage.saveSubmission({ registrationId: 'r1' })
    expect(submission.lines).toEqual([])
  })

  test('saveSubmission updates an existing submission and bumps version', () => {
    const first = storage.saveSubmission(
      createSubmission({ registrationId: 'r1' })
    )
    const second = storage.saveSubmission({ ...first, status: 'Submitted' })

    expect(second.id).toBe(first.id)
    expect(second.version).toBe(1)
  })

  test('listSubmissionsForRegistration filters by registrationId', () => {
    storage.saveSubmission(createSubmission({ registrationId: 'r1' }))
    storage.saveSubmission(createSubmission({ registrationId: 'r1' }))
    storage.saveSubmission(createSubmission({ registrationId: 'r2' }))

    expect(storage.listSubmissionsForRegistration('r1')).toHaveLength(2)
    expect(storage.listSubmissionsForRegistration('r2')).toHaveLength(1)
  })
})

describe('payments', () => {
  test('createPayment writes a payment record with status Created', () => {
    const payment = storage.createPayment('sub-1', 5000)
    expect(payment.status).toBe('Created')
    expect(payment.submissionId).toBe('sub-1')
    expect(payment.amountPence).toBe(5000)
    expect(storage.getPayment(payment.id)).toEqual(payment)
  })

  test('completePayment resolves to Success after a 1s delay', async () => {
    vi.useFakeTimers()
    const payment = storage.createPayment('sub-1', 5000)
    const completionPromise = storage.completePayment(payment.id)

    await vi.advanceTimersByTimeAsync(1000)
    const result = await completionPromise

    expect(result.status).toBe('Success')
    expect(storage.getPayment(payment.id).status).toBe('Success')
    vi.useRealTimers()
  })

  test('completePayment resolves to null for an unknown id', async () => {
    vi.useFakeTimers()
    const completionPromise = storage.completePayment('does-not-exist')
    await vi.advanceTimersByTimeAsync(1000)
    const result = await completionPromise
    expect(result).toBeNull()
    vi.useRealTimers()
  })

  test('getPayment returns null for missing id', () => {
    expect(storage.getPayment('nope')).toBeNull()
  })
})

describe('BPRN allocation', () => {
  test('produces sequential numbers per (agency, period) pair', () => {
    const a = storage.allocateBprn({
      agencyCode: 'EA',
      compliancePeriod: '2026'
    })
    const b = storage.allocateBprn({
      agencyCode: 'EA',
      compliancePeriod: '2026'
    })
    const c = storage.allocateBprn({
      agencyCode: 'NRW',
      compliancePeriod: '2026'
    })
    const d = storage.allocateBprn({
      agencyCode: 'EA',
      compliancePeriod: '2027'
    })

    expect(a).toBe('BPRN-EA-2026-000001')
    expect(b).toBe('BPRN-EA-2026-000002')
    expect(c).toBe('BPRN-NRW-2026-000001')
    expect(d).toBe('BPRN-EA-2027-000001')
  })

  test('throws when missing agencyCode or compliancePeriod', () => {
    expect(() => storage.allocateBprn({ agencyCode: 'EA' })).toThrow()
    expect(() => storage.allocateBprn({ compliancePeriod: '2026' })).toThrow()
    expect(() => storage.allocateBprn({})).toThrow()
  })
})

describe('public register', () => {
  beforeEach(() => {
    storage.seedDemoData()
  })

  test('returns approved/BPRN-allocated producers when no filters applied', () => {
    const result = storage.searchPublicRegister({})
    const expectedCount = seedData.producers.filter(
      (p) => p.status === 'Active' || p.status === 'Approved' || p.bprn != null
    ).length
    expect(result.totalCount).toBe(expectedCount)
    expect(result.items).toHaveLength(10)
    expect(result.totalPages).toBe(Math.ceil(expectedCount / 10))
  })

  test('omits producers in Started status with no BPRN', () => {
    const startedSeed = seedData.producers.find(
      (p) => p.status === 'Started' && p.bprn == null
    )
    expect(startedSeed).toBeDefined()

    const result = storage.searchPublicRegister({
      q: startedSeed.companyName.split(' ')[0]
    })
    expect(
      result.items.every((item) => item.companyName !== startedSeed.companyName)
    ).toBe(true)
  })

  test('paginates beyond page 1', () => {
    const page2 = storage.searchPublicRegister({ page: 2 })
    expect(page2.page).toBe(2)
    expect(page2.items.length).toBeGreaterThan(0)
  })

  test('clamps an out-of-range page to the last page', () => {
    const result = storage.searchPublicRegister({ page: 99 })
    expect(result.page).toBe(result.totalPages)
  })

  test('filters by company name substring (case-insensitive)', () => {
    const result = storage.searchPublicRegister({ q: 'kelvin' })
    expect(result.totalCount).toBe(1)
    expect(result.items[0].companyName).toBe('Kelvin Power Ltd')
  })

  test('filters by exact BPRN', () => {
    const result = storage.searchPublicRegister({
      bprn: 'BPRN-NIEA-2026-000001'
    })
    expect(result.totalCount).toBe(1)
    expect(result.items[0].bprn).toBe('BPRN-NIEA-2026-000001')
  })

  test('postcode filter excludes producers with no registered address', () => {
    storage.saveProducer({
      contactEmail: 'noaddress@example.com',
      companyName: 'No Address Co',
      bprn: 'BPRN-EA-2026-099999',
      registeredAddress: null,
      status: 'Approved'
    })

    const result = storage.searchPublicRegister({ postcode: 'BT1' })
    expect(result.items.every((p) => p.companyName !== 'No Address Co')).toBe(
      true
    )
  })

  test('company-name filter excludes producers with no companyName', () => {
    storage.saveProducer({
      contactEmail: 'nameless@example.com',
      companyName: null,
      bprn: 'BPRN-EA-2026-099998',
      status: 'Approved'
    })

    const result = storage.searchPublicRegister({ q: 'kelvin' })
    expect(result.items.every((p) => p.companyName !== null)).toBe(true)
  })

  test('sort handles producers with missing companyName', () => {
    storage.saveProducer({
      contactEmail: 'a-nameless@example.com',
      companyName: null,
      bprn: 'BPRN-EA-2026-099997',
      status: 'Approved'
    })
    storage.saveProducer({
      contactEmail: 'b-nameless@example.com',
      companyName: null,
      bprn: 'BPRN-EA-2026-099996',
      status: 'Approved'
    })

    expect(() => storage.searchPublicRegister({})).not.toThrow()
  })

  test('filters by postcode prefix, ignoring spaces and case', () => {
    const result = storage.searchPublicRegister({ postcode: 'bt1' })
    expect(
      result.items.every((p) =>
        p.registeredAddress.postcode
          .replace(/\s/g, '')
          .toUpperCase()
          .startsWith('BT1')
      )
    ).toBe(true)
    expect(result.items.length).toBeGreaterThan(0)
  })

  test('getPublicProducer returns the producer card or null', () => {
    const card = storage.getPublicProducer('BPRN-EA-2026-000001')
    expect(card.companyName).toBe('Acme Batteries Ltd')
    expect(card).not.toHaveProperty('primaryContact')
    expect(card).not.toHaveProperty('sicCode')

    expect(storage.getPublicProducer('BPRN-FAKE-9999-999999')).toBeNull()
  })
})

describe('reset and seed', () => {
  test('resetAllData wipes namespaced keys but leaves unrelated keys alone', () => {
    storage.setCurrentUser({ email: 'a@b.com' })
    storage.saveProducer(baseProducer())
    storage.allocateBprn({ agencyCode: 'EA', compliancePeriod: '2026' })
    globalThis.localStorage.setItem('something-else', 'keep me')

    storage.resetAllData()

    expect(storage.getCurrentUser()).toBeNull()
    expect(storage.getProducerByEmail('test@example.com')).toBeNull()
    expect(globalThis.localStorage.getItem('something-else')).toBe('keep me')
  })

  test('seedDemoData populates producers on first run and reports false on second', () => {
    expect(storage.seedDemoData()).toBe(true)
    expect(
      Object.keys(
        JSON.parse(globalThis.localStorage.getItem(STORAGE_KEYS.producers))
      )
    ).toHaveLength(seedData.producers.length)

    expect(storage.seedDemoData()).toBe(false)
  })

  test('setTimeTravelToYear stores the target year and getTimeTravelTargetYear reads it back', () => {
    expect(storage.getTimeTravelTargetYear()).toBeNull()
    storage.setTimeTravelToYear(2030)
    expect(storage.getTimeTravelTargetYear()).toBe(2030)
    storage.clearTimeTravel()
    expect(storage.getTimeTravelTargetYear()).toBeNull()
  })

  test('setTimeTravelToYear rejects non-integers and out-of-range years', () => {
    expect(() => storage.setTimeTravelToYear('abc')).toThrow()
    expect(() => storage.setTimeTravelToYear(1500)).toThrow()
    expect(() => storage.setTimeTravelToYear(99999)).toThrow()
  })

  test('getTimeTravelTargetYear returns null for malformed values', () => {
    globalThis.localStorage.setItem(
      STORAGE_KEYS.timeTravelTargetYear,
      'not-a-year'
    )
    expect(storage.getTimeTravelTargetYear()).toBeNull()
    globalThis.localStorage.setItem(STORAGE_KEYS.timeTravelTargetYear, '')
    expect(storage.getTimeTravelTargetYear()).toBeNull()
  })

  test('allocateBprn continues past the highest BPRN already in storage', () => {
    storage.seedDemoData()

    const maxByKey = {}
    for (const producer of seedData.producers) {
      const match = /^BPRN-([A-Z]+)-(\d{4})-(\d+)$/.exec(producer.bprn ?? '')
      if (!match) continue
      const [, agencyCode, compliancePeriod, sequence] = match
      const key = `${agencyCode}:${compliancePeriod}`
      const seqNumber = Number(sequence)
      if (seqNumber > (maxByKey[key] ?? 0)) {
        maxByKey[key] = seqNumber
      }
    }

    for (const [key, max] of Object.entries(maxByKey)) {
      const [agencyCode, compliancePeriod] = key.split(':')
      const next = storage.allocateBprn({ agencyCode, compliancePeriod })
      const expectedSeq = String(max + 1).padStart(6, '0')
      expect(next).toBe(`BPRN-${agencyCode}-${compliancePeriod}-${expectedSeq}`)
    }
  })
})
