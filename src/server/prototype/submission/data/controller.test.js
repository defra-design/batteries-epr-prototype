import { initialiseServer } from '../../../../test-utils/initialise-server.js'
import { paths } from '../../../../config/paths.js'
import { statusCodes } from '../../../common/constants/status-codes.js'

describe('#prototypeSubmissionData', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('GET renders the unit radios, weight inputs and running total', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.prototypeSubmissionData
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('data-testid="data-unit-kilograms"')
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="data-weight-lead-acid"')
    )
    expect(result).toEqual(expect.stringContaining('data-testid="data-total"'))
  })

  test('POST saves the weights and continues to check battery data', async () => {
    const { result, statusCode } = await server.inject({
      method: 'POST',
      url: paths.prototypeSubmissionData,
      payload: {
        unit: 'kilograms',
        weightLeadAcid: '45',
        weightNickelCadmium: '10',
        weightOther: '50'
      }
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(expect.stringContaining('"weightLeadAcid":"45"'))
    expect(result).toEqual(
      expect.stringContaining(
        `"nextStep":"${paths.prototypeSubmissionCheckData}"`
      )
    )
  })

  test('POST with a non-numeric weight redirects back with errors', async () => {
    const post = await server.inject({
      method: 'POST',
      url: paths.prototypeSubmissionData,
      payload: { unit: 'kilograms', weightLeadAcid: 'lots' }
    })
    expect(post.statusCode).toBe(statusCodes.found)

    const cookie = post.headers['set-cookie']?.[0]?.split(';')[0]
    const { result } = await server.inject({
      method: 'GET',
      url: paths.prototypeSubmissionData,
      headers: { cookie }
    })
    expect(result).toEqual(
      expect.stringContaining(
        'data-testid="prototype-submission-error-summary"'
      )
    )
  })

  test('POST without a unit redirects back', async () => {
    const { statusCode } = await server.inject({
      method: 'POST',
      url: paths.prototypeSubmissionData,
      payload: { weightLeadAcid: '45' }
    })
    expect(statusCode).toBe(statusCodes.found)
  })
})
