// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import {
  STORAGE_KEYS,
  createProducer,
  createRegistration,
  createSubmission,
  createScheme,
  createSchemeMember,
  createQuarterlySubmission,
  createIaSubmission,
  createEvidence,
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
      (p) =>
        p.bprn != null && (p.status === 'Active' || p.status === 'Approved')
    ).length
    expect(result.totalCount).toBe(expectedCount)
    expect(result.items).toHaveLength(10)
    expect(result.totalPages).toBe(Math.ceil(expectedCount / 10))
  })

  test('omits scheme-represented producers whose BPRN has not been issued (pendingScheme)', () => {
    const scheme = storage.saveScheme({
      name: 'Pending Scheme',
      approvalStatus: 'approved'
    })
    storage.saveProducer({
      contactEmail: 'pending@x.com',
      companyName: 'Pending Co',
      bprn: null,
      status: 'Started'
    })
    const producer = storage.getProducerByEmail('pending@x.com')
    storage.saveRegistration({
      producerId: producer.id,
      compliancePeriod: '2026',
      producerRoute: 'complianceScheme',
      schemeId: scheme.id,
      status: 'pendingScheme'
    })

    const result = storage.searchPublicRegister({ q: 'Pending' })
    expect(result.items).toHaveLength(0)
    expect(storage.getPublicProducer(null)).toBeNull()
  })

  test('search filters scheme-represented producers by scheme name keyword', () => {
    const scheme = storage.saveScheme({
      name: 'Tartan Battery Scheme',
      operator: 'TBS Ltd',
      approvalNumber: 'BCS/2026/777',
      approvalStatus: 'approved'
    })
    storage.saveProducer({
      contactEmail: 'rep@x.com',
      companyName: 'Repped Producer Ltd',
      bprn: 'BPRN-SEPA-2026-099000',
      status: 'Approved'
    })
    const producer = storage.getProducerByEmail('rep@x.com')
    storage.saveRegistration({
      producerId: producer.id,
      compliancePeriod: '2026',
      producerRoute: 'complianceScheme',
      schemeId: scheme.id,
      status: 'Submitted'
    })

    const result = storage.searchPublicRegister({ q: 'tartan' })
    expect(result.items).toHaveLength(1)
    expect(result.items[0].representedBy).toBe('Tartan Battery Scheme')
    expect(result.items[0].companyName).toBe('Repped Producer Ltd')
  })

  test('search items expose representedBy as null for direct registrants', () => {
    const result = storage.searchPublicRegister({ q: 'kelvin' })
    expect(result.items[0].representedBy).toBeNull()
  })

  test('getPublicProducer returns the scheme block for a scheme-represented producer', () => {
    const scheme = storage.saveScheme({
      name: 'Detail Scheme',
      operator: 'DS Ltd',
      approvalNumber: 'BCS/2026/888',
      approvalStatus: 'approved'
    })
    storage.saveProducer({
      contactEmail: 'detail@x.com',
      companyName: 'Detail Producer',
      bprn: 'BPRN-EA-2026-099777',
      status: 'Approved'
    })
    const producer = storage.getProducerByEmail('detail@x.com')
    storage.saveRegistration({
      producerId: producer.id,
      compliancePeriod: '2026',
      producerRoute: 'complianceScheme',
      schemeId: scheme.id
    })

    const detail = storage.getPublicProducer('BPRN-EA-2026-099777')
    expect(detail.scheme).toEqual({
      name: 'Detail Scheme',
      operator: 'DS Ltd',
      approvalNumber: 'BCS/2026/888'
    })
  })

  test('getPublicProducer returns null scheme for direct producers', () => {
    const detail = storage.getPublicProducer('BPRN-EA-2026-000001')
    expect(detail.scheme).toBeNull()
  })

  test('getPublicProducer prefers the most recent scheme registration', () => {
    const oldScheme = storage.saveScheme({
      name: 'Old Scheme',
      operator: 'Old Op',
      approvalNumber: 'BCS/2025/001',
      approvalStatus: 'approved'
    })
    const newScheme = storage.saveScheme({
      name: 'New Scheme',
      operator: 'New Op',
      approvalNumber: 'BCS/2026/001',
      approvalStatus: 'approved'
    })
    storage.saveProducer({
      contactEmail: 'multi@x.com',
      companyName: 'Multi Producer',
      bprn: 'BPRN-EA-2026-099666',
      status: 'Approved'
    })
    const producer = storage.getProducerByEmail('multi@x.com')
    storage.saveRegistration({
      producerId: producer.id,
      compliancePeriod: '2025',
      producerRoute: 'complianceScheme',
      schemeId: oldScheme.id
    })
    storage.saveRegistration({
      producerId: producer.id,
      compliancePeriod: '2026',
      producerRoute: 'complianceScheme',
      schemeId: newScheme.id
    })

    expect(
      storage.getPublicProducer('BPRN-EA-2026-099666').scheme.name
    ).toBe('New Scheme')
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

  test('seedDemoData skips producers that already exist in storage', () => {
    const existing = seedData.producers[0]
    globalThis.localStorage.setItem(
      STORAGE_KEYS.producers,
      JSON.stringify({
        [existing.contactEmail]: { ...existing, companyName: 'Local edits' }
      })
    )
    expect(storage.seedDemoData()).toBe(true)
    const after = JSON.parse(
      globalThis.localStorage.getItem(STORAGE_KEYS.producers)
    )
    expect(after[existing.contactEmail].companyName).toBe('Local edits')
  })

  test('highestExistingBprnSequence ignores BPRNs lower than the current max', () => {
    globalThis.localStorage.setItem(
      STORAGE_KEYS.producers,
      JSON.stringify({
        'big@x.com': { bprn: 'BPRN-EA-2026-000005' },
        'small@x.com': { bprn: 'BPRN-EA-2026-000002' }
      })
    )
    expect(
      storage.allocateBprn({ agencyCode: 'EA', compliancePeriod: '2026' })
    ).toBe('BPRN-EA-2026-000006')
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

describe('compliance scheme factories and storage', () => {
  test('createScheme defaults', () => {
    const s = createScheme()
    expect(s.id).toMatch(/^[0-9a-f-]{36}$/)
    expect(s.approvalStatus).toBe('not-started')
    expect(s.tradingNames).toEqual([])
    expect(s.partners).toEqual([])
    expect(s.additionalFiles).toEqual([])
    expect(s.evidenceAvailable).toBe(false)
    expect(s.createdAt).toBeTruthy()
  })

  test('createScheme accepts overrides', () => {
    const s = createScheme({
      id: 's-1',
      name: 'Acme Scheme',
      approvalStatus: 'approved',
      approvalNumber: 'BCS/2026/099',
      approvedOn: '2026-01-01T00:00:00Z',
      submittedOn: '2025-12-01T00:00:00Z',
      registeredAddress: { line1: '1 St' },
      contactAddress: { line1: '2 St' },
      serviceOfNoticeAddress: { line1: '3 St' },
      operationalPlan: 'plan',
      partners: [{ name: 'p' }],
      offences: 'none',
      additionalFiles: [{ name: 'f.pdf' }],
      evidenceAvailable: true,
      tradingNames: ['ACME'],
      agencyCode: 'EA',
      compliancePeriod: '2026',
      operator: 'Acme Compliance Ltd',
      contactEmail: 'schemes@acme.test',
      webAddress: 'https://acme.test',
      createdAt: '2025-12-01T00:00:00Z',
      updatedAt: '2025-12-02T00:00:00Z'
    })
    expect(s.id).toBe('s-1')
    expect(s.name).toBe('Acme Scheme')
    expect(s.evidenceAvailable).toBe(true)
    expect(s.partners).toEqual([{ name: 'p' }])
    expect(s.agencyCode).toBe('EA')
    expect(s.compliancePeriod).toBe('2026')
    expect(s.operator).toBe('Acme Compliance Ltd')
    expect(s.contactEmail).toBe('schemes@acme.test')
    expect(s.webAddress).toBe('https://acme.test')
  })

  test('createSchemeMember defaults', () => {
    const m = createSchemeMember()
    expect(m.id).toMatch(/^[0-9a-f-]{36}$/)
    expect(m.leftOn).toBeNull()
    expect(m.joinedOn).toBeTruthy()
  })

  test('createSchemeMember accepts overrides', () => {
    const m = createSchemeMember({
      id: 'm-1',
      schemeId: 's-1',
      producerBprn: 'BPRN-EA-2026-000010',
      companyName: 'Members Ltd',
      compliancePeriod: '2026',
      joinedOn: '2026-02-01T00:00:00Z',
      leftOn: '2026-04-01T00:00:00Z',
      reasonForLeaving: 'left-the-scheme',
      replacedById: 'reg-99',
      createdAt: '2026-02-01T00:00:00Z',
      updatedAt: '2026-04-01T00:00:00Z'
    })
    expect(m.schemeId).toBe('s-1')
    expect(m.leftOn).toBe('2026-04-01T00:00:00Z')
    expect(m.compliancePeriod).toBe('2026')
    expect(m.reasonForLeaving).toBe('left-the-scheme')
    expect(m.replacedById).toBe('reg-99')
  })

  test('createQuarterlySubmission and createIaSubmission defaults', () => {
    const q = createQuarterlySubmission()
    expect(q.status).toBe('not-started')
    expect(q.quarter).toBeNull()
    expect(q.memberData).toEqual([])
    const i = createIaSubmission()
    expect(i.status).toBe('not-started')
    expect(i.memberData).toEqual([])
  })

  test('createQuarterlySubmission and createIaSubmission accept overrides', () => {
    const memberData = [{ memberId: 'm-1', producerBprn: 'BPRN-1', companyName: 'Acme', marketData: { portable: '1' }, wasteData: null }]
    const q = createQuarterlySubmission({
      id: 'q-1',
      schemeId: 's-1',
      compliancePeriodYear: 2026,
      quarter: 'Q1',
      status: 'submitted',
      memberData,
      submittedOn: '2026-04-30T00:00:00Z',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-04-30T00:00:00Z'
    })
    expect(q.quarter).toBe('Q1')
    expect(q.status).toBe('submitted')
    expect(q.memberData).toEqual(memberData)

    const iaMemberData = [{ memberId: 'm-2', producerBprn: 'BPRN-2', companyName: 'Beta', placed: { industrial: '5' }, exported: null, takenBack: null, delivered: null }]
    const i = createIaSubmission({
      id: 'i-1',
      schemeId: 's-1',
      compliancePeriodYear: 2026,
      status: 'in-progress',
      memberData: iaMemberData,
      submittedOn: null,
      createdAt: '2026-02-01T00:00:00Z',
      updatedAt: '2026-02-15T00:00:00Z'
    })
    expect(i.memberData).toEqual(iaMemberData)
    expect(i.status).toBe('in-progress')
  })

  test('createEvidence defaults and tonnes coercion', () => {
    const e = createEvidence({ tonnes: 1.25 })
    expect(e.id).toMatch(/^[0-9a-f-]{36}$/)
    expect(e.status).toBe('awaiting-acceptance')
    expect(e.tonnes).toBe('1.250')
  })

  test('createEvidence accepts overrides', () => {
    const e = createEvidence({
      id: 'e-1',
      schemeId: 's-1',
      recipientBprn: 'BPRN-EA-2026-000010',
      tonnes: '0.500',
      category: 'portable',
      status: 'accepted',
      issuedOn: '2026-05-01T00:00:00Z',
      transferDirection: 'XOUT',
      counterpartySchemeId: 's-2',
      createdAt: '2026-05-01T00:00:00Z',
      updatedAt: '2026-05-02T00:00:00Z'
    })
    expect(e.status).toBe('accepted')
    expect(e.transferDirection).toBe('XOUT')
    expect(e.tonnes).toBe('0.500')
  })

  test('saveScheme and listSchemes round-trip', () => {
    const saved = storage.saveScheme(
      createScheme({ name: 'A', approvalStatus: 'in-progress' })
    )
    expect(saved.id).toBeTruthy()
    expect(storage.listSchemes()).toHaveLength(1)
    expect(storage.getScheme(saved.id)).toEqual(saved)
    expect(storage.getScheme('missing')).toBeNull()
  })

  test('saveScheme increments version on update', () => {
    const first = storage.saveScheme(createScheme({ name: 'A' }))
    const second = storage.saveScheme({ ...first, name: 'B' })
    expect(second.id).toBe(first.id)
    expect(second.version).toBe(1)
    expect(second.name).toBe('B')
  })

  test('scheme members add and filter by status', () => {
    const scheme = storage.saveScheme(createScheme({ name: 'A' }))
    const active = storage.saveSchemeMember(
      createSchemeMember({ schemeId: scheme.id, producerBprn: 'BPRN-1' })
    )
    const left = storage.saveSchemeMember(
      createSchemeMember({
        schemeId: scheme.id,
        producerBprn: 'BPRN-2',
        leftOn: '2026-03-01T00:00:00Z'
      })
    )
    expect(storage.listSchemeMembers(scheme.id)).toHaveLength(2)
    expect(storage.listActiveSchemeMembers(scheme.id)).toHaveLength(1)
    expect(storage.listActiveSchemeMembers(scheme.id)[0].id).toBe(active.id)
    expect(storage.listSchemeMembers()).toHaveLength(2)
    expect(left.leftOn).toBe('2026-03-01T00:00:00Z')

    const updated = storage.saveSchemeMember({
      ...active,
      leftOn: '2026-04-01T00:00:00Z'
    })
    expect(updated.version).toBe(1)
    expect(storage.listActiveSchemeMembers(scheme.id)).toHaveLength(0)
  })

  test('membersForYear filters by joined and left dates against the active year', () => {
    storage.saveSchemeMember(
      createSchemeMember({
        schemeId: 's-tt',
        producerBprn: 'BPRN-1',
        joinedOn: '2026-04-01T00:00:00Z'
      })
    )
    storage.saveSchemeMember(
      createSchemeMember({
        schemeId: 's-tt',
        producerBprn: 'BPRN-2',
        joinedOn: '2027-02-01T00:00:00Z'
      })
    )
    storage.saveSchemeMember(
      createSchemeMember({
        schemeId: 's-tt',
        producerBprn: 'BPRN-3',
        joinedOn: '2026-02-01T00:00:00Z',
        leftOn: '2026-12-01T00:00:00Z'
      })
    )
    storage.saveSchemeMember(
      createSchemeMember({
        schemeId: 's-tt',
        producerBprn: 'BPRN-4',
        joinedOn: '2026-02-01T00:00:00Z',
        leftOn: '2027-04-01T00:00:00Z'
      })
    )

    const at2025 = storage.membersForYear('s-tt', '2025')
    expect(at2025.active).toHaveLength(0)
    expect(at2025.history).toHaveLength(0)

    const at2026 = storage.membersForYear('s-tt', '2026')
    expect(at2026.active.map((m) => m.producerBprn).sort()).toEqual([
      'BPRN-1',
      'BPRN-4'
    ])
    expect(at2026.history.map((m) => m.producerBprn)).toEqual(['BPRN-3'])

    const at2027 = storage.membersForYear('s-tt', '2027')
    expect(at2027.active.map((m) => m.producerBprn).sort()).toEqual([
      'BPRN-1',
      'BPRN-2'
    ])
    expect(at2027.history.map((m) => m.producerBprn).sort()).toEqual([
      'BPRN-3',
      'BPRN-4'
    ])
  })

  test('getSchemes filters by status, agencyCode and compliancePeriod', () => {
    storage.saveScheme(
      createScheme({
        name: 'EA-Approved-2026',
        approvalStatus: 'approved',
        agencyCode: 'EA',
        compliancePeriod: '2026'
      })
    )
    storage.saveScheme(
      createScheme({
        name: 'EA-Pending-2026',
        approvalStatus: 'pending',
        agencyCode: 'EA',
        compliancePeriod: '2026'
      })
    )
    storage.saveScheme(
      createScheme({
        name: 'NRW-Approved-2026',
        approvalStatus: 'approved',
        agencyCode: 'NRW',
        compliancePeriod: '2026'
      })
    )
    storage.saveScheme(
      createScheme({
        name: 'EA-Approved-2027',
        approvalStatus: 'approved',
        agencyCode: 'EA',
        compliancePeriod: '2027'
      })
    )

    const approvedDefault = storage.getSchemes()
    expect(approvedDefault.map((s) => s.name).sort()).toEqual([
      'EA-Approved-2026',
      'EA-Approved-2027',
      'NRW-Approved-2026'
    ])

    expect(
      storage
        .getSchemes({ agencyCode: 'EA', compliancePeriod: '2026' })
        .map((s) => s.name)
    ).toEqual(['EA-Approved-2026'])

    expect(storage.getSchemes({ status: 'pending' }).map((s) => s.name)).toEqual(
      ['EA-Pending-2026']
    )

    expect(storage.getSchemes({ status: null })).toHaveLength(4)
  })

  test('getSchemeById is an alias for getScheme', () => {
    const s = storage.saveScheme(createScheme({ name: 'Alias' }))
    expect(storage.getSchemeById(s.id)).toEqual(s)
    expect(storage.getSchemeById('missing')).toBeNull()
  })

  test('getCurrentSchemeId returns null when nothing is set', () => {
    expect(storage.getCurrentSchemeId()).toBeNull()
  })

  test('setCurrentSchemeId / getCurrentSchemeId / clearCurrentSchemeId roundtrip', () => {
    storage.setCurrentSchemeId('22222222-0001-4000-a000-000000000001')
    expect(storage.getCurrentSchemeId()).toBe(
      '22222222-0001-4000-a000-000000000001'
    )
    storage.clearCurrentSchemeId()
    expect(storage.getCurrentSchemeId()).toBeNull()
  })

  test('currentScheme returns null when no id is set', () => {
    expect(storage.currentScheme()).toBeNull()
  })

  test('currentScheme returns null when the stored id points at a missing scheme', () => {
    storage.setCurrentSchemeId('does-not-exist')
    expect(storage.currentScheme()).toBeNull()
  })

  test('currentScheme returns the scheme when id and record exist', () => {
    const s = storage.saveScheme(createScheme({ name: 'Current' }))
    storage.setCurrentSchemeId(s.id)
    expect(storage.currentScheme()).toEqual(s)
  })

  test('getActiveSchemeMembership returns the open membership and null otherwise', () => {
    storage.saveSchemeMember(
      createSchemeMember({
        schemeId: 's-x',
        producerBprn: 'BPRN-EA-2026-000050',
        compliancePeriod: '2026',
        joinedOn: '2026-02-01T00:00:00Z'
      })
    )
    storage.saveSchemeMember(
      createSchemeMember({
        schemeId: 's-x',
        producerBprn: 'BPRN-EA-2026-000050',
        compliancePeriod: '2025',
        joinedOn: '2025-02-01T00:00:00Z',
        leftOn: '2025-12-31T00:00:00Z'
      })
    )

    const active = storage.getActiveSchemeMembership(
      'BPRN-EA-2026-000050',
      '2026'
    )
    expect(active?.compliancePeriod).toBe('2026')

    expect(
      storage.getActiveSchemeMembership('BPRN-EA-2026-000050', '2025')
    ).toBeNull()
    expect(
      storage.getActiveSchemeMembership('BPRN-EA-2026-000050')
    ).not.toBeNull()
    expect(storage.getActiveSchemeMembership('BPRN-NONE')).toBeNull()
  })

  test('getSchemeMembershipHistory returns all memberships newest first', () => {
    storage.saveSchemeMember(
      createSchemeMember({
        schemeId: 's-h',
        producerBprn: 'BPRN-EA-2026-000051',
        compliancePeriod: '2025',
        joinedOn: '2025-02-01T00:00:00Z',
        leftOn: '2025-12-31T00:00:00Z'
      })
    )
    storage.saveSchemeMember(
      createSchemeMember({
        schemeId: 's-h',
        producerBprn: 'BPRN-EA-2026-000051',
        compliancePeriod: '2026',
        joinedOn: '2026-02-01T00:00:00Z'
      })
    )

    const history = storage.getSchemeMembershipHistory('BPRN-EA-2026-000051')
    expect(history).toHaveLength(2)
    expect(history[0].compliancePeriod).toBe('2026')
    expect(history[1].compliancePeriod).toBe('2025')

    expect(storage.getSchemeMembershipHistory('BPRN-NONE')).toEqual([])
  })

  test('joinScheme creates a new membership and is idempotent on (bprn, period)', () => {
    const first = storage.joinScheme({
      producerBprn: 'BPRN-EA-2026-000052',
      schemeId: 's-j',
      compliancePeriod: '2026',
      companyName: 'Joiner Ltd'
    })
    expect(first.schemeId).toBe('s-j')
    expect(first.leftOn).toBeNull()

    const sameAgain = storage.joinScheme({
      producerBprn: 'BPRN-EA-2026-000052',
      schemeId: 's-j',
      compliancePeriod: '2026'
    })
    expect(sameAgain.id).toBe(first.id)

    const differentScheme = storage.joinScheme({
      producerBprn: 'BPRN-EA-2026-000052',
      schemeId: 's-other',
      compliancePeriod: '2026'
    })
    expect(differentScheme.id).not.toBe(first.id)

    const noCompanyName = storage.joinScheme({
      producerBprn: 'BPRN-EA-2026-000053',
      schemeId: 's-j',
      compliancePeriod: '2026'
    })
    expect(noCompanyName.companyName).toBeNull()
  })

  test('leaveScheme closes the active membership and returns null when none', () => {
    storage.joinScheme({
      producerBprn: 'BPRN-EA-2026-000054',
      schemeId: 's-l',
      compliancePeriod: '2026',
      companyName: 'Leaver Ltd'
    })

    const left = storage.leaveScheme({
      producerBprn: 'BPRN-EA-2026-000054',
      compliancePeriod: '2026',
      reasonForLeaving: 'switching-scheme'
    })
    expect(left?.leftOn).toBeTruthy()
    expect(left?.reasonForLeaving).toBe('switching-scheme')

    expect(
      storage.getActiveSchemeMembership('BPRN-EA-2026-000054', '2026')
    ).toBeNull()

    expect(
      storage.leaveScheme({
        producerBprn: 'BPRN-NONE',
        compliancePeriod: '2026'
      })
    ).toBeNull()

    storage.joinScheme({
      producerBprn: 'BPRN-EA-2026-000055',
      schemeId: 's-l',
      compliancePeriod: '2026'
    })
    const noReason = storage.leaveScheme({
      producerBprn: 'BPRN-EA-2026-000055',
      compliancePeriod: '2026'
    })
    expect(noReason?.reasonForLeaving).toBeNull()
  })

  test('joinScheme with status pendingAcceptance does not set acceptedOn', () => {
    const m = storage.joinScheme({
      producerBprn: null,
      producerEmail: 'pending@x.com',
      schemeId: 's-pending',
      compliancePeriod: '2026',
      status: 'pendingAcceptance'
    })
    expect(m.status).toBe('pendingAcceptance')
    expect(m.acceptedOn).toBeNull()
    expect(m.producerEmail).toBe('pending@x.com')
  })

  test('joinScheme deduplicates pending memberships by producerEmail when bprn is null', () => {
    const first = storage.joinScheme({
      producerBprn: null,
      producerEmail: 'dup@x.com',
      schemeId: 's-dedup',
      compliancePeriod: '2026',
      status: 'pendingAcceptance'
    })
    const second = storage.joinScheme({
      producerBprn: null,
      producerEmail: 'dup@x.com',
      schemeId: 's-dedup',
      compliancePeriod: '2026',
      status: 'pendingAcceptance'
    })
    expect(second.id).toBe(first.id)
  })

  test('listPendingSchemeMembers returns only pending entries for a scheme', () => {
    storage.saveSchemeMember(
      createSchemeMember({
        schemeId: 's-pending',
        producerEmail: 'p1@x.com',
        compliancePeriod: '2026',
        status: 'pendingAcceptance'
      })
    )
    storage.saveSchemeMember(
      createSchemeMember({
        schemeId: 's-pending',
        producerBprn: 'BPRN-EA-2026-000060',
        compliancePeriod: '2026',
        status: 'active'
      })
    )
    storage.saveSchemeMember(
      createSchemeMember({
        schemeId: 's-other',
        producerEmail: 'other@x.com',
        compliancePeriod: '2026',
        status: 'pendingAcceptance'
      })
    )
    const list = storage.listPendingSchemeMembers('s-pending')
    expect(list).toHaveLength(1)
    expect(list[0].producerEmail).toBe('p1@x.com')
  })

  test('acceptSchemeMember allocates a BPRN, flips status to active, and updates the producer', () => {
    storage.saveProducer({
      contactEmail: 'accept@x.com',
      companyName: 'Accept Co',
      registeredAddress: { postcode: 'M1 4AA' },
      agencyCode: 'EA'
    })
    const producer = storage.getProducerByEmail('accept@x.com')
    storage.saveRegistration({
      producerId: producer.id,
      compliancePeriod: '2026',
      producerRoute: 'complianceScheme',
      status: 'pendingScheme'
    })
    const scheme = storage.saveScheme({ agencyCode: 'EA' })
    const member = storage.joinScheme({
      producerBprn: null,
      producerEmail: 'accept@x.com',
      schemeId: scheme.id,
      compliancePeriod: '2026',
      companyName: 'Accept Co',
      status: 'pendingAcceptance'
    })

    const accepted = storage.acceptSchemeMember(member.id, { agencyCode: 'EA' })
    expect(accepted.status).toBe('active')
    expect(accepted.producerBprn).toMatch(/^BPRN-EA-2026-/)
    const updatedProducer = storage.getProducerByEmail('accept@x.com')
    expect(updatedProducer.bprn).toBe(accepted.producerBprn)
    expect(updatedProducer.status).toBe('Approved')
    const reg = storage
      .listRegistrationsForProducer(producer.id)
      .find((r) => r.compliancePeriod === '2026')
    expect(reg.status).toBe('Submitted')
  })

  test('acceptSchemeMember on an already-accepted member returns null', () => {
    const m = storage.saveSchemeMember(
      createSchemeMember({
        schemeId: 's',
        compliancePeriod: '2026',
        status: 'active'
      })
    )
    expect(storage.acceptSchemeMember(m.id)).toBeNull()
    expect(storage.acceptSchemeMember('missing-id')).toBeNull()
  })

  test('acceptSchemeMember reuses an existing producer BPRN when present', () => {
    const m = storage.saveSchemeMember(
      createSchemeMember({
        schemeId: 's',
        producerBprn: 'BPRN-EA-2026-999999',
        compliancePeriod: '2026',
        status: 'pendingAcceptance'
      })
    )
    const accepted = storage.acceptSchemeMember(m.id)
    expect(accepted.producerBprn).toBe('BPRN-EA-2026-999999')
    expect(accepted.status).toBe('active')
  })

  test('acceptSchemeMember without a producer record still allocates a BPRN on the member', () => {
    const m = storage.saveSchemeMember(
      createSchemeMember({
        schemeId: 's',
        producerEmail: 'ghost@x.com',
        compliancePeriod: '2026',
        status: 'pendingAcceptance'
      })
    )
    const accepted = storage.acceptSchemeMember(m.id, { agencyCode: 'NRW' })
    expect(accepted.producerBprn).toMatch(/^BPRN-NRW-2026-/)
  })

  test('acceptSchemeMember allocates a BPRN even with no producerEmail or producerBprn', () => {
    const m = storage.saveSchemeMember(
      createSchemeMember({
        schemeId: 's',
        compliancePeriod: '2026',
        status: 'pendingAcceptance'
      })
    )
    const accepted = storage.acceptSchemeMember(m.id)
    expect(accepted.producerBprn).toMatch(/^BPRN-EA-2026-/)
  })

  test('rejectSchemeMember closes a pending membership', () => {
    const m = storage.saveSchemeMember(
      createSchemeMember({
        schemeId: 's',
        producerEmail: 'reject@x.com',
        compliancePeriod: '2026',
        status: 'pendingAcceptance'
      })
    )
    const rejected = storage.rejectSchemeMember(m.id, 'not-eligible')
    expect(rejected.status).toBe('rejected')
    expect(rejected.leftOn).toBeTruthy()
    expect(rejected.reasonForLeaving).toBe('not-eligible')
  })

  test('transitionToDirect reuses the producer existing BPRN when present', () => {
    storage.saveProducer({
      contactEmail: 't1@x.com',
      companyName: 'T1 Co',
      bprn: 'BPRN-EA-2026-088001',
      registeredAddress: { postcode: 'M1 4AA' },
      agencyCode: 'EA',
      status: 'Approved'
    })
    const producer = storage.getProducerByEmail('t1@x.com')
    const scheme = storage.saveScheme({ name: 'T1 Scheme' })
    const oldReg = storage.saveRegistration({
      producerId: producer.id,
      compliancePeriod: '2026',
      producerRoute: 'complianceScheme',
      schemeId: scheme.id,
      status: 'Submitted'
    })
    storage.joinScheme({
      producerBprn: producer.bprn,
      producerEmail: 't1@x.com',
      schemeId: scheme.id,
      compliancePeriod: '2026',
      status: 'active'
    })

    const result = storage.transitionToDirect({
      producerEmail: 't1@x.com',
      compliancePeriod: '2026',
      reasonForLeaving: 'joinedAnotherScheme'
    })

    expect(result.bprn).toBe('BPRN-EA-2026-088001')
    expect(result.registration.producerRoute).toBe('directRegistrant')
    expect(result.registration.replacesId).toBe(oldReg.id)
    expect(storage.getRegistration(oldReg.id).status).toBe('superseded')
    const closedMember = storage
      .listSchemeMembers(scheme.id)
      .find((m) => m.producerBprn === 'BPRN-EA-2026-088001')
    expect(closedMember.leftOn).toBeTruthy()
    expect(closedMember.reasonForLeaving).toBe('joinedAnotherScheme')
  })

  test('transitionToDirect allocates a fresh BPRN when producer has none', () => {
    storage.saveProducer({
      contactEmail: 't2@x.com',
      companyName: 'T2 Co',
      agencyCode: 'NRW',
      registeredAddress: { postcode: 'CF10 3AT' },
      status: 'Started'
    })
    const producer = storage.getProducerByEmail('t2@x.com')
    const scheme = storage.saveScheme({ name: 'T2 Scheme' })
    storage.saveRegistration({
      producerId: producer.id,
      compliancePeriod: '2026',
      producerRoute: 'complianceScheme',
      schemeId: scheme.id,
      status: 'pendingScheme'
    })

    const result = storage.transitionToDirect({
      producerEmail: 't2@x.com',
      compliancePeriod: '2026',
      reasonForLeaving: 'belowThreshold'
    })

    expect(result.bprn).toMatch(/^BPRN-NRW-2026-/)
    expect(result.producer.bprn).toBe(result.bprn)
  })

  test('transitionToDirect with other reason stores the free text after a colon', () => {
    storage.saveProducer({
      contactEmail: 't3@x.com',
      companyName: 'T3 Co',
      bprn: 'BPRN-EA-2026-088003',
      agencyCode: 'EA',
      status: 'Approved'
    })
    const producer = storage.getProducerByEmail('t3@x.com')
    const scheme = storage.saveScheme({ name: 'T3 Scheme' })
    storage.saveRegistration({
      producerId: producer.id,
      compliancePeriod: '2026',
      producerRoute: 'complianceScheme',
      schemeId: scheme.id,
      status: 'Submitted'
    })
    storage.joinScheme({
      producerBprn: producer.bprn,
      schemeId: scheme.id,
      compliancePeriod: '2026',
      status: 'active'
    })

    storage.transitionToDirect({
      producerEmail: 't3@x.com',
      compliancePeriod: '2026',
      reasonForLeaving: 'other',
      otherReason: 'Closing UK arm'
    })

    const closedMember = storage
      .listSchemeMembers(scheme.id)
      .find((m) => m.producerBprn === 'BPRN-EA-2026-088003')
    expect(closedMember.reasonForLeaving).toBe('other:Closing UK arm')
  })

  test('transitionToDirect returns null for an unknown producer email', () => {
    expect(
      storage.transitionToDirect({
        producerEmail: 'nobody@x.com',
        compliancePeriod: '2026',
        reasonForLeaving: 'ceasedTrading'
      })
    ).toBeNull()
  })

  test('transitionToDirect returns null when there is no active scheme registration', () => {
    storage.saveProducer({
      contactEmail: 't4@x.com',
      companyName: 'T4 Co',
      status: 'Approved',
      bprn: 'BPRN-EA-2026-088004',
      agencyCode: 'EA'
    })
    const producer = storage.getProducerByEmail('t4@x.com')
    storage.saveRegistration({
      producerId: producer.id,
      compliancePeriod: '2026',
      producerRoute: 'directRegistrant',
      status: 'Submitted'
    })

    expect(
      storage.transitionToDirect({
        producerEmail: 't4@x.com',
        compliancePeriod: '2026',
        reasonForLeaving: 'ceasedTrading'
      })
    ).toBeNull()
  })

  test('transitionToDirect with a producer missing agencyCode allocates under EA', () => {
    storage.saveProducer({
      contactEmail: 't5@x.com',
      companyName: 'T5 Co',
      status: 'Started'
    })
    const producer = storage.getProducerByEmail('t5@x.com')
    const scheme = storage.saveScheme({ name: 'T5 Scheme' })
    storage.saveRegistration({
      producerId: producer.id,
      compliancePeriod: '2026',
      producerRoute: 'complianceScheme',
      schemeId: scheme.id,
      status: 'pendingScheme'
    })

    const result = storage.transitionToDirect({
      producerEmail: 't5@x.com',
      compliancePeriod: '2026',
      reasonForLeaving: 'belowThreshold'
    })
    expect(result.bprn).toMatch(/^BPRN-EA-2026-/)
  })

  test('rejectSchemeMember returns null for unknown or already-accepted members', () => {
    const accepted = storage.saveSchemeMember(
      createSchemeMember({
        schemeId: 's',
        status: 'active'
      })
    )
    expect(storage.rejectSchemeMember(accepted.id)).toBeNull()
    expect(storage.rejectSchemeMember('missing-id')).toBeNull()
  })

  test('quarterly submissions filter by scheme and year', () => {
    const a = storage.saveQuarterlySubmission(
      createQuarterlySubmission({
        schemeId: 's-1',
        compliancePeriodYear: 2026,
        quarter: 'Q1',
        status: 'submitted'
      })
    )
    storage.saveQuarterlySubmission(
      createQuarterlySubmission({
        schemeId: 's-1',
        compliancePeriodYear: 2025,
        quarter: 'Q4',
        status: 'submitted'
      })
    )
    storage.saveQuarterlySubmission(
      createQuarterlySubmission({
        schemeId: 's-2',
        compliancePeriodYear: 2026,
        quarter: 'Q1',
        status: 'in-progress'
      })
    )
    expect(storage.listQuarterlySubmissions('s-1', 2026)).toHaveLength(1)
    expect(storage.listQuarterlySubmissions('s-1')).toHaveLength(2)
    expect(storage.listQuarterlySubmissions(null, 2026)).toHaveLength(2)
    expect(storage.listQuarterlySubmissions()).toHaveLength(3)

    const updated = storage.saveQuarterlySubmission({
      ...a,
      status: 'in-progress'
    })
    expect(updated.id).toBe(a.id)
    expect(updated.status).toBe('in-progress')
  })

  test('ia submissions filter by scheme and year', () => {
    const a = storage.saveIaSubmission(
      createIaSubmission({
        schemeId: 's-1',
        compliancePeriodYear: 2026,
        status: 'submitted'
      })
    )
    storage.saveIaSubmission(
      createIaSubmission({
        schemeId: 's-2',
        compliancePeriodYear: 2026,
        status: 'in-progress'
      })
    )
    expect(storage.listIaSubmissions('s-1', 2026)).toHaveLength(1)
    expect(storage.listIaSubmissions('s-1')).toHaveLength(1)
    expect(storage.listIaSubmissions(null, 2026)).toHaveLength(2)
    expect(storage.listIaSubmissions()).toHaveLength(2)

    const updated = storage.saveIaSubmission({ ...a, status: 'in-progress' })
    expect(updated.status).toBe('in-progress')
  })

  test('evidence storage round-trip and filter by scheme', () => {
    storage.saveEvidence(
      createEvidence({ schemeId: 's-1', tonnes: 2.5, status: 'accepted' })
    )
    storage.saveEvidence(createEvidence({ schemeId: 's-2', tonnes: 1.5 }))
    expect(storage.listEvidence('s-1')).toHaveLength(1)
    expect(storage.listEvidence('s-1')[0].tonnes).toBe('2.500')
    expect(storage.listEvidence()).toHaveLength(2)

    const [item] = storage.listEvidence('s-1')
    const updated = storage.saveEvidence({ ...item, status: 'awaiting-acceptance' })
    expect(updated.status).toBe('awaiting-acceptance')
    expect(updated.tonnes).toBe('2.500')
  })

  test('listEvidence filters by compliancePeriodYear', () => {
    storage.saveEvidence(
      createEvidence({
        schemeId: 's-y',
        compliancePeriodYear: '2026',
        tonnes: '1',
        category: 'portable',
        status: 'accepted'
      })
    )
    storage.saveEvidence(
      createEvidence({
        schemeId: 's-y',
        compliancePeriodYear: '2027',
        tonnes: '5',
        category: 'portable',
        status: 'accepted'
      })
    )
    expect(storage.listEvidence('s-y', '2026')).toHaveLength(1)
    expect(storage.listEvidence('s-y', '2027')).toHaveLength(1)
    expect(storage.listEvidence(null, '2026')).toHaveLength(1)
    expect(storage.listEvidence('s-y')).toHaveLength(2)
  })

  test('findEvidence returns the record by id or null', () => {
    const saved = storage.saveEvidence(
      createEvidence({ schemeId: 's-y', tonnes: '1', category: 'portable' })
    )
    expect(storage.findEvidence(saved.id)).toEqual(saved)
    expect(storage.findEvidence('missing')).toBeNull()
  })

  test('updateEvidenceStatus mutates an existing record', () => {
    const saved = storage.saveEvidence(
      createEvidence({
        schemeId: 's-y',
        compliancePeriodYear: '2026',
        tonnes: '1',
        category: 'portable',
        status: 'awaiting-acceptance'
      })
    )
    const accepted = storage.updateEvidenceStatus(saved.id, 'accepted')
    expect(accepted.status).toBe('accepted')
    expect(accepted.id).toBe(saved.id)
    expect(storage.updateEvidenceStatus('missing', 'accepted')).toBeNull()
  })

  test('transferEvidence sets XOUT and counterparty on an existing record', () => {
    const saved = storage.saveEvidence(
      createEvidence({
        schemeId: 's-y',
        compliancePeriodYear: '2026',
        tonnes: '1',
        category: 'portable',
        status: 'awaiting-acceptance'
      })
    )
    const transferred = storage.transferEvidence(saved.id, 'cp-1')
    expect(transferred.transferDirection).toBe('XOUT')
    expect(transferred.counterpartySchemeId).toBe('cp-1')
    expect(transferred.status).toBe('awaiting-authorisation')
    expect(storage.transferEvidence('missing', 'cp-1')).toBeNull()
  })

  test('setEvidenceAvailability flips the flag on an existing scheme', () => {
    const scheme = storage.saveScheme(createScheme({ evidenceAvailable: true }))
    const updated = storage.setEvidenceAvailability(scheme.id, false)
    expect(updated.evidenceAvailable).toBe(false)
    expect(storage.setEvidenceAvailability('missing', true)).toBeNull()
  })

  test('sumByCategory groups by portable/industrial/automotive and ignores others', () => {
    expect(
      storage.sumByCategory([
        { category: 'portable', tonnes: '1.5' },
        { category: 'portable', tonnes: '0.5' },
        { category: 'industrial', tonnes: '3' },
        { category: 'automotive', tonnes: '2' },
        { category: 'other', tonnes: '999' },
        { category: 'portable', tonnes: 'not-a-number' }
      ])
    ).toEqual({ portable: 2, industrial: 3, automotive: 2 })
  })

  test('seedDemoData seeds schemes once and respects existing entries', () => {
    expect(storage.seedDemoData()).toBe(true)
    expect(storage.listSchemes().length).toBeGreaterThanOrEqual(4)
    expect(storage.seedDemoData()).toBe(false)
  })

  test('seedDemoData seeds the EA-registered compliance schemes from the public register', () => {
    storage.seedDemoData()
    const names = storage.listSchemes().map((s) => s.name)
    expect(names).toEqual(
      expect.arrayContaining(['BatteryBack', 'ERP UK Ltd', 'Valpak Ltd'])
    )
    const statuses = new Set(storage.listSchemes().map((s) => s.approvalStatus))
    expect(statuses.has('approved')).toBe(true)
  })


  test('seedDemoData skips schemes that already exist', () => {
    const [first] = seedData.schemes
    globalThis.localStorage.setItem(
      STORAGE_KEYS.schemes,
      JSON.stringify({ [first.id]: { ...first, name: 'Renamed locally' } })
    )
    storage.seedDemoData()
    const stored = storage.getScheme(first.id)
    expect(stored.name).toBe('Renamed locally')
  })

  test('saveScheme and saveSchemeMember allocate ids when not provided', () => {
    const scheme = storage.saveScheme({ name: 'Bare scheme' })
    expect(scheme.id).toMatch(/^[0-9a-f-]{36}$/)
    const member = storage.saveSchemeMember({
      schemeId: scheme.id,
      producerBprn: 'BPRN-9'
    })
    expect(member.id).toMatch(/^[0-9a-f-]{36}$/)
  })

  test('saveQuarterlySubmission and saveIaSubmission allocate ids when not provided', () => {
    const q = storage.saveQuarterlySubmission({
      schemeId: 's-x',
      compliancePeriodYear: 2026,
      quarter: 'Q1',
      status: 'not-started'
    })
    expect(q.id).toMatch(/^[0-9a-f-]{36}$/)
    const i = storage.saveIaSubmission({
      schemeId: 's-x',
      compliancePeriodYear: 2026,
      status: 'not-started'
    })
    expect(i.id).toMatch(/^[0-9a-f-]{36}$/)
  })

  test('saveEvidence allocates an id when not provided', () => {
    const saved = storage.saveEvidence({
      schemeId: 's-99',
      tonnes: '3.000',
      status: 'awaiting-acceptance'
    })
    expect(saved.id).toMatch(/^[0-9a-f-]{36}$/)
    expect(saved.tonnes).toBe('3.000')
  })

  test('STORAGE_KEYS exposes new collection keys', () => {
    expect(STORAGE_KEYS.schemes).toBe('npwd-batteries:schemes')
    expect(STORAGE_KEYS.schemeMembers).toBe('npwd-batteries:schemeMembers')
    expect(STORAGE_KEYS.quarterlySubmissions).toBe(
      'npwd-batteries:quarterlySubmissions'
    )
    expect(STORAGE_KEYS.iaSubmissions).toBe('npwd-batteries:iaSubmissions')
    expect(STORAGE_KEYS.evidence).toBe('npwd-batteries:evidence')
  })

  test('findQuarterlySubmission returns the matching record or null', () => {
    storage.saveQuarterlySubmission(
      createQuarterlySubmission({
        schemeId: 's-1',
        compliancePeriodYear: '2026',
        quarter: 'Q1',
        status: 'submitted'
      })
    )
    expect(
      storage.findQuarterlySubmission('s-1', '2026', 'Q1').status
    ).toBe('submitted')
    expect(storage.findQuarterlySubmission('s-1', '2026', 'Q2')).toBeNull()
  })

  test('upsertQuarterlySubmission creates then updates the same record', () => {
    const memberData = [{ memberId: 'm-1', producerBprn: 'B-1', companyName: 'Acme', marketData: null, wasteData: null }]
    const first = storage.upsertQuarterlySubmission('s-1', '2026', 'Q1', {
      memberData
    })
    expect(first.status).toBe('in-progress')
    expect(first.memberData).toEqual(memberData)
    const second = storage.upsertQuarterlySubmission('s-1', '2026', 'Q1', {
      status: 'submitted'
    })
    expect(second.id).toBe(first.id)
    expect(second.memberData).toEqual(memberData)
    expect(second.status).toBe('submitted')
    expect(storage.listQuarterlySubmissions('s-1', '2026')).toHaveLength(1)
  })

  test('upsertQuarterlySubmission scopes records by year', () => {
    storage.upsertQuarterlySubmission('s-1', '2026', 'Q1', {
      memberData: [{ memberId: 'm-1', companyName: 'A' }]
    })
    storage.upsertQuarterlySubmission('s-1', '2027', 'Q1', {
      memberData: [{ memberId: 'm-2', companyName: 'B' }]
    })
    expect(
      storage.findQuarterlySubmission('s-1', '2026', 'Q1').memberData[0].companyName
    ).toBe('A')
    expect(
      storage.findQuarterlySubmission('s-1', '2027', 'Q1').memberData[0].companyName
    ).toBe('B')
  })

  test('findIaSubmission returns the matching record or null', () => {
    storage.saveIaSubmission(
      createIaSubmission({
        schemeId: 's-1',
        compliancePeriodYear: '2026',
        status: 'submitted'
      })
    )
    expect(storage.findIaSubmission('s-1', '2026').status).toBe('submitted')
    expect(storage.findIaSubmission('s-1', '2027')).toBeNull()
  })

  test('upsertIaSubmission creates then updates the same record per year', () => {
    const memberData = [{ memberId: 'm-1', producerBprn: 'B-1', companyName: 'Acme', placed: null, exported: null, takenBack: null, delivered: null }]
    const first = storage.upsertIaSubmission('s-1', '2026', { memberData })
    expect(first.status).toBe('in-progress')
    expect(first.memberData).toEqual(memberData)
    const second = storage.upsertIaSubmission('s-1', '2026', {
      status: 'submitted'
    })
    expect(second.id).toBe(first.id)
    expect(second.memberData).toEqual(memberData)

    storage.upsertIaSubmission('s-1', '2027', {
      memberData: [{ memberId: 'm-2', companyName: 'Beta' }]
    })
    expect(storage.findIaSubmission('s-1', '2026').memberData[0].companyName).toBe('Acme')
    expect(storage.findIaSubmission('s-1', '2027').memberData[0].companyName).toBe('Beta')
  })

  test('upsertQuarterlyMemberTonnage returns null when no submission exists', () => {
    expect(
      storage.upsertQuarterlyMemberTonnage('s-1', '2026', 'Q1', 'm-1', {
        marketData: { portable: '1', industrial: '0', automotive: '0' }
      })
    ).toBeNull()
  })

  test('upsertIaMemberTonnage returns null when no submission exists', () => {
    expect(
      storage.upsertIaMemberTonnage('s-1', '2026', 'm-1', {
        placed: { industrial: '1', automotive: '0' }
      })
    ).toBeNull()
  })
})
