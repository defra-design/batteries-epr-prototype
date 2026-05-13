import { initialiseServer } from '../../test-utils/initialise-server.js'
import { paths } from '../../config/paths.js'
import { statusCodes } from '../common/constants/status-codes.js'

describe('#paymentDetailsController', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('renders the payment-details chrome with receipt placeholders', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.paymentDetails
    })
    expect(statusCode).toBe(statusCodes.ok)
    for (const id of [
      'payment-details-loading',
      'payment-details-content',
      'payment-details-organisation',
      'payment-details-period',
      'payment-details-amount',
      'payment-details-id',
      'payment-details-continue'
    ]) {
      expect(result).toEqual(expect.stringContaining(`data-testid="${id}"`))
    }
    expect(result).toEqual(expect.stringContaining(`href="${paths.dashboard}"`))
  })
})
