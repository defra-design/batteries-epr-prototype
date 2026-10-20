import { initialiseServer } from '../../../../../test-utils/initialise-server.js'
import { paths } from '../../../../../config/paths.js'
import { statusCodes } from '../../../../common/constants/status-codes.js'
import { APPLICATION_ID } from '../applicationData.js'
import { applicationPath } from '../applicationShared.js'
import { resetRegistrationsStore, saveApplicationDecision } from '../store.js'

const urlFor = (pathKey) =>
  applicationPath(paths[pathKey], { applicationId: APPLICATION_ID })

const url = urlFor('prototypeRegulatorApplicationSchemeRecord')

describe('#prototypeRegulatorApplicationSchemeRecord', () => {
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

  test('renders the scheme record with the approval number and registered office', async () => {
    const { result, statusCode } = await get()

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toMatch(/<h1[^>]*>\s*IronWave Compliance/)
    expect(result).toEqual(expect.stringContaining('BCS-2026-0147'))
    expect(result).toEqual(expect.stringContaining('Registered office'))
    expect(result).toEqual(expect.stringContaining('TF8 7NP'))
    expect(result).toEqual(expect.stringContaining('Manage this scheme'))
    expect(result).toEqual(expect.stringContaining('Priya Shah, Director'))
  })

  test('the approval status follows the decision', async () => {
    expect((await get()).result).toEqual(
      expect.stringContaining('Awaiting decision')
    )
    saveApplicationDecision(APPLICATION_ID, { outcome: 'approve', reason: '' })
    expect((await get()).result).toMatch(/>\s*Approved\s*</)
    saveApplicationDecision(APPLICATION_ID, { outcome: 'reject', reason: 'x' })
    expect((await get()).result).toMatch(/>\s*Rejected\s*</)
  })
})
