import { describe, expect, test } from 'vitest'

import { paths } from '../../../config/paths.js'
import { PROTOTYPE_REGISTRATION_SERVICE_NAME } from '../../../config/prototype-registration-content.js'
import {
  actionWithReturn,
  basePageModel,
  buildHydrationPayload,
  buildStepPayload,
  collectErrors,
  errorListToMap,
  isAllowedReturn,
  returnUrlFromRequest
} from './shared.js'

describe('shared prototype registration helpers', () => {
  test('basePageModel carries the journey service name and an empty navigation', () => {
    const model = basePageModel({ title: 'T', heading: 'H' })
    expect(model).toEqual({
      pageTitle: 'T',
      heading: 'H',
      labels: { title: 'T', heading: 'H' },
      serviceName: PROTOTYPE_REGISTRATION_SERVICE_NAME,
      navigation: []
    })
  })

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
        { path: ['fullName'], message: 'r' },
        { path: ['fullName'], message: 'r2' },
        { path: ['unknownField'], message: 'r' },
        { path: ['postcode'], message: 'r' }
      ]
    }
    const list = collectErrors(joiError, {
      fullName: 'Full name required',
      postcode: 'Postcode required'
    })

    expect(list).toEqual([
      { text: 'Full name required', href: '#fullName' },
      { text: 'Postcode required', href: '#postcode' }
    ])
  })

  test('buildHydrationPayload composes the standard hydrate payload', () => {
    expect(buildHydrationPayload('tonnage')).toEqual({
      step: 'tonnage',
      target: 'hydrate',
      skipHydration: false
    })
  })

  test('buildHydrationPayload sets skipHydration when requested', () => {
    expect(buildHydrationPayload('tonnage', { skipHydration: true })).toEqual({
      step: 'tonnage',
      target: 'hydrate',
      skipHydration: true
    })
  })

  test('buildStepPayload includes the next step path for non-terminal steps', () => {
    expect(buildStepPayload('batteryCategory', 'draft', { x: 1 })).toEqual({
      step: 'batteryCategory',
      target: 'draft',
      savedFields: { x: 1 },
      nextStep: paths.prototypeRegistrationTonnage
    })
  })

  test('buildStepPayload yields nextStep null for the last step', () => {
    expect(buildStepPayload('complete', 'none', null).nextStep).toBeNull()
  })

  test('buildStepPayload uses the override path when provided', () => {
    expect(
      buildStepPayload('batteryCategory', 'draft', { x: 1 }, '/prototype')
        .nextStep
    ).toBe('/prototype')
  })

  test('isAllowedReturn accepts only safe in-app paths', () => {
    expect(isAllowedReturn(paths.prototypeRegistrationCheckAnswers)).toBe(true)
    expect(isAllowedReturn('http://evil.example.com')).toBe(false)
    expect(isAllowedReturn('//evil.example.com')).toBe(false)
    expect(isAllowedReturn(null)).toBe(false)
    expect(isAllowedReturn(42)).toBe(false)
  })

  test('returnUrlFromRequest reads a safe return query parameter', () => {
    expect(returnUrlFromRequest({ query: { return: '/prototype' } })).toBe(
      '/prototype'
    )
    expect(
      returnUrlFromRequest({ query: { return: 'http://evil.example.com' } })
    ).toBeNull()
    expect(returnUrlFromRequest({})).toBeNull()
  })

  test('actionWithReturn appends an encoded return query when present', () => {
    expect(actionWithReturn('/a', '/b')).toBe('/a?return=%2Fb')
  })

  test('actionWithReturn passes through the action when no return is given', () => {
    expect(actionWithReturn('/a', null)).toBe('/a')
  })
})
