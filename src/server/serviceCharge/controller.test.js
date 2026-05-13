import { initialiseServer } from '../../test-utils/initialise-server.js'
import { paths } from '../../config/paths.js'
import { statusCodes } from '../common/constants/status-codes.js'

describe('#serviceChargeController', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('renders the service-charge chrome with placeholders', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.serviceCharge
    })
    expect(statusCode).toBe(statusCodes.ok)
    for (const id of [
      'service-charge-loading',
      'service-charge-content',
      'service-charge-organisation',
      'service-charge-period',
      'service-charge-fee',
      'service-charge-pay',
      'service-charge-cancel',
      'service-charge-processing'
    ]) {
      expect(result).toEqual(expect.stringContaining(`data-testid="${id}"`))
    }
  })

  test('emits the service-charge bundle and a payload with linked URLs', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: paths.serviceCharge
    })
    expect(result).toEqual(expect.stringContaining('serviceCharge'))
    expect(result).toEqual(
      expect.stringContaining(`"paymentDetailsUrl":"${paths.paymentDetails}"`)
    )
    expect(result).toEqual(
      expect.stringContaining(`"dashboardUrl":"${paths.dashboard}"`)
    )
    expect(result).toEqual(expect.stringContaining('"compliancePeriod":"2026"'))
  })
})
