import { initialiseServer } from '../../../../test-utils/initialise-server.js'
import { paths } from '../../../../config/paths.js'
import { statusCodes } from '../../../common/constants/status-codes.js'

describe('#prototypeSubmissionTonnage', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('GET renders the reconfirm tonnage radios', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.prototypeSubmissionTonnage
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('data-testid="tonnage-up-to-1-tonne"')
    )
  })

  test('POST saves to the registration draft and continues to check registration details', async () => {
    const { result } = await server.inject({
      method: 'POST',
      url: paths.prototypeSubmissionTonnage,
      payload: { tonnageBand: 'upTo1Tonne' }
    })
    expect(result).toEqual(expect.stringContaining('"target":"registration"'))
    expect(result).toEqual(
      expect.stringContaining(
        `"nextStep":"${paths.prototypeSubmissionCheckRegistration}"`
      )
    )
  })

  test('POST without a band redirects back', async () => {
    const { statusCode } = await server.inject({
      method: 'POST',
      url: paths.prototypeSubmissionTonnage,
      payload: {}
    })
    expect(statusCode).toBe(statusCodes.found)
  })
})
