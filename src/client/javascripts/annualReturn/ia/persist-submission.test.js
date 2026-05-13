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
  test('creates a new submission and updates an existing one', () => {
    const first = upsertSubmission('reg-1', {
      submissionType: 'industrialAutomotiveAnnual',
      lines: []
    })
    const second = upsertSubmission('reg-1', {
      submissionType: 'industrialAutomotiveAnnual',
      lines: [
        {
          category: 'industrial',
          activity: 'placed',
          chemistry: 'leadAcid',
          subCategory: null,
          tonnes: '1.000'
        }
      ]
    })
    expect(second.id).toBe(first.id)
    expect(storage.listSubmissionsForRegistration('reg-1')).toHaveLength(1)
  })

  test('creates a new submission when only Submitted ones exist', () => {
    storage.saveSubmission({
      registrationId: 'reg-1',
      status: 'Submitted',
      lines: []
    })
    upsertSubmission('reg-1', {
      submissionType: 'industrialAutomotiveAnnual',
      lines: []
    })
    expect(storage.listSubmissionsForRegistration('reg-1')).toHaveLength(2)
  })
})

describe('readActiveSubmission', () => {
  test('returns null when none exists', () => {
    expect(readActiveSubmission('reg-1')).toBeNull()
  })

  test('returns the non-Submitted submission', () => {
    upsertSubmission('reg-1', {
      submissionType: 'industrialAutomotiveAnnual',
      lines: []
    })
    expect(readActiveSubmission('reg-1')).not.toBeNull()
  })
})

describe('submissionToFormValues', () => {
  test('returns an empty object when submission is null', () => {
    expect(submissionToFormValues(null)).toEqual({})
  })

  test('flattens lines into t_category_activity_chemistry fields', () => {
    const result = submissionToFormValues({
      lines: [
        {
          category: 'industrial',
          activity: 'placed',
          chemistry: 'leadAcid',
          subCategory: null,
          tonnes: '1.000'
        },
        {
          category: 'automotive',
          activity: 'exported',
          chemistry: 'other',
          subCategory: null,
          tonnes: '0.500'
        }
      ]
    })
    expect(result.t_industrial_placed_leadAcid).toBe('1.000')
    expect(result.t_automotive_exported_other).toBe('0.500')
  })

  test('skips lines that have a sub-category set', () => {
    const result = submissionToFormValues({
      lines: [
        {
          category: 'industrial',
          activity: 'placed',
          chemistry: 'leadAcid',
          subCategory: 'buttonCells',
          tonnes: '0.100'
        }
      ]
    })
    expect(result).toEqual({})
  })

  test('handles a submission with no lines array', () => {
    expect(submissionToFormValues({})).toEqual({})
  })
})
