import { initialiseServer } from '../../../../test-utils/initialise-server.js'
import { paths } from '../../../../config/paths.js'
import { statusCodes } from '../../../common/constants/status-codes.js'

describe('#prototypeSubmissionPayment', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('GET renders the order summary and fake card form', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.prototypeSubmissionPayment
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('data-testid="payment-reference"')
    )
    expect(result).toEqual(expect.stringContaining('£30.00'))
    expect(result).toEqual(
      expect.stringContaining('data-testid="payment-card-number"')
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="payment-make-payment"')
    )
  })

  test('POST emits a payment payload pointing at the confirmation', async () => {
    const { result, statusCode } = await server.inject({
      method: 'POST',
      url: paths.prototypeSubmissionPayment,
      payload: { cardNumber: '4242424242424242' }
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(expect.stringContaining('"target":"payment"'))
    expect(result).toEqual(
      expect.stringContaining(
        `"nextStep":"${paths.prototypeSubmissionPaymentConfirmed}"`
      )
    )
  })
})
