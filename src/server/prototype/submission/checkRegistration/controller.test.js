import { initialiseServer } from '../../../../test-utils/initialise-server.js'
import { paths } from '../../../../config/paths.js'
import { statusCodes } from '../../../common/constants/status-codes.js'

describe('#prototypeSubmissionCheckRegistration', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('GET renders the registration summary skeleton with change links returning here', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.prototypeSubmissionCheckRegistration
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('data-testid="check-registration-list"')
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="check-answers-value-batteryTypes"')
    )
    expect(result).toEqual(
      expect.stringContaining(
        `${paths.prototypeSubmissionTonnage}?return=${encodeURIComponent(paths.prototypeSubmissionCheckRegistration)}`
      )
    )
    expect(result).toEqual(
      expect.stringContaining(
        `${paths.prototypeRegistrationOrganisationType}?return=${encodeURIComponent(paths.prototypeSubmissionCheckRegistration)}`
      )
    )
    expect(result).toEqual(
      expect.stringContaining(
        `href="${paths.prototypeSubmissionBrandQuestion}"`
      )
    )
    expect(result).toEqual(
      expect.stringContaining('"step":"checkRegistration"')
    )
  })
})
