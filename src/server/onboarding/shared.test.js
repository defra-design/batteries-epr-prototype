import { describe, expect, test } from 'vitest'

import {
  actionWithReturn,
  buildHydrationPayload,
  buildStepPayload,
  collectErrors,
  errorListToMap,
  isAllowedReturn
} from './shared.js'

describe('shared onboarding helpers', () => {
  test('errorListToMap converts an array to a {field: text} map', () => {
    const map = errorListToMap([
      { text: 'A', href: '#alpha' },
      { text: 'B', href: '#beta' }
    ])
    expect(map).toEqual({ alpha: 'A', beta: 'B' })
  })

  test('errorListToMap handles a null input', () => {
    expect(errorListToMap(null)).toEqual({})
  })

  test('collectErrors maps known fields, dedupes per field, and skips unknowns', () => {
    const joiError = {
      details: [
        { path: ['firstName'], message: 'r' },
        { path: ['firstName'], message: 'r2' },
        { path: ['unknownField'], message: 'r' },
        { path: ['lastName'], message: 'r' }
      ]
    }
    const list = collectErrors(joiError, {
      firstName: 'First name required',
      lastName: 'Last name required'
    })

    expect(list).toEqual([
      { text: 'First name required', href: '#firstName' },
      { text: 'Last name required', href: '#lastName' }
    ])
  })

  const currentYear = String(new Date().getUTCFullYear())
  const stubRequest = {}

  test('buildHydrationPayload composes the standard hydrate payload', () => {
    expect(buildHydrationPayload(stubRequest, 'companyDetails')).toEqual({
      step: 'companyDetails',
      target: 'hydrate',
      compliancePeriod: currentYear,
      skipHydration: false
    })
  })

  test('buildHydrationPayload sets skipHydration when requested', () => {
    expect(
      buildHydrationPayload(stubRequest, 'companyDetails', {
        skipHydration: true
      })
    ).toEqual({
      step: 'companyDetails',
      target: 'hydrate',
      compliancePeriod: currentYear,
      skipHydration: true
    })
  })

  test('buildHydrationPayload honours the tt-year cookie', () => {
    expect(
      buildHydrationPayload({ state: { 'tt-year': '2030' } }, 'companyDetails')
    ).toMatchObject({ compliancePeriod: '2030' })
  })

  test('buildStepPayload includes the next step path for non-terminal steps', () => {
    expect(
      buildStepPayload(stubRequest, 'companyDetails', 'producer', { x: 1 })
    ).toEqual({
      step: 'companyDetails',
      target: 'producer',
      compliancePeriod: currentYear,
      savedFields: { x: 1 },
      nextStep: '/onboarding/contact-details'
    })
  })

  test('buildStepPayload yields nextStep null for the last step', () => {
    expect(
      buildStepPayload(stubRequest, 'confirmation', 'none', null).nextStep
    ).toBeNull()
  })

  test('buildStepPayload uses the override path when provided', () => {
    expect(
      buildStepPayload(
        stubRequest,
        'companyDetails',
        'producer',
        { x: 1 },
        '/account'
      ).nextStep
    ).toBe('/account')
  })

  test('isAllowedReturn accepts only safe in-app paths', () => {
    expect(isAllowedReturn('/account')).toBe(true)
    expect(isAllowedReturn('/onboarding/company-details')).toBe(true)
    expect(isAllowedReturn('http://evil.example.com')).toBe(false)
    expect(isAllowedReturn('//evil.example.com')).toBe(false)
    expect(isAllowedReturn('javascript:alert(1)')).toBe(false)
    expect(isAllowedReturn(null)).toBe(false)
    expect(isAllowedReturn(undefined)).toBe(false)
    expect(isAllowedReturn(42)).toBe(false)
  })

  test('actionWithReturn appends an encoded return query when present', () => {
    expect(actionWithReturn('/onboarding/company-details', '/account')).toBe(
      '/onboarding/company-details?return=%2Faccount'
    )
  })

  test('actionWithReturn passes through the action when no return is given', () => {
    expect(actionWithReturn('/onboarding/company-details', null)).toBe(
      '/onboarding/company-details'
    )
  })
})
