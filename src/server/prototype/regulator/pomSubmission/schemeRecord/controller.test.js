import { initialiseServer } from '../../../../../test-utils/initialise-server.js'
import { paths, pathTo } from '../../../../../config/paths.js'
import { statusCodes } from '../../../../common/constants/status-codes.js'

const recordUrl = (schemeId) =>
  pathTo(paths.prototypeRegulatorPomSubmissionSchemeRecord, { schemeId })

describe('#prototypeRegulatorPomSubmissionSchemeRecord', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  const get = (schemeId) =>
    server.inject({ method: 'GET', url: recordUrl(schemeId) })

  test('IronWave Compliance: scheme name H1, Approved tag, back link and the NPWD reference', async () => {
    const { result, statusCode } = await get('ironwave-compliance')

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toMatch(/<h1[^>]*>\s*IronWave Compliance/)
    expect(result).toMatch(
      /govuk-tag--green[^>]*data-testid="heading-tag"[^>]*>\s*Approved\s*</
    )
    const backLink = result.match(/<a[^>]*data-testid="back-link"[^>]*>/)[0]
    expect(backLink).toEqual(
      expect.stringContaining(
        `href="${paths.prototypeRegulatorPomSubmissionDashboard}"`
      )
    )
    expect(result).toEqual(
      expect.stringContaining(
        'The full record the regulator holds for this scheme.'
      )
    )
    expect(result).toEqual(expect.stringContaining('NPWD378112'))
  })

  test('shows organisation details, approval and people from the seed', async () => {
    const { result } = await get('ironwave-compliance')
    const section = (id) =>
      result.split(`data-testid="scheme-record-${id}"`)[1].split('</dl>')[0]

    expect(section('organisation')).toEqual(
      expect.stringContaining('IronWave Compliance Ltd')
    )
    expect(section('organisation')).toEqual(expect.stringContaining('09112477'))
    expect(section('organisation')).toEqual(
      expect.stringContaining('2 Foundry Road, Sheffield, S9 2LP')
    )
    expect(section('approval')).toEqual(
      expect.stringContaining('NPWD-APR-2026-0142')
    )
    expect(section('approval')).toEqual(
      expect.stringContaining('Issued 15 January 2026')
    )
    expect(section('people')).toEqual(expect.stringContaining('Priya Shah'))
    expect(section('people')).toEqual(expect.stringContaining('Michael Osei'))
    expect(section('people')).toEqual(expect.stringContaining('A. Nwosu'))
  })

  test('REPIC gets its own values and a bottom link back to REPIC, not to IronWave', async () => {
    const { result, statusCode } = await get('repic')

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toMatch(/<h1[^>]*>\s*REPIC/)
    expect(result).toEqual(expect.stringContaining('NPWD378119'))
    expect(result).toEqual(expect.stringContaining('NPWD-APR-2026-0148'))
    expect(result).toEqual(expect.stringContaining('Elaine Morrow'))
    // The Figma record for REPIC repeated IronWave's references and people.
    expect(result).not.toEqual(expect.stringContaining('NPWD378112'))
    expect(result).not.toEqual(expect.stringContaining('Priya Shah'))
    expect(result).toEqual(expect.stringContaining('Back to REPIC'))
    expect(result).not.toEqual(expect.stringContaining('Back to IronWave'))
    expect(result).toEqual(
      expect.stringContaining(
        `href="${pathTo(paths.prototypeRegulatorPomSubmissionSchemeHome, { schemeId: 'repic' })}" data-testid="scheme-record-home-link"`
      )
    )
  })

  test('lists the four documents and history links and does not use "activity timeline"', async () => {
    const { result } = await get('ironwave-compliance')

    for (const text of [
      'View conditions of approval',
      'View agency files',
      'View notes on this scheme',
      'View scheme history'
    ]) {
      expect(result).toEqual(expect.stringContaining(text))
    }
    expect(result).not.toEqual(expect.stringContaining('activity timeline'))
  })

  test('a scheme without a built record is a 404', async () => {
    expect((await get('copper-and-co-compliance')).statusCode).toBe(
      statusCodes.notFound
    )
  })
})
