import { initialiseServer } from '../../../../../test-utils/initialise-server.js'
import { paths, pathTo } from '../../../../../config/paths.js'
import { statusCodes } from '../../../../common/constants/status-codes.js'

const url = pathTo(paths.prototypeRegulatorPomSubmissionRunningDataChecks, {
  schemeId: 'ironwave-compliance'
})
const nextUrl = pathTo(paths.prototypeRegulatorPomSubmissionDataCheckReport, {
  schemeId: 'ironwave-compliance'
})

describe('#prototypeRegulatorPomSubmissionRunningDataChecks', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('renders the H1, intro, wait message and spinner on the regulator layout', async () => {
    const { result, statusCode } = await server.inject({ method: 'GET', url })

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(expect.stringContaining('>Running data checks</h1>'))
    expect(result).toEqual(
      expect.stringContaining(
        'Comparing each producer’s figures with the previous quarter and the same quarter last year.'
      )
    )
    expect(result).toEqual(
      expect.stringContaining(
        'This will take a few seconds. Do not close the page.'
      )
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="running-data-checks-spinner"')
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="regulator-nav-pomSubmissions"')
    )
  })

  test('auto-advances after 5 seconds three ways: script timeout, meta refresh and a visible link', async () => {
    const { result } = await server.inject({ method: 'GET', url })

    expect(result).toEqual(
      expect.stringContaining(`data-auto-advance-url="${nextUrl}"`)
    )
    expect(result).toEqual(
      expect.stringContaining('data-auto-advance-delay="5000"')
    )
    expect(result).toEqual(
      expect.stringContaining(
        `<meta http-equiv="refresh" content="5;url=${nextUrl}">`
      )
    )
    expect(result).toEqual(
      expect.stringMatching(/<script[^>]*regulatorAutoAdvance[^>]*\.js/)
    )
    const link = result.match(
      /<a[^>]*data-testid="running-data-checks-continue"[^>]*>/
    )[0]
    expect(link).toEqual(expect.stringContaining(`href="${nextUrl}"`))
  })

  test('404s for a scheme without a data check screen', async () => {
    const { statusCode } = await server.inject({
      method: 'GET',
      url: pathTo(paths.prototypeRegulatorPomSubmissionRunningDataChecks, {
        schemeId: 'repic'
      })
    })
    expect(statusCode).toBe(statusCodes.notFound)
  })
})
