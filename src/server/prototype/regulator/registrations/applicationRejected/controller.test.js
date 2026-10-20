import { initialiseServer } from '../../../../../test-utils/initialise-server.js'
import { paths } from '../../../../../config/paths.js'
import { statusCodes } from '../../../../common/constants/status-codes.js'
import { APPLICATION_ID } from '../applicationData.js'
import { applicationPath } from '../applicationShared.js'
import { resetRegistrationsStore, saveApplicationDecision } from '../store.js'

const urlFor = (pathKey) =>
  applicationPath(paths[pathKey], { applicationId: APPLICATION_ID })

const url = urlFor('prototypeRegulatorApplicationRejected')

describe('#prototypeRegulatorApplicationRejected', () => {
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

  test('without a rejection it redirects to the checks', async () => {
    expect((await get()).statusCode).toBe(statusCodes.found)
  })

  test('puts the H1 before the banner and shows the reason the regulator entered', async () => {
    saveApplicationDecision(APPLICATION_ID, {
      outcome: 'reject',
      reason: 'Scheme rules do not cover fees'
    })
    const { result, statusCode } = await get()

    expect(statusCode).toBe(statusCodes.ok)
    expect(result.indexOf('>IronWave Compliance</h1>')).toBeGreaterThan(-1)
    expect(result.indexOf('>IronWave Compliance</h1>')).toBeLessThan(
      result.indexOf('data-testid="application-rejected-banner"')
    )
    expect(result).toEqual(expect.stringContaining('Registration rejected'))
    const summary = result
      .split('data-testid="application-rejected-summary"')[1]
      .split('</dl>')[0]
    expect(summary.split('govuk-summary-list__row').length - 1).toBe(3)
    expect(summary).toEqual(
      expect.stringContaining('Scheme rules do not cover fees')
    )
    expect(result).toEqual(
      expect.stringContaining('Back to Compliance schemes')
    )
  })

  test('escapes the reason', async () => {
    saveApplicationDecision(APPLICATION_ID, {
      outcome: 'reject',
      reason: '<b>bold</b>'
    })
    const { result } = await get()
    expect(result).not.toEqual(expect.stringContaining('<b>bold</b>'))
  })
})
