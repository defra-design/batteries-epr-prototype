// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, test } from 'vitest'

import {
  readActiveSubmission,
  submissionToFormValues,
  upsertSubmission
} from './persist-submission.js'
import { storage } from '../../storage-adapter.js'

beforeEach(() => {
  globalThis.localStorage.clear()
})

afterEach(() => {
  globalThis.localStorage.clear()
})

describe('upsertSubmission', () => {
  test('creates a new submission when none exists', () => {
    const result = upsertSubmission('reg-1', {
      submissionType: 'smallProducerAnnual',
      useDetailedDataEntry: false,
      lines: [
        {
          category: 'portable',
          activity: 'placed',
          chemistry: 'leadAcid',
          subCategory: null,
          tonnes: '0.123'
        }
      ]
    })
    expect(result.id).toMatch(/^[0-9a-f-]{36}$/)
    expect(result.registrationId).toBe('reg-1')
  })

  test('updates an existing non-Submitted submission in place', () => {
    const first = upsertSubmission('reg-1', {
      submissionType: 'smallProducerAnnual',
      lines: []
    })
    const second = upsertSubmission('reg-1', {
      submissionType: 'smallProducerAnnual',
      lines: [
        {
          category: 'portable',
          activity: 'placed',
          chemistry: 'leadAcid',
          subCategory: null,
          tonnes: '1'
        }
      ]
    })
    expect(second.id).toBe(first.id)
    expect(storage.listSubmissionsForRegistration('reg-1')).toHaveLength(1)
  })

  test('creates a new submission when only a Submitted one exists', () => {
    storage.saveSubmission({
      registrationId: 'reg-1',
      status: 'Submitted',
      lines: []
    })
    const result = upsertSubmission('reg-1', {
      submissionType: 'smallProducerAnnual',
      lines: []
    })
    expect(storage.listSubmissionsForRegistration('reg-1')).toHaveLength(2)
    expect(result.status).not.toBe('Submitted')
  })
})

describe('readActiveSubmission', () => {
  test('returns null when there is no submission', () => {
    expect(readActiveSubmission('reg-1')).toBeNull()
  })

  test('returns the non-Submitted submission', () => {
    upsertSubmission('reg-1', {
      submissionType: 'smallProducerAnnual',
      lines: []
    })
    expect(readActiveSubmission('reg-1')).not.toBeNull()
  })

  test('returns null when only a Submitted submission exists', () => {
    storage.saveSubmission({
      registrationId: 'reg-1',
      status: 'Submitted',
      lines: []
    })
    expect(readActiveSubmission('reg-1')).toBeNull()
  })
})

describe('submissionToFormValues', () => {
  test('returns a default simple-mode object when submission is null', () => {
    expect(submissionToFormValues(null)).toEqual({ mode: 'simple' })
  })

  test('flattens simple-mode lines into t_chemistry fields', () => {
    const result = submissionToFormValues({
      useDetailedDataEntry: false,
      lines: [
        { chemistry: 'leadAcid', subCategory: null, tonnes: '0.123' },
        { chemistry: 'nickelCadmium', subCategory: null, tonnes: '0.000' }
      ]
    })
    expect(result.mode).toBe('simple')
    expect(result.t_leadAcid).toBe('0.123')
    expect(result.t_nickelCadmium).toBe('0.000')
  })

  test('flattens detailed-mode lines into t_chemistry_subCategory fields', () => {
    const result = submissionToFormValues({
      useDetailedDataEntry: true,
      lines: [
        { chemistry: 'leadAcid', subCategory: 'buttonCells', tonnes: '0.5' }
      ]
    })
    expect(result.mode).toBe('detailed')
    expect(result.t_leadAcid_buttonCells).toBe('0.5')
  })

  test('handles a submission with no lines', () => {
    expect(submissionToFormValues({ useDetailedDataEntry: true })).toEqual({
      mode: 'detailed'
    })
  })
})
