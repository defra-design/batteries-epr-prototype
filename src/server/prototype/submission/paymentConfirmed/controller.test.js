import { initialiseServer } from '../../../../test-utils/initialise-server.js'
import { paths } from '../../../../config/paths.js'
import { statusCodes } from '../../../common/constants/status-codes.js'

describe('#prototypeSubmissionPaymentConfirmed', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('GET renders the payment received panel skeleton', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.prototypeSubmissionPaymentConfirmed
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(expect.stringContaining('Payment received'))
    expect(result).toEqual(
      expect.stringContaining('data-testid="payment-confirmed-reference"')
    )
    expect(result).toEqual(
      expect.stringContaining(`href="${paths.prototypeSubmissionAccount}"`)
    )
    expect(result).toEqual(expect.stringContaining('"step":"paymentConfirmed"'))
  })
})
