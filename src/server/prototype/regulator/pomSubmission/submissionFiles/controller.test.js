import { initialiseServer } from '../../../../../test-utils/initialise-server.js'
import { paths, pathTo } from '../../../../../config/paths.js'
import { statusCodes } from '../../../../common/constants/status-codes.js'

const params = { schemeId: 'ironwave-compliance', year: '2026', quarter: 'Q2' }
const FILES_URL = pathTo(
  paths.prototypeRegulatorPomSubmissionSubmissionFiles,
  params
)

describe('#prototypeRegulatorPomSubmissionSubmissionFiles', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('renders the files list, summary and per-file rows from seeded data', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: FILES_URL
    })

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('Q2 2026 submission — files')
    )
    expect(result).toEqual(
      expect.stringMatching(
        /govuk-tag--green"[^>]*>\s*Checks complete\s*<\/strong>/
      )
    )
    expect(result).toEqual(
      expect.stringContaining(
        'IronWave Compliance uploaded 4 files for Q2 2026'
      )
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="submission-files-summary"')
    )
    expect(result).toEqual(expect.stringContaining('Q2 2026 (1 Apr – 30 Jun)'))
    expect(result).toEqual(expect.stringContaining('623,073 tonnes'))
    expect(result).toEqual(
      expect.stringContaining('Michael Osei, 8 August 2026, 14:12')
    )

    expect(result).toEqual(
      expect.stringContaining('IronWave_Q2_2026_members_1-2.csv')
    )
    expect(result).toEqual(
      expect.stringContaining('IronWave_Q2_2026_member_5.csv')
    )
    expect(result).toEqual(
      expect.stringContaining('IronWave_Q2_2026_evidence.csv')
    )
    expect(result).toEqual(
      expect.stringMatching(/govuk-tag--green">\s*Passed\s*<\/strong>/)
    )
    expect(result).toEqual(
      expect.stringMatching(/govuk-tag--yellow">\s*2 warnings\s*<\/strong>/)
    )
  })

  test('wires Open to the built file screen for the file with warnings, and leaves the rest dead', async () => {
    const { result } = await server.inject({ method: 'GET', url: FILES_URL })

    const fileUrl = pathTo(
      paths.prototypeRegulatorPomSubmissionSubmissionFile,
      {
        ...params,
        fileId: 'eeeeaaaa-0001-4000-a000-000000000003'
      }
    )
    const openLink3 = result.match(
      /<a[^>]*data-testid="submission-files-open-3"[^>]*>/
    )[0]
    expect(openLink3).toEqual(expect.stringContaining(`href="${fileUrl}"`))

    const openLink1 = result.match(
      /<a[^>]*data-testid="submission-files-open-1"[^>]*>/
    )[0]
    expect(openLink1).toEqual(expect.stringContaining('href="#"'))
  })

  test('links Continue to the review screen', async () => {
    const { result } = await server.inject({ method: 'GET', url: FILES_URL })

    const continueTag = result.match(
      /<a[^>]*data-testid="submission-files-continue"[^>]*>/
    )[0]
    expect(continueTag).toEqual(
      expect.stringContaining(
        `href="${pathTo(paths.prototypeRegulatorPomSubmissionReviewPomReturn, params)}"`
      )
    )
  })

  test('404s for REPIC and for a quarter with no submission', async () => {
    for (const bad of [
      { ...params, schemeId: 'repic' },
      { ...params, year: '2027', quarter: 'Q1' }
    ]) {
      const { statusCode } = await server.inject({
        method: 'GET',
        url: pathTo(paths.prototypeRegulatorPomSubmissionSubmissionFiles, bad)
      })
      expect(statusCode).toBe(statusCodes.notFound)
    }
  })
})
