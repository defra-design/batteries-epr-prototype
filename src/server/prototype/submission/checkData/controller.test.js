import { initialiseServer } from '../../../../test-utils/initialise-server.js'
import { paths } from '../../../../config/paths.js'
import { statusCodes } from '../../../common/constants/status-codes.js'

describe('#prototypeSubmissionCheckData', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('GET renders the data summary skeleton and declaration form', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.prototypeSubmissionCheckData
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('data-testid="check-data-value-brandNames"')
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="check-data-value-total"')
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="check-data-first-name"')
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="check-data-acknowledge"')
    )
  })

  test('POST with the declaration submits and continues to the fee page', async () => {
    const { result, statusCode } = await server.inject({
      method: 'POST',
      url: paths.prototypeSubmissionCheckData,
      payload: {
        declFirstName: 'Scarlet',
        declLastName: 'Elfcup',
        declRole: 'Director',
        acknowledged: 'on'
      }
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(expect.stringContaining('"target":"submit"'))
    expect(result).toEqual(expect.stringContaining('"declFirstName":"Scarlet"'))
    expect(result).toEqual(
      expect.stringContaining(`"nextStep":"${paths.prototypeSubmissionPayFee}"`)
    )
  })

  test('POST without the acknowledgement redirects back with errors', async () => {
    const post = await server.inject({
      method: 'POST',
      url: paths.prototypeSubmissionCheckData,
      payload: {
        declFirstName: 'Scarlet',
        declLastName: 'Elfcup',
        declRole: 'Director'
      }
    })
    expect(post.statusCode).toBe(statusCodes.found)

    const cookie = post.headers['set-cookie']?.[0]?.split(';')[0]
    const { result } = await server.inject({
      method: 'GET',
      url: paths.prototypeSubmissionCheckData,
      headers: { cookie }
    })
    expect(result).toEqual(
      expect.stringContaining(
        'data-testid="prototype-submission-error-summary"'
      )
    )
  })
})
