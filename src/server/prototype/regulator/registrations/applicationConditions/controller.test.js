import { initialiseServer } from '../../../../../test-utils/initialise-server.js'
import { paths } from '../../../../../config/paths.js'
import { statusCodes } from '../../../../common/constants/status-codes.js'
import { APPLICATION_ID } from '../applicationData.js'
import { applicationPath } from '../applicationShared.js'
import { resetRegistrationsStore, saveApplicationDecision } from '../store.js'

const urlFor = (pathKey) =>
  applicationPath(paths[pathKey], { applicationId: APPLICATION_ID })

const url = urlFor('prototypeRegulatorApplicationConditions')

describe('#prototypeRegulatorApplicationConditions', () => {
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

  test('without an approval it redirects to the checks', async () => {
    expect((await get()).statusCode).toBe(statusCodes.found)
  })

  test('renders the heading, scheme name, intro, four-row summary and three conditions', async () => {
    saveApplicationDecision(APPLICATION_ID, { outcome: 'approve', reason: '' })
    const { result, statusCode } = await get()

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('>Conditions of approval</h1>')
    )
    expect(result).toEqual(
      expect.stringContaining(
        'IronWave Compliance — approval number BCS-2026-0147. These conditions apply for as long as the scheme is approved.'
      )
    )
    const summary = result
      .split('data-testid="application-conditions-summary"')[1]
      .split('</dl>')[0]
    expect(summary.split('govuk-summary-list__row').length - 1).toBe(4)
    const list = result
      .split('data-testid="application-conditions-list"')[1]
      .split('</ul>')[0]
    expect(list.match(/<li>/g)).toHaveLength(3)
    expect(list).toEqual(expect.stringContaining('statutory deadlines'))
    expect(list).toEqual(expect.stringContaining('within 28 days'))
    expect(result).toEqual(expect.stringContaining('Download copy (PDF)'))
  })
})
