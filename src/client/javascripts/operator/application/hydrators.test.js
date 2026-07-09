import { describe, expect, test } from 'vitest'

import { HYDRATORS } from './hydrators.js'

describe('operator application hydrators', () => {
  test('operator-details hydrates from operator with null values', () => {
    const result = HYDRATORS['operator-details']({})
    expect(result).toEqual({
      name: '',
      approvalType: '',
      companyRegistrationNo: ''
    })
  })

  test('registered-address hydrates from null address', () => {
    const result = HYDRATORS['registered-address']({
      registeredAddress: null
    })
    expect(result).toEqual({ line1: '', line2: '', town: '', postcode: '' })
  })

  test('registered-address hydrates from populated address', () => {
    const result = HYDRATORS['registered-address']({
      registeredAddress: {
        line1: '1 St',
        line2: 'Suite 2',
        town: 'Town',
        postcode: 'LS1 1AA'
      }
    })
    expect(result.line1).toBe('1 St')
    expect(result.line2).toBe('Suite 2')
  })

  test('site-details hydrates from empty sites array', () => {
    const result = HYDRATORS['site-details']({ sites: [] })
    expect(result.siteName).toBe('')
    expect(result.isPortable).toBe('')
    expect(result.operationsDescription).toBe('')
  })

  test('site-details hydrates from populated site', () => {
    const result = HYDRATORS['site-details']({
      sites: [
        {
          name: 'My Site',
          address: { line1: '1 Way', town: 'Sheffield', postcode: 'S1 1AA' },
          batteryTypes: {
            isPortable: true,
            isIndustrial: false,
            isAutomotive: true
          },
          operationsDescription: 'Treatment'
        }
      ]
    })
    expect(result.siteName).toBe('My Site')
    expect(result.isPortable).toBe('yes')
    expect(result.isIndustrial).toBe('')
    expect(result.isAutomotive).toBe('yes')
    expect(result.operationsDescription).toBe('Treatment')
  })

  test('site-details hydrates from site with missing fields', () => {
    const result = HYDRATORS['site-details']({ sites: [{}] })
    expect(result.siteName).toBe('')
    expect(result.siteLine1).toBe('')
    expect(result.isPortable).toBe('')
  })

  test('declaration hydrates unchecked when not submitted', () => {
    const result = HYDRATORS.declaration({ approvalStatus: 'not-started' })
    expect(result.declarationAccepted).toBe('')
  })

  test('declaration hydrates checked when submitted', () => {
    expect(
      HYDRATORS.declaration({ approvalStatus: 'submitted' }).declarationAccepted
    ).toBe('yes')
  })

  test('declaration hydrates checked when approved', () => {
    expect(
      HYDRATORS.declaration({ approvalStatus: 'approved' }).declarationAccepted
    ).toBe('yes')
  })
})
