// @vitest-environment jsdom
import { describe, expect, test, vi } from 'vitest'

import { PAGE_PAYLOAD_ELEMENT_ID, readPagePayload } from './page-payload.js'

const installPayload = (text, id = PAGE_PAYLOAD_ELEMENT_ID) => {
  document.body.innerHTML = `<script id="${id}" type="application/json">${text}</script>`
}

describe('readPagePayload', () => {
  test('parses a valid JSON payload from #page-payload', () => {
    installPayload('{"email":"a@b.com"}')
    expect(readPagePayload()).toEqual({ email: 'a@b.com' })
  })

  test('returns null when the payload element is missing', () => {
    document.body.innerHTML = ''
    expect(readPagePayload()).toBeNull()
  })

  test('returns null and warns on malformed JSON', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    installPayload('{not json')
    expect(readPagePayload()).toBeNull()
    expect(warn).toHaveBeenCalled()
    warn.mockRestore()
  })

  test('supports a custom element id', () => {
    installPayload('{"x":1}', 'my-custom-id')
    expect(readPagePayload(document, 'my-custom-id')).toEqual({ x: 1 })
  })

  test('returns null when called without a document', () => {
    expect(readPagePayload(null)).toBeNull()
  })

  test('returns null when the document has no getElementById', () => {
    expect(readPagePayload({})).toBeNull()
  })

  test('returns null when the payload element has no textContent', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const fakeDoc = {
      getElementById: () => ({ textContent: null })
    }
    expect(readPagePayload(fakeDoc)).toBeNull()
    warn.mockRestore()
  })
})
