import { statusCodes } from '../common/constants/status-codes.js'
import { initialiseServer } from '../../test-utils/initialise-server.js'
import { paths, pathTo } from '../../config/paths.js'
import { config } from '../../config/config.js'

describe('#devResetController', () => {
  let server

  beforeAll(async () => {
    server = await initialiseServer()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test.each([false, true])(
    'renders the dev-reset page when isProduction=%s',
    async (isProduction) => {
      config.set('isProduction', isProduction)

      const { result, statusCode } = await server.inject({
        method: 'GET',
        url: paths.devReset
      })

      expect(statusCode).toBe(statusCodes.ok)
      expect(result).toEqual(
        expect.stringContaining('data-testid="dev-reset-confirm"')
      )
    }
  )

  test('POST resets the regulator store and responds with no content', async () => {
    const { statusCode, payload } = await server.inject({
      method: 'POST',
      url: paths.devReset
    })

    expect(statusCode).toBe(statusCodes.noContent)
    expect(payload).toBe('')
  })

  test('POST clears a decision made against the regulator store', async () => {
    const reviewUrl = pathTo(
      paths.prototypeRegulatorPomSubmissionReviewPomReturn,
      { schemeId: 'ironwave-compliance', year: '2026', quarter: 'Q2' }
    )

    await server.inject({
      method: 'POST',
      url: reviewUrl,
      payload: { decision: 'accept', reason: 'Reset test.' }
    })
    const decided = await server.inject({ method: 'GET', url: reviewUrl })
    expect(decided.result).toEqual(
      expect.stringMatching(/govuk-tag--green"[^>]*>\s*Accepted\s*<\/strong>/)
    )

    await server.inject({ method: 'POST', url: paths.devReset })

    const reset = await server.inject({ method: 'GET', url: reviewUrl })
    expect(reset.result).toEqual(
      expect.stringMatching(/govuk-tag--blue"[^>]*>\s*Received\s*<\/strong>/)
    )
  })
})
