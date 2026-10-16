import { initialiseServer } from '../../../../test-utils/initialise-server.js'
import { paths } from '../../../../config/paths.js'
import { statusCodes } from '../../../common/constants/status-codes.js'
import { prototypeAbtoContent } from '../../../../config/prototype-abto-content.js'
import { getPayment, getThreshold, resetThresholdStore } from './store.js'

describe('small operator threshold journey', () => {
  let server

  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })
  beforeEach(() => {
    resetThresholdStore()
  })

  const get = (url) => server.inject({ method: 'GET', url })
  const post = (url, payload) => server.inject({ method: 'POST', url, payload })

  describe('email (T0)', () => {
    test('shows seeded figures and a Review and pay button to the threshold screen', async () => {
      const { result, statusCode } = await get(
        paths.prototypeAbtoThresholdEmail
      )
      expect(statusCode).toBe(statusCodes.ok)
      expect(result).toContain('Dear Priya Osei,')
      expect(result).toContain('18.400 tonnes to date')
      expect(result).toContain(
        'within 28 days of crossing the threshold, by 3 October 2026'
      )
      expect(result).toMatch(
        new RegExp(
          `href="${paths.prototypeAbtoThreshold}"[^>]*data-testid="abto-email-action"|data-testid="abto-email-action"[^>]*href="${paths.prototypeAbtoThreshold}"`
        )
      )
      expect(result).not.toContain('Gmail')
    })
  })

  describe('threshold (T1)', () => {
    test('Pay your balance links to the pay screen', async () => {
      const { result } = await get(paths.prototypeAbtoThreshold)
      expect(result).toContain(`href="${paths.prototypeAbtoThresholdPay}"`)
    })
  })

  describe('pay (T2)', () => {
    test('renders summary and two unselected radios, as a task flow with a back link to T1', async () => {
      const { result, statusCode } = await get(paths.prototypeAbtoThresholdPay)
      expect(statusCode).toBe(statusCodes.ok)
      expect(result).toContain('Pay your balance')
      expect(result).toContain('£250.00')
      expect(result).toContain('3 October 2026')
      expect(result).toContain('How do you want to pay?')
      expect(result).toContain('Debit or credit card')
      expect(result).toContain('Bank transfer')
      expect(result).not.toMatch(/<input[^>]*type="radio"[^>]*checked/)
      expect(result).toContain('Continue to payment')
      expect(result).not.toContain('Manage account')
      expect(result).toMatch(
        new RegExp(
          `<a href="${paths.prototypeAbtoThreshold}"[^>]*class="govuk-back-link"`
        )
      )
    })

    test('shows an error summary and inline error when no method is chosen', async () => {
      const { result } = await post(paths.prototypeAbtoThresholdPay, {})
      expect(result).toContain('data-testid="abto-pay-error-summary"')
      expect(result).toContain('govuk-error-message')
      expect(
        result.match(/Select how you want to pay/g).length
      ).toBeGreaterThanOrEqual(2)
      expect(getPayment()).toBeNull()
    })

    test('card goes to the payment stub without recording a payment', async () => {
      const response = await post(paths.prototypeAbtoThresholdPay, {
        paymentMethod: 'card'
      })
      expect(response.statusCode).toBe(statusCodes.found)
      expect(response.headers.location).toBe(
        paths.prototypeAbtoThresholdCardPayment
      )
      expect(getPayment()).toBeNull()
    })

    test('bank transfer (no designed screens) records payment and goes to the confirmation', async () => {
      const response = await post(paths.prototypeAbtoThresholdPay, {
        paymentMethod: 'bank-transfer'
      })
      expect(response.headers.location).toBe(
        paths.prototypeAbtoThresholdPaymentReceived
      )
      expect(getPayment().method).toBe('Bank transfer')
    })
  })

  describe('payment stub', () => {
    test('is clearly a prototype, handled by GOV.UK Pay, with no card fields', async () => {
      const { result, statusCode } = await get(
        paths.prototypeAbtoThresholdCardPayment
      )
      expect(statusCode).toBe(statusCodes.ok)
      expect(result).toContain('handled by GOV.UK Pay')
      expect(result).toContain('This is a prototype. No payment is taken')
      expect(result).toContain('£250.00')
      expect(result).toContain('PAY-2026-9931')
      expect(result).toContain(prototypeAbtoContent.pay.reason)
      expect(result).toContain('Simulate successful payment')
      expect(result).toContain('Simulate cancelling payment')
      const form = result.slice(
        result.indexOf('<form method="post"'),
        result.indexOf('</form>')
      )
      expect(form).not.toMatch(/<input/)
      expect(result).not.toMatch(
        /card.?number|security code|expiry|cardholder/i
      )
      expect(result).toMatch(
        new RegExp(
          `<a href="${paths.prototypeAbtoThresholdPay}"[^>]*class="govuk-back-link"`
        )
      )
    })

    test('simulated success records the card payment and goes to T4', async () => {
      const response = await post(paths.prototypeAbtoThresholdCardPayment, {
        outcome: 'success'
      })
      expect(response.headers.location).toBe(
        paths.prototypeAbtoThresholdPaymentReceived
      )
      expect(getPayment().method).toBe('Debit or credit card')
    })

    test('simulated cancel returns to T2 and records nothing', async () => {
      const response = await post(paths.prototypeAbtoThresholdCardPayment, {
        outcome: 'cancel'
      })
      expect(response.headers.location).toBe(paths.prototypeAbtoThresholdPay)
      expect(getPayment()).toBeNull()
    })
  })

  describe('payment received (T4)', () => {
    test('redirects to T1 if nothing has been paid', async () => {
      const response = await get(paths.prototypeAbtoThresholdPaymentReceived)
      expect(response.statusCode).toBe(statusCodes.found)
      expect(response.headers.location).toBe(paths.prototypeAbtoThreshold)
    })

    test('shows the confirmation from the seeded payment', async () => {
      await post(paths.prototypeAbtoThresholdCardPayment, {
        outcome: 'success'
      })
      const { result, statusCode } = await get(
        paths.prototypeAbtoThresholdPaymentReceived
      )
      expect(statusCode).toBe(statusCodes.ok)
      expect(result).toContain('Balance payment received')
      expect(result).toContain('govuk-notification-banner--success')
      expect(result).toContain('£250.00')
      expect(result).toContain('Debit or credit card')
      expect(result).toContain(getThreshold().payment.reference)
      expect(result).toContain('5 September 2026, 3:10pm')
      expect(result).toContain('Back to your waste returns')
      expect(result).not.toContain('waste submissions')
      expect(result).toContain(`href="${paths.prototypeAbtoWasteReturns}"`)
      expect(result).toContain('Manage account')
    })
  })

  describe('waste returns (F1)', () => {
    test('renders tabs, inset text, returns, shared totals and the start action', async () => {
      const { result, statusCode } = await get(paths.prototypeAbtoWasteReturns)
      expect(statusCode).toBe(statusCodes.ok)
      expect(result).toContain('Your waste returns')
      expect(result).toContain('govuk-tabs')
      for (const tab of [
        'Your sites',
        'Intake log',
        'Waste returns',
        'Queries'
      ]) {
        expect(result).toContain(tab)
      }
      expect(result).toContain('govuk-inset-text')
      expect(result).toContain('Deadline: 31 October 2026 (26 days remaining)')
      expect(result).toContain('Your quarterly waste returns')
      expect(result).toContain('142.350 tonnes')
      expect(result).toContain('data-testid="abto-totals-table"')
      expect(result).toContain('18.400 tonnes')
      expect(result).toContain('Start your Q3 2026 return')
      expect(result).toContain('Only the appropriate person, Priya Osei')
      expect(result).toContain('govuk-select')
      expect(result).toContain('Unit 4, Halton Industrial Park')
      expect(result).not.toContain('govuk-breadcrumbs')
      expect(result).not.toContain('My profile')
    })

    test('uses the same totals table as the threshold screen', async () => {
      const t1 = (await get(paths.prototypeAbtoThreshold)).result
      const f1 = (await get(paths.prototypeAbtoWasteReturns)).result
      const table = (html) =>
        html.slice(
          html.indexOf('data-testid="abto-totals-table"'),
          html.indexOf(
            '</table>',
            html.indexOf('data-testid="abto-totals-table"')
          )
        )
      const squash = (html) => table(html).replace(/\s+/g, ' ')
      expect(squash(f1)).toBe(squash(t1))
    })
  })
})
