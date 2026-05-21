import { collectErrors, errorListToMap, flashStepErrors, readStepErrors } from './shared.js'

const fakeRequest = (returns) => {
  const calls = []
  return {
    yar: {
      flash: (k, v) => {
        calls.push({ k, v })
        if (v !== undefined) return undefined
        return returns[k] ?? []
      }
    },
    calls
  }
}

describe('application/shared', () => {
  test('readStepErrors returns nulls when no flash data exists', () => {
    expect(readStepErrors(fakeRequest({}), 's')).toEqual({
      errors: null,
      values: null
    })
  })

  test('readStepErrors returns flashed errors and values when present', () => {
    const errors = [{ text: 'A', href: '#name' }]
    const values = { name: '' }
    const r = fakeRequest({
      'applicationErrors:s': errors,
      'applicationValues:s': [values]
    })
    expect(readStepErrors(r, 's')).toEqual({ errors, values })
  })

  test('flashStepErrors writes both keys to yar', () => {
    const r = fakeRequest({})
    flashStepErrors(r, 's', [{ text: 'X' }], { x: 1 })
    expect(r.calls).toEqual([
      { k: 'applicationErrors:s', v: [{ text: 'X' }] },
      { k: 'applicationValues:s', v: { x: 1 } }
    ])
  })

  test('errorListToMap', () => {
    expect(errorListToMap([{ text: 'A', href: '#name' }])).toEqual({ name: 'A' })
    expect(errorListToMap(null)).toEqual({})
  })

  test('collectErrors dedupes and skips unmapped fields', () => {
    const je = {
      details: [{ path: ['name'] }, { path: ['name'] }, { path: ['x'] }]
    }
    expect(collectErrors(je, { name: 'A' })).toEqual([
      { text: 'A', href: '#name' }
    ])
  })
})
