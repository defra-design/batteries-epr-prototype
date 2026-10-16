import { initialiseServer } from '../../../../../test-utils/initialise-server.js'
import { paths } from '../../../../../config/paths.js'
import { statusCodes } from '../../../../common/constants/status-codes.js'
import { getPreRegistrationInvite, resetRegistrationsStore } from '../store.js'

describe('#prototypeRegulatorPreRegistrationLink', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })
  beforeEach(() => {
    resetRegistrationsStore()
  })

  const post = (payload) =>
    server.inject({
      method: 'POST',
      url: paths.prototypeRegulatorPreRegistrationLink,
      payload
    })

  test('GET renders the heading, intro, two inputs, button and breadcrumb', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.prototypeRegulatorPreRegistrationLink
    })

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('>Pre-registration link</h1>')
    )
    expect(result).toEqual(
      expect.stringContaining(
        'Enter the name and email address of the person who enquired about registering a new batteries compliance scheme.'
      )
    )
    expect(result).toEqual(expect.stringContaining('>NPWD</a>'))
    expect(result).toEqual(
      expect.stringContaining(`href="${paths.prototypeRegulatorRegistrations}"`)
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="pre-registration-link-name"')
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="pre-registration-link-email"')
    )
    expect(result).toEqual(expect.stringContaining('Send link'))
  })

  test('a valid submission stores the invite and redirects to the confirmation', async () => {
    const { statusCode, headers } = await post({
      name: "Sarah O'Finch-Smith",
      email: 'sarah.finch@example.co.uk'
    })

    expect(statusCode).toBe(statusCodes.found)
    expect(headers.location).toBe(
      paths.prototypeRegulatorPreRegistrationLinkSent
    )
    expect(getPreRegistrationInvite()).toMatchObject({
      name: "Sarah O'Finch-Smith",
      email: 'sarah.finch@example.co.uk'
    })
  })

  test('missing name and email show an error summary and inline errors', async () => {
    const { result, statusCode } = await post({ name: '', email: '' })

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining(
        'data-testid="pre-registration-link-error-summary"'
      )
    )
    expect(result).toEqual(expect.stringContaining('There is a problem'))
    expect(result).toEqual(expect.stringContaining('href="#name"'))
    expect(result).toEqual(expect.stringContaining('href="#email"'))
    expect(result).toEqual(expect.stringContaining('Enter their full name'))
    expect(result).toEqual(expect.stringContaining('Enter their email address'))
    expect(result).toEqual(expect.stringContaining('govuk-error-message'))
    expect(getPreRegistrationInvite()).toBeNull()
  })

  test('a malformed email is rejected and the entered values are kept', async () => {
    const { result } = await post({
      name: 'Sarah Finch',
      email: 'not-an-email'
    })

    expect(result).toEqual(
      expect.stringContaining(
        'Enter an email address in the correct format, like name@example.com'
      )
    )
    expect(result).toEqual(expect.stringContaining('value="Sarah Finch"'))
    expect(result).toEqual(expect.stringContaining('value="not-an-email"'))
    expect(result).not.toEqual(expect.stringContaining('Enter their full name'))
    expect(getPreRegistrationInvite()).toBeNull()
  })

  test('a malformed name is rejected', async () => {
    const { result } = await post({
      name: '12345 <script>',
      email: 'sarah@example.co.uk'
    })

    expect(result).toEqual(
      expect.stringContaining('Full name must only include letters')
    )
    expect(getPreRegistrationInvite()).toBeNull()
  })

  test('an over-long name is rejected', async () => {
    const { result } = await post({
      name: 'a'.repeat(101),
      email: 'sarah@example.co.uk'
    })

    expect(result).toEqual(
      expect.stringContaining('Full name must be 100 characters or fewer')
    )
  })

  test('an empty POST body shows the missing name and email errors', async () => {
    const { result, statusCode } = await server.inject({
      method: 'POST',
      url: paths.prototypeRegulatorPreRegistrationLink
    })

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(expect.stringContaining('Enter their full name'))
    expect(result).toEqual(expect.stringContaining('Enter their email address'))
  })
})
