import { initialiseServer } from '../../../../../test-utils/initialise-server.js'
import { paths, pathTo } from '../../../../../config/paths.js'
import { statusCodes } from '../../../../common/constants/status-codes.js'

describe('#prototypeRegulatorPomSubmissionRunningDataChecks', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('renders the interstitial and auto-advances to the data check report', async () => {
    const url = pathTo(paths.prototypeRegulatorPomSubmissionRunningDataChecks, {
      schemeId: 'ironwave-compliance'
    })
    const { result, statusCode } = await server.inject({ method: 'GET', url })
    const nextStep = pathTo(
      paths.prototypeRegulatorPomSubmissionDataCheckReport,
      { schemeId: 'ironwave-compliance' }
    )

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(expect.stringContaining('Running data checks'))
    expect(result).toEqual(
      expect.stringContaining(
        `<meta http-equiv="refresh" content="3;url=${nextStep}">`
      )
    )
    expect(result).toEqual(
      expect.stringContaining(
        'Checking IronWaveCompliance_Q2_2026.csv against the CSV template'
      )
    )
    expect(result).toEqual(
      expect.stringContaining('This will take a few seconds')
    )
    expect(result).toEqual(
      expect.stringContaining(
        `href="${nextStep}" data-testid="running-data-checks-continue"`
      )
    )
  })

  test('404s for REPIC, which has no data checks screen in this batch', async () => {
    const url = pathTo(paths.prototypeRegulatorPomSubmissionRunningDataChecks, {
      schemeId: 'repic'
    })
    const { statusCode } = await server.inject({ method: 'GET', url })

    expect(statusCode).toBe(statusCodes.notFound)
  })
})
