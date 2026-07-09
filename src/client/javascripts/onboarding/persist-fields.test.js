// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, test } from 'vitest'

import { storage } from '../storage-adapter.js'
import {
  persistProducerFields,
  persistRegistrationFields,
  readOnboardingState,
  submitRegistration
} from './persist-fields.js'

beforeEach(() => {
  globalThis.localStorage.clear()
})

afterEach(() => {
  globalThis.localStorage.clear()
})

describe('persistProducerFields', () => {
  test('creates a producer keyed by email and derives agencyCode from postcode', () => {
    persistProducerFields('test@example.com', {
      companyName: 'Acme Ltd',
      registeredAddress: { line1: '1', town: 'Belfast', postcode: 'BT1 1AA' }
    })

    const producer = storage.getProducerByEmail('test@example.com')
    expect(producer.companyName).toBe('Acme Ltd')
    expect(producer.agencyCode).toBe('NIEA')
    expect(producer.contactEmail).toBe('test@example.com')
  })

  test('updates an existing producer and bumps version', () => {
    persistProducerFields('a@b.com', {
      companyName: 'First',
      registeredAddress: { postcode: 'M1 4AA' }
    })
    persistProducerFields('a@b.com', { companyName: 'Second' })

    const producer = storage.getProducerByEmail('a@b.com')
    expect(producer.companyName).toBe('Second')
    expect(producer.version).toBe(1)
  })

  test('resolves "same as registered" flag to copy registeredAddress', () => {
    persistProducerFields('a@b.com', {
      registeredAddress: { line1: '1 Main St', town: 'X', postcode: 'M1 4AA' }
    })
    persistProducerFields('a@b.com', {
      serviceOfNoticeAddressSameAsRegistered: true
    })

    const producer = storage.getProducerByEmail('a@b.com')
    expect(producer.serviceOfNoticeAddress).toEqual(producer.registeredAddress)
    expect(producer.serviceOfNoticeAddressSameAsRegistered).toBeUndefined()
  })

  test('"same as registered" flag with no registered address sets null', () => {
    persistProducerFields('a@b.com', {
      serviceOfNoticeAddressSameAsRegistered: true
    })
    const producer = storage.getProducerByEmail('a@b.com')
    expect(producer.serviceOfNoticeAddress).toBeNull()
  })
})

describe('persistRegistrationFields', () => {
  test('creates a Started registration linked to the producer', () => {
    persistProducerFields('a@b.com', {
      registeredAddress: { postcode: 'M1 4AA' }
    })
    const result = persistRegistrationFields('a@b.com', '2026', {
      producerRoute: 'smallProducer'
    })

    expect(result.producerRoute).toBe('smallProducer')
    expect(result.compliancePeriod).toBe('2026')

    const producer = storage.getProducerByEmail('a@b.com')
    const list = storage.listRegistrationsForProducer(producer.id)
    expect(list).toHaveLength(1)
  })

  test('returns null when no producer exists yet', () => {
    expect(persistRegistrationFields('nope@x.com', '2026', {})).toBeNull()
  })

  test('updates an existing registration in place', () => {
    persistProducerFields('a@b.com', {
      registeredAddress: { postcode: 'M1 4AA' }
    })
    persistRegistrationFields('a@b.com', '2026', {
      producerRoute: 'smallProducer'
    })
    const updated = persistRegistrationFields('a@b.com', '2026', {
      producerRoute: 'directRegistrant'
    })

    expect(updated.producerRoute).toBe('directRegistrant')
    const producer = storage.getProducerByEmail('a@b.com')
    expect(storage.listRegistrationsForProducer(producer.id)).toHaveLength(1)
  })
})

describe('submitRegistration', () => {
  test('allocates a BPRN and transitions registration to Submitted', () => {
    persistProducerFields('a@b.com', {
      registeredAddress: { postcode: 'M1 4AA' }
    })
    persistRegistrationFields('a@b.com', '2026', {
      producerRoute: 'smallProducer'
    })

    const result = submitRegistration('a@b.com', '2026')

    expect(result.producer.bprn).toMatch(/^BPRN-EA-2026-\d{6}$/)
    expect(result.registration.status).toBe('Submitted')
  })

  test('does not re-allocate BPRN if one is already set', () => {
    persistProducerFields('a@b.com', {
      registeredAddress: { postcode: 'M1 4AA' }
    })
    const first = submitRegistration('a@b.com', '2026')
    const second = submitRegistration('a@b.com', '2026')
    expect(second.producer.bprn).toBe(first.producer.bprn)
  })

  test('falls back to EA when producer has no agencyCode', () => {
    persistProducerFields('a@b.com', { companyName: 'X' })
    const result = submitRegistration('a@b.com', '2026')
    expect(result.producer.bprn).toMatch(/^BPRN-EA-2026-/)
  })

  test('returns null when producer is missing', () => {
    expect(submitRegistration('nope@x.com', '2026')).toBeNull()
  })

  test('compliance-scheme route skips BPRN allocation and marks pendingScheme', () => {
    persistProducerFields('a@b.com', {
      companyName: 'Scheme Co',
      registeredAddress: { postcode: 'M1 4AA' }
    })
    const scheme = storage.saveScheme({
      id: '22222222-0001-4000-a000-000000000001',
      name: 'Northern Battery Compliance Scheme'
    })
    persistRegistrationFields('a@b.com', '2026', {
      producerRoute: 'complianceScheme',
      schemeId: scheme.id
    })

    const result = submitRegistration('a@b.com', '2026')

    expect(result.producer.bprn ?? null).toBeNull()
    expect(result.registration.status).toBe('pendingScheme')
    const memberships = storage.getSchemeMembershipHistory(null)
    expect(memberships.length).toBeGreaterThanOrEqual(1)
    const joined = memberships[0]
    expect(joined.schemeId).toBe(scheme.id)
    expect(joined.companyName).toBe('Scheme Co')
  })

  test('compliance-scheme submit defaults companyName to null on the membership when producer has none', () => {
    persistProducerFields('a@b.com', {
      registeredAddress: { postcode: 'M1 4AA' }
    })
    const scheme = storage.saveScheme({
      id: '22222222-0001-4000-a000-000000000099',
      name: 'Anonymous Scheme'
    })
    persistRegistrationFields('a@b.com', '2026', {
      producerRoute: 'complianceScheme',
      schemeId: scheme.id
    })
    submitRegistration('a@b.com', '2026')
    const memberships = storage.getSchemeMembershipHistory(null)
    expect(
      memberships.find((m) => m.schemeId === scheme.id)?.companyName
    ).toBeNull()
  })

  test('compliance-scheme submit without a schemeId still marks pendingScheme without creating membership', () => {
    persistProducerFields('a@b.com', {
      registeredAddress: { postcode: 'M1 4AA' }
    })
    persistRegistrationFields('a@b.com', '2026', {
      producerRoute: 'complianceScheme'
    })

    const result = submitRegistration('a@b.com', '2026')
    expect(result.registration.status).toBe('pendingScheme')
    expect(storage.getSchemeMembershipHistory(null)).toHaveLength(0)
  })
})

describe('readOnboardingState', () => {
  test('returns flat values for an empty state', () => {
    const state = readOnboardingState('nobody@x.com', '2026')
    expect(state.companyName).toBe('')
    expect(state.line1).toBe('')
    expect(state.firstName).toBe('')
    expect(state.brandNamesText).toBe('')
    expect(state.isPortable).toBe(false)
    expect(state.sonChoice).toBe('')
  })

  test('flattens producer + registration into form-friendly fields', () => {
    persistProducerFields('a@b.com', {
      companyName: 'Acme',
      tradingName: 'A',
      companyRegistrationNo: '12345678',
      webAddress: 'https://acme.example',
      sicCode: '27200',
      registeredAddress: {
        line1: '1 Test St',
        line2: 'Suite 2',
        town: 'Manchester',
        postcode: 'M1 4AA'
      },
      primaryContact: {
        firstName: 'Alice',
        lastName: 'Stone',
        position: 'Director',
        phone: '01234567890',
        email: 'alice@example.com'
      },
      brandNames: ['Acme', 'Acme Pro'],
      batteryTypes: {
        isPortable: true,
        isIndustrial: false,
        isAutomotive: false
      }
    })
    persistRegistrationFields('a@b.com', '2026', {
      producerRoute: 'smallProducer',
      declaration: {
        firstName: 'Alice',
        lastName: 'Stone',
        position: 'Director',
        declaredAt: '2026-04-30T10:00:00Z'
      }
    })

    const state = readOnboardingState('a@b.com', '2026')
    expect(state.companyName).toBe('Acme')
    expect(state.line1).toBe('1 Test St')
    expect(state.firstName).toBe('Alice')
    expect(state.brandNamesText).toBe('Acme\nAcme Pro')
    expect(state.isPortable).toBe(true)
    expect(state.producerRoute).toBe('smallProducer')
    expect(state.smallProducerSelfDeclare).toBe('yes')
    expect(state.declarationConfirm).toBe('yes')
  })

  test('reports sonChoice = "sameAsRegistered" when SoN matches registered address', () => {
    const address = {
      line1: '1 X',
      line2: null,
      town: 'M',
      postcode: 'M1 4AA'
    }
    persistProducerFields('a@b.com', { registeredAddress: address })
    persistProducerFields('a@b.com', { serviceOfNoticeAddress: address })

    const state = readOnboardingState('a@b.com', '2026')
    expect(state.sonChoice).toBe('sameAsRegistered')
  })

  test('reports sonChoice = "differentAddress" when SoN differs', () => {
    persistProducerFields('a@b.com', {
      registeredAddress: { line1: '1', town: 'A', postcode: 'M1 4AA' }
    })
    persistProducerFields('a@b.com', {
      serviceOfNoticeAddress: { line1: '99', town: 'B', postcode: 'M2 5BB' }
    })

    const state = readOnboardingState('a@b.com', '2026')
    expect(state.sonChoice).toBe('differentAddress')
  })

  test('handles a producer with neither registered nor SoN address (sameAddress fallback)', () => {
    persistProducerFields('a@b.com', { companyName: 'X' })
    persistProducerFields('a@b.com', {
      serviceOfNoticeAddress: { line1: '99', town: 'B', postcode: 'M2 5BB' }
    })
    const state = readOnboardingState('a@b.com', '2026')
    expect(state.sonChoice).toBe('differentAddress')
  })
})
