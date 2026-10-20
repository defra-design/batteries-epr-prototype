import { initialiseServer } from '../../../../../../test-utils/initialise-server.js'
import { paths } from '../../../../../../config/paths.js'
import { statusCodes } from '../../../../../common/constants/status-codes.js'
import { prototypeComplianceSchemeContent } from '../../../../../../config/prototype-compliance-scheme-content.js'
import { listSelectableMembers } from './members.js'

const fill = (path, year, quarter) =>
  path.replace('{year}', year).replace('{quarter}', quarter)

const urlFor = (year, quarter) =>
  fill(
    paths.prototypeComplianceSchemeSubmissionSingleMemberDetails,
    year,
    quarter
  )

const pagePayloadOf = (html) =>
  JSON.parse(
    html
      .match(
        /<script type="application\/json" id="page-payload"[^>]*>([^<]*)<\/script>/
      )[1]
      .replaceAll('&quot;', '"')
  )

describe('#prototypeComplianceSchemeSubmissionSingleMemberDetails', () => {
  let server
  const members = listSelectableMembers()
  const content = prototypeComplianceSchemeContent.singleMemberDetails

  beforeAll(async () => {
    server = await initialiseServer()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('only offers active seeded members, with BPRNs generated from registration numbers', () => {
    expect(members.map((m) => m.name)).toEqual([
      'Halton Battery Processing Ltd',
      'Ecobat Treatment (Nottingham)',
      'Northgate Retail Group plc',
      'Valpak Compliance Partners'
    ])
    expect(members[0].bprn).toBe('BPRN-456123')
    expect(members[0].schemeRef).toBe('NPWD378112')
  })

  test('GET renders heading, step, caption from the route, and the seeded members', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: urlFor(2026, 2)
    })

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(expect.stringContaining('Scheme member details'))
    expect(result).toEqual(expect.stringContaining('Step 1 of 5'))
    expect(result).toEqual(
      expect.stringContaining(
        'data-testid="single-member-details-caption">2026 batteries compliance: quarterly data'
      )
    )
    expect(result).toEqual(expect.stringContaining('Choose a scheme member'))
    for (const member of members) {
      expect(result).toEqual(expect.stringContaining(member.name))
    }
    expect(result).not.toEqual(expect.stringContaining('Aldermoor'))
  })

  test('renders the DS select and readonly inputs, with hints attached to their fields', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: urlFor(2026, 2)
    })

    expect(result).toEqual(expect.stringContaining('govuk-select'))
    expect(result).toMatch(/<input[^>]*id="bprn"[^>]*readonly/)
    expect(result).toMatch(/<input[^>]*id="schemeRef"[^>]*readonly/)
    expect(result).toMatch(/<input[^>]*id="schemeRef"[^>]*value="NPWD378112"/)
    expect(result).toMatch(/id="bprn-hint"[^>]*>\s*Generated from/)
    expect(result).toMatch(
      /<input[^>]*id="bprn"[^>]*aria-describedby="bprn-hint"/
    )
    expect(result).toMatch(
      /<input[^>]*id="schemeRef"[^>]*aria-describedby="schemeRef-hint"/
    )
  })

  test('is a task-flow screen with a back link to reporting-method and the correct service name', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: urlFor(2026, 2)
    })

    const backLink = result.match(/<a[^>]*data-testid="back-link"[^>]*>/)[0]
    expect(backLink).toEqual(
      expect.stringContaining(
        `href="${fill(paths.prototypeComplianceSchemeSubmissionReportingMethod, 2026, 2)}"`
      )
    )
    expect(result).toEqual(
      expect.stringContaining('Batteries: Compliance Scheme')
    )
    expect(result).not.toEqual(expect.stringContaining('Report battery data'))
    expect(result).not.toEqual(expect.stringContaining('govuk-tabs'))
    expect(result).not.toEqual(expect.stringContaining('breadcrumbs'))
    expect(result).not.toEqual(expect.stringContaining('Manage account'))
  })

  test('GET carries a hydrate payload with the members', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: urlFor(2026, 3)
    })
    const payload = pagePayloadOf(result)
    expect(payload).toMatchObject({
      target: 'hydrate',
      step: 'singleMemberDetails',
      year: '2026',
      quarter: '3'
    })
    expect(payload.members).toHaveLength(4)
  })

  test('POST without a member shows the error summary and inline error', async () => {
    const { result, statusCode } = await server.inject({
      method: 'POST',
      url: urlFor(2026, 2),
      payload: { memberId: '' }
    })

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining(
        'data-testid="single-member-details-error-summary"'
      )
    )
    expect(result).toEqual(expect.stringContaining('href="#memberId"'))
    expect(result).toMatch(
      new RegExp(
        `id="memberId-error"[^>]*>\\s*<span class="govuk-visually-hidden">Error:</span>\\s*${content.error.member}`
      )
    )
    expect(result).toEqual(expect.stringContaining('govuk-select--error'))
  })

  test('POST with an empty body shows the missing member error', async () => {
    const { result, statusCode } = await server.inject({
      method: 'POST',
      url: urlFor(2026, 2)
    })

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining(
        'data-testid="single-member-details-error-summary"'
      )
    )
  })

  test('POST with an unknown member id is rejected', async () => {
    const { result } = await server.inject({
      method: 'POST',
      url: urlFor(2026, 2),
      payload: { memberId: 'not-a-member' }
    })
    expect(result).toEqual(
      expect.stringContaining(
        'data-testid="single-member-details-error-summary"'
      )
    )
  })

  test('POST with a member saves the details and routes to step 2', async () => {
    const member = members[1]
    const { result, statusCode } = await server.inject({
      method: 'POST',
      url: urlFor(2026, 2),
      payload: { memberId: member.id, bprn: 'tampered' }
    })

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).not.toEqual(
      expect.stringContaining('single-member-details-error-summary')
    )
    expect(pagePayloadOf(result)).toEqual({
      target: 'save',
      year: '2026',
      quarter: '2',
      savedFields: {
        memberId: member.id,
        memberName: member.name,
        bprn: member.bprn,
        schemeRef: 'NPWD378112'
      },
      nextStep: fill(
        paths.prototypeComplianceSchemeSubmissionSingleMemberChemistries,
        2026,
        2
      )
    })
  })
})
