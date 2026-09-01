import { initialiseServer } from '../../../../test-utils/initialise-server.js'
import { paths } from '../../../../config/paths.js'
import { statusCodes } from '../../../common/constants/status-codes.js'

describe('#prototypeSubmissionPayFee', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('GET renders the fee interstitial pointing at the payment page', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.prototypeSubmissionPayFee
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(expect.stringContaining('Pay your submission fee'))
    expect(result).toEqual(expect.stringContaining('£30 submission fee'))
    expect(result).toEqual(
      expect.stringContaining(`href="${paths.prototypeSubmissionPayment}"`)
    )
  })
})
