import { initialiseServer } from '../../../../../test-utils/initialise-server.js'
import { paths } from '../../../../../config/paths.js'
import { statusCodes } from '../../../../common/constants/status-codes.js'
import { APPLICATION_ID } from '../applicationData.js'
import { applicationPath } from '../applicationShared.js'
import { resetRegistrationsStore, saveApplicationDecision } from '../store.js'

const urlFor = (pathKey) =>
  applicationPath(paths[pathKey], { applicationId: APPLICATION_ID })

const url = urlFor('prototypeRegulatorApplicationAccepted')

describe('#prototypeRegulatorApplicationAccepted', () => {
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

  const get = () => server.inject({ method: 'GET', url })

  test('without an approval it sends the regulator back to the checks', async () => {
    const { statusCode, headers } = await get()
    expect(statusCode).toBe(statusCodes.found)
    expect(headers.location).toBe(urlFor('prototypeRegulatorApplication'))
  })

  test('puts the H1 before the success banner, then the five completed actions', async () => {
    saveApplicationDecision(APPLICATION_ID, { outcome: 'approve', reason: '' })
    const { result, statusCode } = await get()

    expect(statusCode).toBe(statusCodes.ok)
    expect(result.indexOf('>IronWave Compliance</h1>')).toBeGreaterThan(-1)
    expect(result.indexOf('>IronWave Compliance</h1>')).toBeLessThan(
      result.indexOf('data-testid="application-accepted-banner"')
    )
    expect(result).toEqual(expect.stringContaining('Registration accepted'))
    expect(result).toEqual(
      expect.stringContaining('Actions completed automatically')
    )
    expect(result.match(/>\s*Done\s*</g)).toHaveLength(5)
    expect(result).toEqual(
      expect.stringContaining('username emailed to Tom Whitfield')
    )
    expect(result).toEqual(
      expect.stringContaining('confirmation link sent to Priya Shah')
    )
    expect(result).toEqual(expect.stringContaining('BCS-2026-0147'))
  })

  test('links to the scheme record and the conditions of approval', async () => {
    saveApplicationDecision(APPLICATION_ID, { outcome: 'approve', reason: '' })
    const { result } = await get()

    expect(result).toEqual(
      expect.stringContaining(
        `href="${urlFor('prototypeRegulatorApplicationSchemeRecord')}"`
      )
    )
    expect(result).toEqual(
      expect.stringContaining(
        `href="${urlFor('prototypeRegulatorApplicationConditions')}"`
      )
    )
  })

  test('shows the four-row summary', async () => {
    saveApplicationDecision(APPLICATION_ID, { outcome: 'approve', reason: '' })
    const { result } = await get()
    const list = result
      .split('data-testid="application-accepted-summary"')[1]
      .split('</dl>')[0]

    expect(list.split('govuk-summary-list__row').length - 1).toBe(4)
    expect(list).toEqual(expect.stringContaining('Approved'))
    expect(list).toEqual(
      expect.stringContaining('tom.whitfield@ironwave.co.uk')
    )
  })

  test('a rejection does not unlock it', async () => {
    saveApplicationDecision(APPLICATION_ID, { outcome: 'reject', reason: 'x' })
    expect((await get()).statusCode).toBe(statusCodes.found)
  })
})
