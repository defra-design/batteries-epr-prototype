import { initialiseServer } from '../../../../../test-utils/initialise-server.js'
import { paths, pathTo } from '../../../../../config/paths.js'
import { statusCodes } from '../../../../common/constants/status-codes.js'

const params = {
  schemeId: 'ironwave-compliance',
  year: '2026',
  quarter: 'Q2',
  fileId: 'eeeeaaaa-0001-4000-a000-000000000003'
}
const FILE_URL = pathTo(paths.prototypeRegulatorPomSubmissionSubmissionFile, {
  ...params,
  fileId: 'eeeeaaaa-0001-4000-a000-000000000003'
})

describe('#prototypeRegulatorPomSubmissionSubmissionFile', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('renders the file detail, summary and flagged rows from seeded data', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: FILE_URL
    })

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('IronWave_Q2_2026_member_5.csv')
    )
    expect(result).toEqual(
      expect.stringMatching(
        /govuk-tag--yellow"[^>]*>\s*2 warnings\s*<\/strong>/
      )
    )
    expect(result).toEqual(
      expect.stringContaining('This file covers 1 member and 412 rows')
    )
    expect(result).toEqual(
      expect.stringContaining('Solaris Power Ltd (BPRN-004821)')
    )
    expect(result).toEqual(
      expect.stringContaining('IronWave Compliance service, 8 August 2026')
    )
    expect(result).toEqual(expect.stringContaining('Passed with 2 warnings'))

    expect(result).toEqual(
      expect.stringContaining(
        'data-testid="submission-file-flagged-rows-table"'
      )
    )
    expect(result).toEqual(expect.stringContaining('Lithium-ion'))
    expect(result).toEqual(expect.stringContaining('Light means of transport'))
    expect(result).toEqual(
      expect.stringMatching(/govuk-tag--yellow">\s*Swing \+410%\s*<\/strong>/)
    )
    expect(result).toEqual(
      expect.stringMatching(/govuk-tag--yellow">\s*No evidence\s*<\/strong>/)
    )
    expect(result).toEqual(expect.stringContaining('Query · Reject'))
  })

  test('links Back to files to the files list', async () => {
    const { result } = await server.inject({ method: 'GET', url: FILE_URL })

    const backTag = result.match(
      /<a[^>]*data-testid="submission-file-back"[^>]*>/
    )[0]
    expect(backTag).toEqual(
      expect.stringContaining(
        `href="${pathTo(paths.prototypeRegulatorPomSubmissionSubmissionFiles, params)}"`
      )
    )
  })

  test('404s for a file that has not been built (no warnings)', async () => {
    const url = pathTo(paths.prototypeRegulatorPomSubmissionSubmissionFile, {
      ...params,
      fileId: 'eeeeaaaa-0001-4000-a000-000000000001'
    })
    const { statusCode } = await server.inject({ method: 'GET', url })

    expect(statusCode).toBe(statusCodes.notFound)
  })

  test('404s for an unknown file id, REPIC, and a quarter with no submission', async () => {
    for (const url of [
      pathTo(paths.prototypeRegulatorPomSubmissionSubmissionFile, {
        ...params,
        fileId: 'does-not-exist'
      }),
      pathTo(paths.prototypeRegulatorPomSubmissionSubmissionFile, {
        ...params,
        schemeId: 'repic'
      }),
      pathTo(paths.prototypeRegulatorPomSubmissionSubmissionFile, {
        ...params,
        year: '2027',
        quarter: 'Q1'
      })
    ]) {
      const { statusCode } = await server.inject({ method: 'GET', url })
      expect(statusCode).toBe(statusCodes.notFound)
    }
  })
})
