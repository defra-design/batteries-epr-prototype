// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import {
  STORAGE_KEYS,
  AGENCIES,
  createProducer,
  createRegistration,
  createSubmission,
  createScheme,
  createSchemeMember,
  createQuarterlySubmission,
  createIaSubmission,
  createEvidence,
  createOperator,
  createOperatorQuarterlyReturn,
  createOperatorAnnualReturn,
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

    expect(storage.getPublicProducer('BPRN-EA-2026-099666').scheme.name).toBe(
      'New Scheme'
    )
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
    const memberData = [
      {
        memberId: 'm-1',
        producerBprn: 'BPRN-1',
        companyName: 'Acme',
        marketData: { portable: '1' },
        wasteData: null
      }
    ]
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

    const iaMemberData = [
      {
        memberId: 'm-2',
        producerBprn: 'BPRN-2',
        companyName: 'Beta',
        placed: { industrial: '5' },
        exported: null,
        takenBack: null,
        delivered: null
      }
    ]
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

  test('saveOperator and listOperators round-trip', () => {
    const saved = storage.saveOperator(
      createOperator({ name: 'Test ABTO', approvalType: 'abto' })
    )
    expect(saved.id).toBeTruthy()
    expect(storage.listOperators()).toHaveLength(1)
    expect(storage.getOperator(saved.id)).toEqual(saved)
    expect(storage.getOperator('missing')).toBeNull()
  })

  test('saveOperator increments version on update', () => {
    const first = storage.saveOperator(createOperator({ name: 'A' }))
    const second = storage.saveOperator({ ...first, name: 'B' })
    expect(second.id).toBe(first.id)
    expect(second.version).toBe(1)
    expect(second.name).toBe('B')
  })

  test('currentOperator returns null when no operator selected', () => {
    expect(storage.currentOperator()).toBeNull()
    expect(storage.getCurrentOperatorId()).toBeNull()
  })

  test('setCurrentOperatorId and currentOperator round-trip', () => {
    const op = storage.saveOperator(
      createOperator({ name: 'Test ABE', approvalType: 'abe' })
    )
    storage.setCurrentOperatorId(op.id)
    expect(storage.getCurrentOperatorId()).toBe(op.id)
    expect(storage.currentOperator()).toEqual(op)
    storage.clearCurrentOperatorId()
    expect(storage.getCurrentOperatorId()).toBeNull()
    expect(storage.currentOperator()).toBeNull()
  })

  test('createOperator defaults', () => {
    const op = createOperator()
    expect(op.approvalType).toBe('abto')
    expect(op.approvalStatus).toBe('not-started')
    expect(op.schemeId).toBeNull()
    expect(op.schemeApprovalStatus).toBeNull()
    expect(op.batteryTypes).toEqual({
      isPortable: false,
      isIndustrial: false,
      isAutomotive: false
    })
    expect(op.sites).toEqual([])
  })

  test('seedDemoData seeds operators', () => {
    storage.seedDemoData()
    const operators = storage.listOperators()
    expect(operators.length).toBeGreaterThanOrEqual(3)
    expect(operators.some((o) => o.approvalType === 'abto')).toBe(true)
    expect(operators.some((o) => o.approvalType === 'abe')).toBe(true)
  })

  test('approveOperatorForScheme / rejectOperatorForScheme set the scheme approval', () => {
    const op = storage.saveOperator(
      createOperator({ schemeId: 's-1', schemeApprovalStatus: 'pending' })
    )
    expect(storage.approveOperatorForScheme(op.id).schemeApprovalStatus).toBe(
      'approved'
    )
    expect(storage.rejectOperatorForScheme(op.id).schemeApprovalStatus).toBe(
      'rejected'
    )
    expect(storage.approveOperatorForScheme('missing')).toBeNull()
    expect(storage.rejectOperatorForScheme('missing')).toBeNull()
  })

  test('listPendingOperatorsForScheme returns submitted/approved pending operators for the scheme', () => {
    const pending = storage.saveOperator(
      createOperator({
        schemeId: 's-1',
        schemeApprovalStatus: 'pending',
        approvalStatus: 'submitted'
      })
    )
    storage.saveOperator(
      createOperator({
        schemeId: 's-1',
        schemeApprovalStatus: 'pending',
        approvalStatus: 'in-progress'
      })
    )
    storage.saveOperator(
      createOperator({
        schemeId: 's-2',
        schemeApprovalStatus: 'pending',
        approvalStatus: 'submitted'
      })
    )
    const rows = storage.listPendingOperatorsForScheme('s-1')
    expect(rows).toHaveLength(1)
    expect(rows[0].id).toBe(pending.id)
  })

  test('listApprovedOperatorsForScheme returns scheme-approved operators for the scheme', () => {
    const approved = storage.saveOperator(
      createOperator({ schemeId: 's-1', schemeApprovalStatus: 'approved' })
    )
    storage.saveOperator(
      createOperator({ schemeId: 's-1', schemeApprovalStatus: 'pending' })
    )
    const rows = storage.listApprovedOperatorsForScheme('s-1')
    expect(rows).toHaveLength(1)
    expect(rows[0].id).toBe(approved.id)
  })

  test('listApprovedOperators requires regulator approval and no pending/rejected scheme approval', () => {
    const seeded = storage.saveOperator(
      createOperator({ name: 'Seeded', approvalStatus: 'approved' })
    )
    const dualApproved = storage.saveOperator(
      createOperator({
        name: 'Dual',
        approvalStatus: 'approved',
        schemeApprovalStatus: 'approved'
      })
    )
    storage.saveOperator(
      createOperator({
        name: 'Scheme pending',
        approvalStatus: 'approved',
        schemeApprovalStatus: 'pending'
      })
    )
    storage.saveOperator(
      createOperator({
        name: 'Regulator pending',
        approvalStatus: 'submitted',
        schemeApprovalStatus: 'approved'
      })
    )
    const ids = storage.listApprovedOperators().map((o) => o.id)
    expect(ids).toContain(seeded.id)
    expect(ids).toContain(dualApproved.id)
    expect(ids).toHaveLength(2)
  })

  test('createEvidence includes operator fields', () => {
    const e = createEvidence({
      issuedByOperatorId: 'op-1',
      issuedByApprovalNumber: 'ABTO-001',
      issuedBySiteName: 'Site',
      wasteReceivedFrom: '2026-01-01',
      wasteReceivedTo: '2026-03-31',
      direction: 'operator-to-scheme'
    })
    expect(e.issuedByOperatorId).toBe('op-1')
    expect(e.direction).toBe('operator-to-scheme')
    expect(e.wasteReceivedFrom).toBe('2026-01-01')
  })

  test('createEvidence defaults operator fields to null', () => {
    const e = createEvidence()
    expect(e.issuedByOperatorId).toBeNull()
    expect(e.direction).toBeNull()
    expect(e.wasteReceivedFrom).toBeNull()
  })

  test('listEvidenceByOperator filters by operator id', () => {
    storage.saveEvidence(
      createEvidence({
        issuedByOperatorId: 'op-1',
        compliancePeriodYear: '2026'
      })
    )
    storage.saveEvidence(
      createEvidence({
        issuedByOperatorId: 'op-2',
        compliancePeriodYear: '2026'
      })
    )
    expect(storage.listEvidenceByOperator('op-1', '2026')).toHaveLength(1)
    expect(storage.listEvidenceByOperator('op-1')).toHaveLength(1)
    expect(storage.listEvidenceByOperator('op-3')).toHaveLength(0)
  })

  test('listEvidenceForSchemeFromOperators filters by direction and scheme', () => {
    storage.saveEvidence(
      createEvidence({
        schemeId: 'scheme-1',
        compliancePeriodYear: '2026',
        direction: 'operator-to-scheme'
      })
    )
    storage.saveEvidence(
      createEvidence({
        schemeId: 'scheme-1',
        compliancePeriodYear: '2026',
        direction: null
      })
    )
    storage.saveEvidence(
      createEvidence({
        schemeId: 'scheme-2',
        compliancePeriodYear: '2026',
        direction: 'operator-to-scheme'
      })
    )
    expect(
      storage.listEvidenceForSchemeFromOperators('scheme-1', '2026')
    ).toHaveLength(1)
    expect(
      storage.listEvidenceForSchemeFromOperators('scheme-2', '2026')
    ).toHaveLength(1)
    expect(storage.listEvidenceForSchemeFromOperators('scheme-1')).toHaveLength(
      1
    )
    expect(storage.listEvidenceForSchemeFromOperators('scheme-3')).toHaveLength(
      0
    )
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

    expect(
      storage.getSchemes({ status: 'pending' }).map((s) => s.name)
    ).toEqual(['EA-Pending-2026'])

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
    const updated = storage.saveEvidence({
      ...item,
      status: 'awaiting-acceptance'
    })
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
    expect(storage.findQuarterlySubmission('s-1', '2026', 'Q1').status).toBe(
      'submitted'
    )
    expect(storage.findQuarterlySubmission('s-1', '2026', 'Q2')).toBeNull()
  })

  test('upsertQuarterlySubmission creates then updates the same record', () => {
    const memberData = [
      {
        memberId: 'm-1',
        producerBprn: 'B-1',
        companyName: 'Acme',
        marketData: null,
        wasteData: null
      }
    ]
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
      storage.findQuarterlySubmission('s-1', '2026', 'Q1').memberData[0]
        .companyName
    ).toBe('A')
    expect(
      storage.findQuarterlySubmission('s-1', '2027', 'Q1').memberData[0]
        .companyName
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
    const memberData = [
      {
        memberId: 'm-1',
        producerBprn: 'B-1',
        companyName: 'Acme',
        placed: null,
        exported: null,
        takenBack: null,
        delivered: null
      }
    ]
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
    expect(
      storage.findIaSubmission('s-1', '2026').memberData[0].companyName
    ).toBe('Acme')
    expect(
      storage.findIaSubmission('s-1', '2027').memberData[0].companyName
    ).toBe('Beta')
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

describe('createOperatorQuarterlyReturn', () => {
  test('fills sensible defaults', () => {
    const ret = createOperatorQuarterlyReturn()
    expect(ret.id).toMatch(/^[0-9a-f-]{36}$/)
    expect(ret.version).toBe(0)
    expect(ret.operatorId).toBeNull()
    expect(ret.compliancePeriodYear).toBeNull()
    expect(ret.quarter).toBeNull()
    expect(ret.status).toBe('not-started')
    expect(ret.accepted).toEqual({
      leadAcid: '0.000',
      nickelCadmium: '0.000',
      other: '0.000'
    })
    expect(ret.treated).toEqual({
      leadAcid: '0.000',
      nickelCadmium: '0.000',
      other: '0.000'
    })
    expect(ret.submittedOn).toBeNull()
    expect(ret.createdAt).toMatch(/T/)
    expect(ret.updatedAt).toMatch(/T/)
  })

  test('accepts overrides', () => {
    const ret = createOperatorQuarterlyReturn({
      operatorId: 'op-1',
      compliancePeriodYear: '2026',
      quarter: 'Q1',
      status: 'in-progress',
      accepted: { leadAcid: '1.000', nickelCadmium: '2.000', other: '3.000' }
    })
    expect(ret.operatorId).toBe('op-1')
    expect(ret.quarter).toBe('Q1')
    expect(ret.status).toBe('in-progress')
    expect(ret.accepted.leadAcid).toBe('1.000')
  })
})

describe('operator quarterly return storage functions', () => {
  test('saveOperatorQuarterlyReturn persists and retrieves', () => {
    const ret = createOperatorQuarterlyReturn({
      operatorId: 'op-1',
      compliancePeriodYear: '2026',
      quarter: 'Q1'
    })
    const saved = storage.saveOperatorQuarterlyReturn(ret)
    expect(saved.id).toBe(ret.id)
    expect(saved.version).toBe(0)

    const found = storage.findOperatorQuarterlyReturn('op-1', '2026', 'Q1')
    expect(found).not.toBeNull()
    expect(found.operatorId).toBe('op-1')
  })

  test('saveOperatorQuarterlyReturn updates existing record', () => {
    const ret = createOperatorQuarterlyReturn({
      operatorId: 'op-1',
      compliancePeriodYear: '2026',
      quarter: 'Q1'
    })
    storage.saveOperatorQuarterlyReturn(ret)
    const updated = storage.saveOperatorQuarterlyReturn({
      ...ret,
      status: 'in-progress'
    })
    expect(updated.version).toBe(1)
    expect(updated.status).toBe('in-progress')
  })

  test('listOperatorQuarterlyReturns filters by operatorId', () => {
    storage.saveOperatorQuarterlyReturn(
      createOperatorQuarterlyReturn({
        operatorId: 'op-1',
        compliancePeriodYear: '2026',
        quarter: 'Q1'
      })
    )
    storage.saveOperatorQuarterlyReturn(
      createOperatorQuarterlyReturn({
        operatorId: 'op-2',
        compliancePeriodYear: '2026',
        quarter: 'Q1'
      })
    )
    expect(storage.listOperatorQuarterlyReturns('op-1')).toHaveLength(1)
    expect(storage.listOperatorQuarterlyReturns('op-2')).toHaveLength(1)
  })

  test('listOperatorQuarterlyReturns filters by compliancePeriodYear', () => {
    storage.saveOperatorQuarterlyReturn(
      createOperatorQuarterlyReturn({
        operatorId: 'op-1',
        compliancePeriodYear: '2026',
        quarter: 'Q1'
      })
    )
    storage.saveOperatorQuarterlyReturn(
      createOperatorQuarterlyReturn({
        operatorId: 'op-1',
        compliancePeriodYear: '2027',
        quarter: 'Q1'
      })
    )
    expect(storage.listOperatorQuarterlyReturns('op-1', '2026')).toHaveLength(1)
    expect(storage.listOperatorQuarterlyReturns('op-1')).toHaveLength(2)
  })

  test('findOperatorQuarterlyReturn returns null when not found', () => {
    expect(storage.findOperatorQuarterlyReturn('op-1', '2026', 'Q1')).toBeNull()
  })

  test('upsertOperatorQuarterlyReturn creates new if not found', () => {
    const ret = storage.upsertOperatorQuarterlyReturn('op-1', '2026', 'Q1', {
      status: 'in-progress'
    })
    expect(ret.operatorId).toBe('op-1')
    expect(ret.quarter).toBe('Q1')
    expect(ret.status).toBe('in-progress')
  })

  test('upsertOperatorQuarterlyReturn updates existing', () => {
    storage.upsertOperatorQuarterlyReturn('op-1', '2026', 'Q1', {
      status: 'in-progress'
    })
    const updated = storage.upsertOperatorQuarterlyReturn(
      'op-1',
      '2026',
      'Q1',
      {
        status: 'submitted',
        submittedOn: '2026-04-01T00:00:00Z'
      }
    )
    expect(updated.status).toBe('submitted')
    expect(updated.submittedOn).toBe('2026-04-01T00:00:00Z')
  })

  test('createOperatorAnnualReturn defaults', () => {
    const ret = createOperatorAnnualReturn()
    expect(ret.status).toBe('not-started')
    expect(ret.industrial.accepted.leadAcid).toBe('0.000')
    expect(ret.automotive.treated.other).toBe('0.000')
  })

  test('createOperatorAnnualReturn merges partial input', () => {
    const ret = createOperatorAnnualReturn({
      industrial: { accepted: { leadAcid: '5.000' } }
    })
    expect(ret.industrial.accepted.leadAcid).toBe('5.000')
    expect(ret.industrial.accepted.nickelCadmium).toBe('0.000')
    expect(ret.industrial.treated.leadAcid).toBe('0.000')
  })

  test('findOperatorAnnualReturn returns null when not found', () => {
    expect(storage.findOperatorAnnualReturn('op-1', '2026')).toBeNull()
  })

  test('saveOperatorAnnualReturn and findOperatorAnnualReturn round-trip', () => {
    const saved = storage.saveOperatorAnnualReturn(
      createOperatorAnnualReturn({
        operatorId: 'op-1',
        compliancePeriodYear: '2026'
      })
    )
    expect(saved.id).toBeTruthy()
    const found = storage.findOperatorAnnualReturn('op-1', '2026')
    expect(found).toEqual(saved)
  })

  test('upsertOperatorAnnualReturn creates when none exists', () => {
    const ret = storage.upsertOperatorAnnualReturn('op-2', '2026', {
      status: 'in-progress'
    })
    expect(ret.operatorId).toBe('op-2')
    expect(ret.status).toBe('in-progress')
  })

  test('upsertOperatorAnnualReturn updates existing', () => {
    storage.upsertOperatorAnnualReturn('op-3', '2026', {
      status: 'in-progress'
    })
    const updated = storage.upsertOperatorAnnualReturn('op-3', '2026', {
      status: 'submitted',
      submittedOn: '2026-12-01T00:00:00Z'
    })
    expect(updated.status).toBe('submitted')
    expect(updated.submittedOn).toBe('2026-12-01T00:00:00Z')
  })
})

describe('agency functions', () => {
  test('getAgencies returns 4 agencies', () => {
    expect(storage.getAgencies()).toHaveLength(4)
    expect(storage.getAgencies()).toBe(AGENCIES)
  })

  test('currentAgency returns null when no agency selected', () => {
    expect(storage.currentAgency()).toBeNull()
  })

  test('setCurrentAgencyCode and currentAgency round-trip', () => {
    storage.setCurrentAgencyCode('NRW')
    expect(storage.getCurrentAgencyCode()).toBe('NRW')
    const agency = storage.currentAgency()
    expect(agency.code).toBe('NRW')
    expect(agency.name).toBe('Natural Resources Wales')
  })

  test('clearCurrentAgencyCode clears', () => {
    storage.setCurrentAgencyCode('SEPA')
    storage.clearCurrentAgencyCode()
    expect(storage.getCurrentAgencyCode()).toBeNull()
    expect(storage.currentAgency()).toBeNull()
  })

  test('currentAgency returns null for unknown code', () => {
    storage.setCurrentAgencyCode('UNKNOWN')
    expect(storage.currentAgency()).toBeNull()
  })
})

describe('regulator targets', () => {
  test('getRegulatorTargets returns null before anything is stored', () => {
    expect(storage.getRegulatorTargets('EA')).toBeNull()
  })

  test('saveRegulatorTargets stores per agency and round-trips', () => {
    const targets = {
      collection: { portable: 45, industrial: 100, automotive: 100 },
      recycling: { portable: 45, industrial: 50, automotive: 50 }
    }
    expect(storage.saveRegulatorTargets('EA', targets)).toBe(targets)
    expect(storage.getRegulatorTargets('EA')).toEqual(targets)
    expect(storage.getRegulatorTargets('NRW')).toBeNull()
  })

  test('seedDemoData seeds default targets for every agency', () => {
    storage.seedDemoData()
    for (const { code } of AGENCIES) {
      expect(storage.getRegulatorTargets(code)).toEqual(
        seedData.regulatorTargets[code]
      )
    }
  })

  test('seedDemoData does not overwrite existing targets', () => {
    const custom = {
      collection: { portable: 10, industrial: 20, automotive: 30 },
      recycling: { portable: 40, industrial: 50, automotive: 60 }
    }
    storage.saveRegulatorTargets('EA', custom)
    storage.seedDemoData()
    expect(storage.getRegulatorTargets('EA')).toEqual(custom)
  })
})

describe('regulator categories', () => {
  beforeEach(() => {
    globalThis.localStorage.clear()
  })

  const sampleCategories = () => [
    { id: 'portable', label: 'Portable batteries', shortLabel: 'Portable' },
    {
      id: 'industrial',
      label: 'Industrial batteries',
      shortLabel: 'Industrial'
    }
  ]

  test('getRegulatorCategories returns null before anything is stored', () => {
    expect(storage.getRegulatorCategories('EA')).toBeNull()
  })

  test('resolveCategories falls back to the default set when none stored', () => {
    expect(storage.resolveCategories('EA')).toEqual([
      { id: 'portable', label: 'Portable batteries', shortLabel: 'Portable' },
      {
        id: 'industrial',
        label: 'Industrial batteries',
        shortLabel: 'Industrial'
      },
      {
        id: 'automotive',
        label: 'Automotive batteries',
        shortLabel: 'Automotive'
      }
    ])
  })

  test('saveRegulatorCategories stores per agency and round-trips', () => {
    const categories = sampleCategories()
    expect(storage.saveRegulatorCategories('EA', categories)).toBe(categories)
    expect(storage.getRegulatorCategories('EA')).toEqual(categories)
    expect(storage.getRegulatorCategories('NRW')).toBeNull()
    expect(storage.resolveCategories('EA')).toEqual(categories)
  })

  test('seedDemoData seeds default categories for every agency', () => {
    storage.seedDemoData()
    for (const { code } of AGENCIES) {
      expect(storage.getRegulatorCategories(code)).toEqual(
        seedData.regulatorCategories[code]
      )
    }
  })

  test('seedDemoData does not overwrite existing categories', () => {
    const custom = sampleCategories()
    storage.saveRegulatorCategories('EA', custom)
    storage.seedDemoData()
    expect(storage.getRegulatorCategories('EA')).toEqual(custom)
  })

  test('records add, rename, remove and reorder in the audit log', () => {
    storage.seedDemoData()
    storage.saveRegulatorCategories(
      'EA',
      [
        {
          id: 'automotive',
          label: 'Automotive batteries',
          shortLabel: 'Automotive'
        },
        { id: 'portable', label: 'Portable cells', shortLabel: 'Portable' },
        { id: 'lmt', label: 'LMT batteries', shortLabel: 'LMT' }
      ],
      'Priya Shah'
    )
    const actions = storage
      .listConfigAuditEntries('EA', { configType: 'category' })
      .map((entry) => entry.action)
    expect(actions).toContain('added')
    expect(actions).toContain('renamed')
    expect(actions).toContain('removed')
    expect(actions).toContain('reordered')
  })

  test('listConfigAuditEntries can filter by config type', () => {
    storage.seedDemoData()
    storage.saveRegulatorCategories('EA', sampleCategories(), 'Priya Shah')
    const categoryEntries = storage.listConfigAuditEntries('EA', {
      configType: 'category'
    })
    const targetEntries = storage.listConfigAuditEntries('EA', {
      configType: 'target'
    })
    expect(categoryEntries.every((e) => e.configType === 'category')).toBe(true)
    expect(
      targetEntries.every((e) => (e.configType ?? 'target') === 'target')
    ).toBe(true)
  })
})

describe('obligation snapshots', () => {
  const snapshot = {
    schemeId: 'scheme-1',
    schemeName: 'BatteryBack',
    agencyCode: 'EA',
    compliancePeriodYear: '2026',
    calculatedAt: '2026-05-01T00:00:00.000Z',
    batteryCategories: ['portable', 'industrial', 'automotive'],
    targets: {
      collection: { portable: 45, industrial: 100, automotive: 100 },
      recycling: { portable: 45, industrial: 50, automotive: 50 }
    },
    rules: {
      version: 'GB-playground-v1',
      configSource: 'regulatorTargets',
      configVersion: 'audit-entry-1',
      configDate: '2026-03-01T00:00:00.000Z'
    },
    rows: [],
    totals: { placed: 0, obligation: 0, accepted: 0, outstanding: 0 }
  }

  test('saveObligationSnapshot stores and round-trips by scheme and year', () => {
    const saved = storage.saveObligationSnapshot(snapshot)

    expect(saved.id).toMatch(/^[0-9a-f-]{36}$/)
    expect(storage.getObligationSnapshot('scheme-1', '2026')).toEqual(saved)
    expect(storage.listObligationSnapshots({ schemeId: 'scheme-1' })).toEqual([
      saved
    ])
  })

  test('saveObligationSnapshot fills missing dates', () => {
    const saved = storage.saveObligationSnapshot({
      ...snapshot,
      calculatedAt: undefined,
      createdAt: undefined
    })

    expect(saved.calculatedAt).toMatch(/T/)
    expect(saved.createdAt).toMatch(/T/)
  })

  test('getObligationSnapshot returns null without scheme or year', () => {
    expect(storage.getObligationSnapshot(null, '2026')).toBeNull()
    expect(storage.getObligationSnapshot('scheme-1', null)).toBeNull()
  })

  test('listObligationSnapshots returns newest first', () => {
    const older = storage.saveObligationSnapshot(snapshot)
    const newer = storage.saveObligationSnapshot({
      ...snapshot,
      compliancePeriodYear: '2027',
      calculatedAt: '2027-05-01T00:00:00.000Z'
    })

    expect(
      storage
        .listObligationSnapshots({ schemeId: 'scheme-1' })
        .map((item) => item.id)
    ).toEqual([newer.id, older.id])
  })

  test('saveObligationSnapshot requires scheme and year', () => {
    expect(() =>
      storage.saveObligationSnapshot({ schemeId: 'scheme-1' })
    ).toThrow(/schemeId and compliancePeriodYear/)
  })

  test('saveObligationSnapshot keeps each calculation and returns the latest', () => {
    const first = storage.saveObligationSnapshot(snapshot)
    const second = storage.saveObligationSnapshot({
      ...snapshot,
      calculatedAt: '2026-06-01T00:00:00.000Z',
      totals: { placed: 100, obligation: 60, accepted: 0, outstanding: 60 }
    })

    expect(second.id).not.toBe(first.id)
    expect(
      storage.listObligationSnapshots({ schemeId: 'scheme-1' })
    ).toHaveLength(2)
    expect(storage.getObligationSnapshot('scheme-1', '2026')).toEqual(second)
  })

  test('getObligationSnapshot returns a copy', () => {
    storage.saveObligationSnapshot(snapshot)
    const stored = storage.getObligationSnapshot('scheme-1', '2026')
    stored.targets.recycling.portable = 99

    expect(
      storage.getObligationSnapshot('scheme-1', '2026').targets.recycling
        .portable
    ).toBe(45)
  })

  test('seedDemoData includes a GB snapshot with targets that differ from live config', () => {
    storage.seedDemoData()
    const [seeded] = storage.listObligationSnapshots({
      schemeId: '22222222-0001-4000-a000-000000000002',
      compliancePeriodYear: '2026'
    })

    expect(seeded.agencyCode).toBe('EA')
    expect(seeded.targets.recycling.portable).toBe(48)
    expect(storage.getRegulatorTargets('EA').recycling.portable).toBe(45)
  })

  test('seedDemoData does not overwrite an existing snapshot with the same id', () => {
    storage.saveObligationSnapshot({
      ...snapshot,
      id: '55555555-0001-4000-a000-000000000001',
      schemeId: '22222222-0001-4000-a000-000000000002',
      targets: {
        collection: { portable: 1, industrial: 1, automotive: 1 },
        recycling: { portable: 1, industrial: 1, automotive: 1 }
      }
    })
    storage.seedDemoData()

    expect(
      storage.getObligationSnapshot(
        '22222222-0001-4000-a000-000000000002',
        '2026'
      ).targets.recycling.portable
    ).toBe(1)
    expect(
      storage.listObligationSnapshots({
        schemeId: '22222222-0001-4000-a000-000000000002',
        compliancePeriodYear: '2026'
      })
    ).toHaveLength(1)
  })
})

describe('listAllProducers', () => {
  test('returns all producers', () => {
    storage.seedDemoData()
    const producers = storage.listAllProducers()
    expect(producers.length).toBeGreaterThan(0)
  })
})

describe('listAllEvidence', () => {
  test('returns all evidence without year filter', () => {
    storage.seedDemoData()
    const evidence = storage.listAllEvidence()
    expect(Array.isArray(evidence)).toBe(true)
  })

  test('returns filtered evidence with year filter', () => {
    const ev = createEvidence({ compliancePeriodYear: '2026', tonnes: '1.000' })
    storage.saveEvidence(ev)
    const ev2 = createEvidence({
      compliancePeriodYear: '2025',
      tonnes: '2.000'
    })
    storage.saveEvidence(ev2)
    const filtered = storage.listAllEvidence('2026')
    expect(filtered.every((e) => e.compliancePeriodYear === '2026')).toBe(true)
    const all = storage.listAllEvidence()
    expect(all.length).toBeGreaterThanOrEqual(2)
  })
})

describe('approveScheme', () => {
  test('sets status to approved with approval number', () => {
    storage.seedDemoData()
    const schemes = storage.listSchemes()
    const submitted = schemes.find((s) => s.approvalStatus === 'submitted')
    expect(submitted).toBeTruthy()
    const result = storage.approveScheme(submitted.id, 'BCS-APPROVE-001')
    expect(result.approvalStatus).toBe('approved')
    expect(result.approvalNumber).toBe('BCS-APPROVE-001')
    expect(result.approvedOn).toBeTruthy()
  })

  test('returns null for nonexistent scheme', () => {
    expect(storage.approveScheme('nonexistent', 'X')).toBeNull()
  })
})

describe('rejectScheme', () => {
  test('sets status to rejected', () => {
    storage.seedDemoData()
    const schemes = storage.listSchemes()
    const submitted = schemes.find((s) => s.approvalStatus === 'submitted')
    expect(submitted).toBeTruthy()
    const result = storage.rejectScheme(submitted.id)
    expect(result.approvalStatus).toBe('rejected')
  })

  test('returns null for nonexistent scheme', () => {
    expect(storage.rejectScheme('nonexistent')).toBeNull()
  })
})

describe('approveOperator', () => {
  test('sets status to approved with approval number', () => {
    storage.seedDemoData()
    const operators = storage.listOperators()
    const submitted = operators.find((o) => o.approvalStatus === 'submitted')
    expect(submitted).toBeTruthy()
    const result = storage.approveOperator(submitted.id, 'ABTO-APPROVE-001')
    expect(result.approvalStatus).toBe('approved')
    expect(result.approvalNumber).toBe('ABTO-APPROVE-001')
    expect(result.approvedOn).toBeTruthy()
  })

  test('returns null for nonexistent operator', () => {
    expect(storage.approveOperator('nonexistent', 'X')).toBeNull()
  })
})

describe('rejectOperator', () => {
  test('sets status to rejected', () => {
    storage.seedDemoData()
    const operators = storage.listOperators()
    const submitted = operators.find((o) => o.approvalStatus === 'submitted')
    expect(submitted).toBeTruthy()
    const result = storage.rejectOperator(submitted.id)
    expect(result.approvalStatus).toBe('rejected')
  })

  test('returns null for nonexistent operator', () => {
    expect(storage.rejectOperator('nonexistent')).toBeNull()
  })
})

describe('withdraw functions', () => {
  test('withdrawSchemeApproval sets status to withdrawn', () => {
    const scheme = storage.saveScheme(
      createScheme({ name: 'Test', approvalStatus: 'approved' })
    )
    const result = storage.withdrawSchemeApproval(scheme.id, 'Non-compliance')
    expect(result.approvalStatus).toBe('withdrawn')
    expect(result.withdrawalReason).toBe('Non-compliance')
    expect(result.withdrawnOn).toBeTruthy()
  })

  test('withdrawSchemeApproval returns null for nonexistent', () => {
    expect(storage.withdrawSchemeApproval('missing', 'reason')).toBeNull()
  })

  test('withdrawOperatorApproval sets status to withdrawn', () => {
    const op = storage.saveOperator(
      createOperator({ name: 'Test Op', approvalStatus: 'approved' })
    )
    const result = storage.withdrawOperatorApproval(op.id, 'Breach')
    expect(result.approvalStatus).toBe('withdrawn')
    expect(result.withdrawalReason).toBe('Breach')
    expect(result.withdrawnOn).toBeTruthy()
  })

  test('withdrawOperatorApproval returns null for nonexistent', () => {
    expect(storage.withdrawOperatorApproval('missing', 'reason')).toBeNull()
  })
})

describe('list-all submission functions', () => {
  test('listAllQuarterlySubmissions returns all', () => {
    const result = storage.listAllQuarterlySubmissions('2026')
    expect(Array.isArray(result)).toBe(true)
  })

  test('listAllQuarterlySubmissions without year returns all', () => {
    const result = storage.listAllQuarterlySubmissions()
    expect(Array.isArray(result)).toBe(true)
  })

  test('listAllIaSubmissions returns all', () => {
    expect(Array.isArray(storage.listAllIaSubmissions('2026'))).toBe(true)
    expect(Array.isArray(storage.listAllIaSubmissions())).toBe(true)
  })

  test('listAllOperatorQuarterlyReturns returns all', () => {
    expect(Array.isArray(storage.listAllOperatorQuarterlyReturns('2026'))).toBe(
      true
    )
    expect(Array.isArray(storage.listAllOperatorQuarterlyReturns())).toBe(true)
  })

  test('listAllOperatorAnnualReturns returns all', () => {
    expect(Array.isArray(storage.listAllOperatorAnnualReturns('2026'))).toBe(
      true
    )
    expect(Array.isArray(storage.listAllOperatorAnnualReturns())).toBe(true)
  })
})

describe('regulator users', () => {
  beforeEach(() => {
    globalThis.localStorage.clear()
  })

  afterEach(() => {
    globalThis.localStorage.clear()
  })

  test('regulatorUsersFor returns the demo users for an agency', () => {
    expect(storage.regulatorUsersFor('EA')).toContain('Priya Shah')
    expect(storage.regulatorUsersFor('UNKNOWN')).toEqual([])
  })

  test('currentRegulatorUser round-trips and defaults when unset', () => {
    expect(storage.currentRegulatorUser()).toBe('Regulator user')
    storage.setCurrentRegulatorUser('Priya Shah')
    expect(storage.currentRegulatorUser()).toBe('Priya Shah')
    storage.clearCurrentRegulatorUser()
    expect(storage.currentRegulatorUser()).toBe('Regulator user')
  })
})

describe('config audit log', () => {
  beforeEach(() => {
    globalThis.localStorage.clear()
  })

  afterEach(() => {
    globalThis.localStorage.clear()
  })

  const seededTargets = () => ({
    collection: { portable: 45, industrial: 100, automotive: 100 },
    recycling: { portable: 45, industrial: 50, automotive: 50 }
  })

  test('seedDemoData populates example audit entries', () => {
    storage.seedDemoData()
    const entries = storage.listConfigAuditEntries()
    expect(entries.length).toBe(seedData.configAuditLog.length)
    expect(storage.listConfigAuditEntries('EA').length).toBe(3)
    expect(storage.listConfigAuditEntries('NRW').length).toBe(1)
  })

  test('seeded audit entries are recent and never in the future', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2030-06-15T00:00:00.000Z'))
    storage.seedDemoData()
    const now = Date.now()

    const entries = storage.listConfigAuditEntries()
    expect(entries.length).toBe(seedData.configAuditLog.length)
    entries.forEach((entry) => {
      expect(Date.parse(entry.at)).toBeLessThanOrEqual(now)
      expect(new Date(entry.at).getUTCFullYear()).toBe(2030)
    })
    vi.useRealTimers()
  })

  test('seeded audit entries keep their relative order', () => {
    storage.seedDemoData()
    const timestamps = [...storage.listConfigAuditEntries()]
      .reverse()
      .map((entry) => Date.parse(entry.at))
    const ascending = [...timestamps].sort((a, b) => a - b)
    expect(timestamps).toEqual(ascending)
  })

  test('listConfigAuditEntries omits entries dated after the current time', () => {
    const dayMs = 24 * 60 * 60 * 1000
    const base = {
      agencyCode: 'EA',
      actorName: 'Priya Shah',
      field: 'recycling',
      category: 'portable',
      previousValue: 40,
      newValue: 45
    }
    globalThis.localStorage.setItem(
      STORAGE_KEYS.configAuditLog,
      JSON.stringify([
        { ...base, id: 'past', at: new Date(Date.now() - dayMs).toISOString() },
        {
          ...base,
          id: 'future',
          at: new Date(Date.now() + dayMs).toISOString()
        }
      ])
    )

    expect(storage.listConfigAuditEntries('EA').map((e) => e.id)).toEqual([
      'past'
    ])
    expect(storage.listConfigAuditEntries().map((e) => e.id)).toEqual(['past'])
  })

  test('travelling back in time hides more recent audit entries', () => {
    storage.seedDemoData()
    expect(storage.listConfigAuditEntries('EA').length).toBe(3)

    vi.useFakeTimers()
    vi.setSystemTime(new Date('2000-01-01T00:00:00.000Z'))
    expect(storage.listConfigAuditEntries('EA').length).toBe(0)
    expect(storage.listConfigAuditEntries().length).toBe(0)
    vi.useRealTimers()
  })

  test('seedDemoData preserves existing audit entries on version upgrade', () => {
    globalThis.localStorage.setItem(STORAGE_KEYS.seedVersion, '10')
    const existing = [
      {
        id: 'user-entry',
        at: '2026-01-01T00:00:00.000Z',
        agencyCode: 'EA',
        actorName: 'Someone',
        field: 'collection',
        category: 'portable',
        previousValue: 1,
        newValue: 2
      }
    ]
    globalThis.localStorage.setItem(
      STORAGE_KEYS.configAuditLog,
      JSON.stringify(existing)
    )
    storage.seedDemoData()
    const ea = storage.listConfigAuditEntries('EA')
    expect(ea.length).toBe(1)
    expect(ea[0].id).toBe('user-entry')
  })

  test('listConfigAuditEntries returns most-recent-first', () => {
    storage.seedDemoData()
    const ea = storage.listConfigAuditEntries('EA')
    const timestamps = ea.map((entry) => entry.at)
    const sortedDesc = [...timestamps].sort((a, b) => (a < b ? 1 : -1))
    expect(timestamps).toEqual(sortedDesc)
  })

  test('saveRegulatorTargets records one entry per changed value with the actor', () => {
    storage.seedDemoData()
    const next = seededTargets()
    next.recycling.portable = 48
    next.collection.industrial = 90
    storage.saveRegulatorTargets('EA', next, 'Priya Shah')

    const ea = storage.listConfigAuditEntries('EA')
    expect(ea.length).toBe(5)
    const latest = ea[0]
    expect(latest.actorName).toBe('Priya Shah')
    expect(latest.agencyCode).toBe('EA')
    const changed = ea
      .slice(0, 2)
      .map((entry) => `${entry.field}.${entry.category}`)
    expect(changed).toContain('recycling.portable')
    expect(changed).toContain('collection.industrial')
    const recyclingChange = ea.find(
      (entry) =>
        entry.field === 'recycling' &&
        entry.category === 'portable' &&
        entry.previousValue === 45
    )
    expect(recyclingChange.newValue).toBe(48)
  })

  test('saveRegulatorTargets writes no entry when nothing changes', () => {
    storage.seedDemoData()
    const before = storage.listConfigAuditEntries('EA').length
    storage.saveRegulatorTargets('EA', seededTargets(), 'Priya Shah')
    expect(storage.listConfigAuditEntries('EA').length).toBe(before)
  })

  test('audit entries are append-only across sequential saves', () => {
    storage.seedDemoData()
    const first = seededTargets()
    first.recycling.portable = 46
    storage.saveRegulatorTargets('EA', first, 'Priya Shah')
    const afterFirst = storage.listConfigAuditEntries('EA')

    const second = seededTargets()
    second.recycling.portable = 46
    second.recycling.industrial = 55
    storage.saveRegulatorTargets('EA', second, 'Daniel Okafor')
    const afterSecond = storage.listConfigAuditEntries('EA')

    expect(afterSecond.length).toBe(afterFirst.length + 1)
    expect(afterSecond.at(-1)).toEqual(afterFirst.at(-1))
  })

  test('saveRegulatorTargets defaults the actor when none is supplied', () => {
    storage.saveRegulatorTargets('SEPA', seededTargets())
    const entry = storage.listConfigAuditEntries('SEPA')[0]
    expect(entry.actorName).toBe('Regulator user')
    expect(entry.previousValue).toBeNull()
  })
})
