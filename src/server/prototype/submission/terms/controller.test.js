import { initialiseServer } from '../../../../test-utils/initialise-server.js'
import { paths } from '../../../../config/paths.js'
import { statusCodes } from '../../../common/constants/status-codes.js'

describe('#prototypeSubmissionTerms', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('GET renders the terms summary and agreement checkbox', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.prototypeSubmissionTerms
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(expect.stringContaining('Terms and conditions'))
    expect(result).toEqual(
      expect.stringContaining('data-testid="terms-summary"')
    )
    expect(result).toEqual(expect.stringContaining('data-testid="terms-agree"'))
  })

  test('POST with agreement continues to the account', async () => {
    const { statusCode, headers } = await server.inject({
      method: 'POST',
      url: paths.prototypeSubmissionTerms,
      payload: { agree: 'on' }
    })
    expect(statusCode).toBe(statusCodes.found)
    expect(headers.location).toBe(paths.prototypeSubmissionAccount)
  })

  test('POST without agreement redirects back with a flashed error', async () => {
    const post = await server.inject({
      method: 'POST',
      url: paths.prototypeSubmissionTerms,
      payload: {}
    })
    expect(post.statusCode).toBe(statusCodes.found)
    expect(post.headers.location).toBe(paths.prototypeSubmissionTerms)

    const cookie = post.headers['set-cookie']?.[0]?.split(';')[0]
    const { result } = await server.inject({
      method: 'GET',
      url: paths.prototypeSubmissionTerms,
      headers: { cookie }
    })
    expect(result).toEqual(
      expect.stringContaining(
        'data-testid="prototype-submission-error-summary"'
      )
    )
  })
})
