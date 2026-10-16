import { format } from 'date-fns'

import { initialiseServer } from '../../../../../test-utils/initialise-server.js'
import { paths } from '../../../../../config/paths.js'
import { statusCodes } from '../../../../common/constants/status-codes.js'
import { resetRegistrationsStore, savePreRegistrationInvite } from '../store.js'

describe('#prototypeRegulatorPreRegistrationLinkSent', () => {
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

  const get = (url = paths.prototypeRegulatorPreRegistrationLinkSent) =>
    server.inject({ method: 'GET', url })

  test('redirects to the form when no link has been sent', async () => {
    const { statusCode, headers } = await get()

    expect(statusCode).toBe(statusCodes.found)
    expect(headers.location).toBe(paths.prototypeRegulatorPreRegistrationLink)
  })

  test('has an H1 and the success banner with the confirmation message', async () => {
    savePreRegistrationInvite({
      name: 'Ada Lovelace',
      email: 'ada@example.org'
    })
    const { result, statusCode } = await get()

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('>Pre-registration link</h1>')
    )
    expect(result).toEqual(
      expect.stringContaining('govuk-notification-banner--success')
    )
    expect(result).toEqual(
      expect.stringContaining('Pre-registration link sent')
    )
    expect(result).toEqual(
      expect.stringContaining(
        'An email with a link to start registration has been sent. The link expires in 7 days.'
      )
    )
  })

  test("shows the entered email and today's date, not hardcoded values", async () => {
    savePreRegistrationInvite({
      name: 'Ada Lovelace',
      email: 'ada@example.org'
    })
    const { result } = await get()

    expect(result).toEqual(expect.stringContaining('Invited'))
    expect(result).toEqual(expect.stringContaining('ada@example.org'))
    expect(result).toEqual(
      expect.stringContaining(format(new Date(), 'd MMMM yyyy'))
    )
    expect(result).not.toEqual(
      expect.stringContaining('sarah.finch@example.co.uk')
    )
  })

  test('links to resend the link and back to Registrations', async () => {
    savePreRegistrationInvite({
      name: 'Ada Lovelace',
      email: 'ada@example.org'
    })
    const { result } = await get()

    expect(result).toEqual(
      expect.stringContaining(
        `href="${paths.prototypeRegulatorPreRegistrationLinkResend}"`
      )
    )
    expect(result).toEqual(
      expect.stringContaining('Resend the pre-registration link')
    )
    expect(result).toEqual(
      expect.stringContaining(`href="${paths.prototypeRegulatorRegistrations}"`)
    )
    expect(result).toEqual(expect.stringContaining('Back to Registrations'))
  })

  test('resend returns to the confirmation page', async () => {
    savePreRegistrationInvite({
      name: 'Ada Lovelace',
      email: 'ada@example.org'
    })
    const { statusCode, headers } = await get(
      paths.prototypeRegulatorPreRegistrationLinkResend
    )

    expect(statusCode).toBe(statusCodes.found)
    expect(headers.location).toBe(
      paths.prototypeRegulatorPreRegistrationLinkSent
    )
  })
})
