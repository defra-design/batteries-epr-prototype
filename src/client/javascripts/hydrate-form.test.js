// @vitest-environment jsdom
import { describe, expect, test } from 'vitest'

import { hydrateForm } from './hydrate-form.js'

const buildForm = (html) => {
  const wrapper = document.createElement('div')
  wrapper.innerHTML = html
  return wrapper.querySelector('form')
}

describe('hydrateForm', () => {
  test('fills text and email inputs by name', () => {
    const form = buildForm(`
      <form>
        <input name="companyName" />
        <input name="contactEmail" type="email" />
      </form>
    `)

    hydrateForm(form, {
      companyName: 'Acme Ltd',
      contactEmail: 'a@b.com'
    })

    expect(form.querySelector('[name="companyName"]').value).toBe('Acme Ltd')
    expect(form.querySelector('[name="contactEmail"]').value).toBe('a@b.com')
  })

  test('supports dot notation for nested values', () => {
    const form = buildForm(`
      <form>
        <input name="registeredAddress.postcode" />
      </form>
    `)

    hydrateForm(form, {
      registeredAddress: { postcode: 'M1 4AA' }
    })

    expect(
      form.querySelector('[name="registeredAddress.postcode"]').value
    ).toBe('M1 4AA')
  })

  test('checks checkboxes when value is truthy', () => {
    const form = buildForm(`
      <form>
        <input type="checkbox" name="batteryTypes.isPortable" />
        <input type="checkbox" name="batteryTypes.isIndustrial" />
      </form>
    `)

    hydrateForm(form, {
      batteryTypes: { isPortable: true, isIndustrial: false }
    })

    expect(form.querySelector('[name="batteryTypes.isPortable"]').checked).toBe(
      true
    )
    expect(
      form.querySelector('[name="batteryTypes.isIndustrial"]').checked
    ).toBe(false)
  })

  test('selects the matching radio button', () => {
    const form = buildForm(`
      <form>
        <input type="radio" name="producerRoute" value="smallProducer" />
        <input type="radio" name="producerRoute" value="directRegistrant" />
      </form>
    `)

    hydrateForm(form, { producerRoute: 'directRegistrant' })

    const radios = form.querySelectorAll('[name="producerRoute"]')
    expect(radios[0].checked).toBe(false)
    expect(radios[1].checked).toBe(true)
  })

  test('skips fields whose source value is undefined', () => {
    const form = buildForm(`
      <form>
        <input name="companyName" value="Existing" />
      </form>
    `)

    hydrateForm(form, { other: 'x' })

    expect(form.querySelector('[name="companyName"]').value).toBe('Existing')
  })

  test('writes empty string for null values', () => {
    const form = buildForm(`
      <form>
        <input name="webAddress" value="https://old.example.com" />
      </form>
    `)

    hydrateForm(form, { webAddress: null })

    expect(form.querySelector('[name="webAddress"]').value).toBe('')
  })

  test('returns silently on missing form or missing source', () => {
    expect(() => hydrateForm(null, {})).not.toThrow()
    expect(() => hydrateForm(buildForm('<form></form>'), null)).not.toThrow()
  })

  test('handles missing nested path without throwing', () => {
    const form = buildForm(`
      <form>
        <input name="registeredAddress.postcode" />
      </form>
    `)

    hydrateForm(form, {})
    expect(
      form.querySelector('[name="registeredAddress.postcode"]').value
    ).toBe('')
  })
})
