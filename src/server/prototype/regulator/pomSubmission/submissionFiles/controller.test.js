import { initialiseServer } from '../../../../../test-utils/initialise-server.js'
import { paths, pathTo } from '../../../../../config/paths.js'
import { statusCodes } from '../../../../common/constants/status-codes.js'

const params = { schemeId: 'ironwave-compliance', year: '2026', quarter: 'Q2' }
const url = pathTo(paths.prototypeRegulatorPomSubmissionSubmissionFiles, params)

describe('#prototypeRegulatorPomSubmissionSubmissionFiles', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  const get = () => server.inject({ method: 'GET', url })

  test('H1, 5 files tag, scheme and period line, intro and back link to the scheme', async () => {
    const { result, statusCode } = await get()

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('>Submission files and supporting evidence')
    )
    expect(result).toMatch(/data-testid="heading-tag"[^>]*>\s*5 files\s*</)
    expect(result).toEqual(
      expect.stringContaining('IronWave Compliance · Q2 2026 (1 Apr – 30 Jun)')
    )
    expect(result).toEqual(
      expect.stringContaining(
        'Everything the scheme uploaded for this quarter: 4 data files and 1 supporting evidence document.'
      )
    )
    const backLink = result.match(/<a[^>]*data-testid="back-link"[^>]*>/)[0]
    expect(backLink).toEqual(
      expect.stringContaining(
        `href="${pathTo(paths.prototypeRegulatorPomSubmissionSchemeHome, { schemeId: 'ironwave-compliance' })}"`
      )
    )
    expect(result).toEqual(
      expect.stringContaining('Back to IronWave Compliance')
    )
  })

  test('summary: records, total, automated checks with a link to the flagged figures, submitter and failed uploads', async () => {
    const { result } = await get()
    const summary = result
      .split('data-testid="submission-files-summary"')[1]
      .split('</dl>')[0]

    expect(summary).toEqual(
      expect.stringContaining('2,639 across 5 of 5 producers')
    )
    expect(summary).toEqual(expect.stringContaining('623.073 tonnes'))
    expect(summary).toEqual(
      expect.stringContaining('Passed — 5 figures flagged for review')
    )
    expect(summary).toEqual(
      expect.stringContaining(
        pathTo(paths.prototypeRegulatorPomSubmissionDataCheckReport, {
          schemeId: 'ironwave-compliance'
        })
      )
    )
    expect(summary).toEqual(
      expect.stringContaining('Michael Osei, 8 August 2026, 14:12')
    )
    expect(summary).toEqual(
      expect.stringContaining('2 uploads rejected before submission')
    )
  })

  test('data files table: the four seeded files with check tags, and only member_5 can be opened', async () => {
    const { result } = await get()
    const table = result
      .split('data-testid="submission-files-table"')[1]
      .split('</table>')[0]

    for (const name of [
      'IronWave_Q2_2026_members_1-2.csv',
      'IronWave_Q2_2026_members_3-4.csv',
      'IronWave_Q2_2026_member_5.csv',
      'IronWave_Q2_2026_evidence.csv'
    ]) {
      expect(table).toEqual(expect.stringContaining(name))
    }
    expect(table).toEqual(expect.stringContaining('343.500'))
    expect(table).toEqual(expect.stringContaining('1,204'))
    expect(table.match(/govuk-tag--green">\s*Passed\s*</g)).toHaveLength(2)
    expect(table.match(/govuk-tag--orange">\s*2 flags\s*</g)).toHaveLength(2)

    const openHref = (id) =>
      result.match(
        new RegExp(`href="([^"]*)" data-testid="submission-files-open-${id}"`)
      )[1]
    expect(openHref('eeeeaaaa-0001-4000-a000-000000000003')).toBe(
      pathTo(paths.prototypeRegulatorPomSubmissionSubmissionFile, {
        ...params,
        fileId: 'eeeeaaaa-0001-4000-a000-000000000003'
      })
    )
    expect(openHref('eeeeaaaa-0001-4000-a000-000000000001')).toBe('#')
  })

  test('supporting evidence, the flags note and the history and review links', async () => {
    const { result } = await get()
    const evidence = result
      .split('data-testid="submission-files-evidence"')[1]
      .split('</table>')[0]

    expect(evidence).toEqual(
      expect.stringContaining('IronWave_Q2_2026_explanations.docx')
    )
    expect(evidence).toEqual(
      expect.stringContaining('Nil return (Northfield Cells)')
    )
    expect(evidence).toEqual(expect.stringContaining('Open beside the data'))
    expect(result).toEqual(
      expect.stringContaining('Flags don’t stop a submission')
    )
    expect(result).toEqual(
      expect.stringContaining('View history for this quarter')
    )
    const review = result.match(
      /<a[^>]*data-testid="submission-files-review"[^>]*>/
    )[0]
    expect(review).toEqual(
      expect.stringContaining(
        pathTo(paths.prototypeRegulatorPomSubmissionReviewPomReturn, params)
      )
    )
  })

  test('unknown returns and unbuilt schemes are 404s', async () => {
    const missing = await server.inject({
      method: 'GET',
      url: pathTo(paths.prototypeRegulatorPomSubmissionSubmissionFiles, {
        ...params,
        year: '2019'
      })
    })
    expect(missing.statusCode).toBe(statusCodes.notFound)

    const unbuilt = await server.inject({
      method: 'GET',
      url: pathTo(paths.prototypeRegulatorPomSubmissionSubmissionFiles, {
        ...params,
        schemeId: 'repic'
      })
    })
    expect(unbuilt.statusCode).toBe(statusCodes.notFound)
  })
})
