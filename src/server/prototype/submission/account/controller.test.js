import { initialiseServer } from '../../../../test-utils/initialise-server.js'
import { paths } from '../../../../config/paths.js'
import { statusCodes } from '../../../common/constants/status-codes.js'

describe('#prototypeSubmissionAccount', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('GET renders the welcome page with banner, tabs and activity table', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.prototypeSubmissionAccount
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('data-testid="account-banner"')
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="account-start-submission"')
    )
    expect(result).toEqual(
      expect.stringContaining(`href="${paths.prototypeSubmissionTaskStart}"`)
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="account-company-name"')
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="account-activity"')
    )
    expect(result).toEqual(expect.stringContaining('Registration confirmed'))
  })
})
