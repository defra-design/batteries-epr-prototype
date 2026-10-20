import { initialiseServer } from '../../../../../test-utils/initialise-server.js'
import { paths, pathTo } from '../../../../../config/paths.js'
import { statusCodes } from '../../../../common/constants/status-codes.js'

const params = { schemeId: 'ironwave-compliance', year: '2026', quarter: 'Q2' }
const FILE_ID = 'eeeeaaaa-0001-4000-a000-000000000003'
const url = pathTo(paths.prototypeRegulatorPomSubmissionSubmissionFile, {
  ...params,
  fileId: FILE_ID
})

describe('#prototypeRegulatorPomSubmissionSubmissionFile', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('H1 is the file name with a flags tag, a back link and the generated intro', async () => {
    const { result, statusCode } = await server.inject({ method: 'GET', url })

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('>IronWave_Q2_2026_member_5.csv')
    )
    expect(result).toMatch(/data-testid="heading-tag"[^>]*>\s*2 flags\s*</)
    expect(result).toMatch(/govuk-tag--orange/)
    expect(result).toEqual(expect.stringContaining('data-testid="back-link"'))
    expect(result).toEqual(
      expect.stringContaining(
        'This file covers 1 member and 449 rows. The scheme’s automated checks flagged 2 rows before submission.'
      )
    )
  })

  test('shows the member, rows, upload and result from the seed', async () => {
    const { result } = await server.inject({ method: 'GET', url })
    const summary = result
      .split('data-testid="submission-file-summary"')[1]
      .split('</dl>')[0]

    expect(summary).toEqual(
      expect.stringContaining('Solaris Power Ltd (BPRN-004821)')
    )
    expect(summary).toEqual(expect.stringContaining('449'))
    expect(summary).toEqual(expect.stringContaining('8 August 2026, 14:12'))
    expect(summary).toEqual(
      expect.stringContaining('IronWave Compliance service, 8 August 2026')
    )
    expect(summary).toEqual(expect.stringContaining('Passed with 2 flags'))
  })

  test('lists the flagged rows with Query and Reject actions', async () => {
    const { result } = await server.inject({ method: 'GET', url })
    const table = result
      .split('data-testid="submission-file-flagged-rows"')[1]
      .split('</table>')[0]

    expect(table).toEqual(expect.stringContaining('118'))
    expect(table).toEqual(expect.stringContaining('Light means of transport'))
    expect(table).toMatch(/govuk-tag--orange">\s*Variance \+410%\s*</)
    expect(table).toEqual(expect.stringContaining('276'))
    expect(table).toMatch(/govuk-tag--orange">\s*No evidence\s*</)
    expect(table.match(/>Query/g)).toHaveLength(2)
    expect(table.match(/>Reject/g)).toHaveLength(2)
    expect(result).toEqual(
      expect.stringContaining('View all 449 rows in this file')
    )
  })

  test('Back to files returns to the files list', async () => {
    const { result } = await server.inject({ method: 'GET', url })
    const button = result.match(
      /<a[^>]*data-testid="submission-file-back-to-files"[^>]*>/
    )[0]
    expect(button).toEqual(
      expect.stringContaining(
        pathTo(paths.prototypeRegulatorPomSubmissionSubmissionFiles, params)
      )
    )
  })

  test('a file with no flagged rows, an unknown file or an unbuilt scheme is a 404', async () => {
    const passed = await server.inject({
      method: 'GET',
      url: pathTo(paths.prototypeRegulatorPomSubmissionSubmissionFile, {
        ...params,
        fileId: 'eeeeaaaa-0001-4000-a000-000000000001'
      })
    })
    expect(passed.statusCode).toBe(statusCodes.notFound)

    const unknown = await server.inject({
      method: 'GET',
      url: pathTo(paths.prototypeRegulatorPomSubmissionSubmissionFile, {
        ...params,
        fileId: 'nope'
      })
    })
    expect(unknown.statusCode).toBe(statusCodes.notFound)

    const unknownReturn = await server.inject({
      method: 'GET',
      url: pathTo(paths.prototypeRegulatorPomSubmissionSubmissionFile, {
        ...params,
        year: '2019',
        fileId: FILE_ID
      })
    })
    expect(unknownReturn.statusCode).toBe(statusCodes.notFound)

    const unbuilt = await server.inject({
      method: 'GET',
      url: pathTo(paths.prototypeRegulatorPomSubmissionSubmissionFile, {
        ...params,
        schemeId: 'repic',
        fileId: FILE_ID
      })
    })
    expect(unbuilt.statusCode).toBe(statusCodes.notFound)
  })
})
