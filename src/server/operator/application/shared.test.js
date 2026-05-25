import { describe, expect, test } from 'vitest'

import {
  collectErrors,
  errorListToMap,
  flashStepErrors,
  readStepErrors
} from './shared.js'

describe('operator application shared helpers', () => {
  test('errorListToMap converts error list to field-keyed map', () => {
    const errors = [
      { text: 'Enter name', href: '#name' },
      { text: 'Enter type', href: '#approvalType' }
    ]
    expect(errorListToMap(errors)).toEqual({
      name: 'Enter name',
      approvalType: 'Enter type'
    })
  })

  test('errorListToMap returns empty object for null', () => {
    expect(errorListToMap(null)).toEqual({})
  })

  test('collectErrors deduplicates and maps Joi details to field messages', () => {
    const joiError = {
      details: [
        { path: ['name'], message: 'ignored' },
        { path: ['name'], message: 'duplicate-ignored' },
        { path: ['approvalType'], message: 'ignored' },
        { path: ['unknown'], message: 'no mapping' }
      ]
    }
    const fieldMessages = {
      name: 'Enter the name',
      approvalType: 'Select the type'
    }
    const result = collectErrors(joiError, fieldMessages)
    expect(result).toEqual([
      { text: 'Enter the name', href: '#name' },
      { text: 'Select the type', href: '#approvalType' }
    ])
  })

  test('flash and read round-trip preserves errors and values', () => {
    const flash = {}
    const request = {
      yar: {
        flash(key, value) {
          if (value !== undefined) {
            flash[key] = flash[key] ?? []
            flash[key].push(value)
          }
          return flash[key] ?? []
        }
      }
    }

    const errors = [{ text: 'Bad', href: '#name' }]
    flashStepErrors(request, 'operator-details', errors, { name: 'X' })

    const { errors: read, values } = readStepErrors(request, 'operator-details')
    expect(read).toEqual([errors])
    expect(values).toEqual({ name: 'X' })
  })

  test('readStepErrors returns null when no flash data', () => {
    const request = {
      yar: { flash: () => [] }
    }
    const { errors, values } = readStepErrors(request, 'step')
    expect(errors).toBeNull()
    expect(values).toBeNull()
  })
})
