import { initialiseServer } from '../../../../test-utils/initialise-server.js'
import { paths } from '../../../../config/paths.js'
import { statusCodes } from '../../../common/constants/status-codes.js'

describe('#prototypeSubmissionBrandQuestion', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('GET renders the brand question with save and exit links', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.prototypeSubmissionBrandQuestion
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('data-testid="brand-question-yes"')
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="brand-question-save"')
    )
  })

  test('POST yes continues to adding brand names', async () => {
    const { result } = await server.inject({
      method: 'POST',
      url: paths.prototypeSubmissionBrandQuestion,
      payload: { hasBrand: 'yes' }
    })
    expect(result).toEqual(
      expect.stringContaining(
        `"nextStep":"${paths.prototypeSubmissionBrandAdd}"`
      )
    )
  })

  test('POST no skips ahead to the battery data step', async () => {
    const { result } = await server.inject({
      method: 'POST',
      url: paths.prototypeSubmissionBrandQuestion,
      payload: { hasBrand: 'no' }
    })
    expect(result).toEqual(
      expect.stringContaining(`"nextStep":"${paths.prototypeSubmissionData}"`)
    )
  })

  test('POST without a choice redirects back', async () => {
    const { statusCode } = await server.inject({
      method: 'POST',
      url: paths.prototypeSubmissionBrandQuestion,
      payload: {}
    })
    expect(statusCode).toBe(statusCodes.found)
  })
})
