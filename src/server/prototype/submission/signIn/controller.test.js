import { initialiseServer } from '../../../../test-utils/initialise-server.js'
import { paths } from '../../../../config/paths.js'
import { statusCodes } from '../../../common/constants/status-codes.js'

describe('#prototypeSubmissionSignIn', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('GET renders the NPWD-style sign in form', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.prototypeSubmissionSignIn
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('data-testid="submission-username"')
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="submission-password"')
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="submission-forgot-password"')
    )
  })

  test('POST passes through to the terms and conditions', async () => {
    const { statusCode, headers } = await server.inject({
      method: 'POST',
      url: paths.prototypeSubmissionSignIn,
      payload: { username: 'bab', password: 'secret' }
    })
    expect(statusCode).toBe(statusCodes.found)
    expect(headers.location).toBe(paths.prototypeSubmissionTerms)
  })
})
