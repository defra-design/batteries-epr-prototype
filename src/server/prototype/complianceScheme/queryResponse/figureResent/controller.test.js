import { initialiseServer } from '../../../../../test-utils/initialise-server.js'
import { paths, pathTo } from '../../../../../config/paths.js'
import { statusCodes } from '../../../../common/constants/status-codes.js'
import {
  getMemberFigures,
  getSubmissions,
  updateMemberFigure,
  updateSubmission
} from '../../../regulator/pomSubmission/store.js'

const Q2_ID = '88888888-0001-4000-a000-000000000001'
const GREENLEAF_ID = 'cccccccc-0001-4000-a000-000000000001'
const VOLTGUARD_ID = 'cccccccc-0001-4000-a000-000000000002'
const params = { year: '2026', quarter: 'Q2' }
const urlFor = (recordId) =>
  pathTo(paths.prototypeComplianceSchemeQueryResponseFigureResent, {
    ...params,
    recordId
  })
const returnUrl = pathTo(
  paths.prototypeComplianceSchemeQueryResponseReturnQueried,
  params
)
const findFigure = (id) => getMemberFigures().find((f) => f.id === id)

describe('#prototypeComplianceSchemeQueryResponseFigureResent', () => {
  let server
  let originals
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })
  beforeEach(() => {
    originals = {
      submission: getSubmissions().find((s) => s.id === Q2_ID),
      greenleaf: findFigure(GREENLEAF_ID),
      voltguard: findFigure(VOLTGUARD_ID)
    }
    updateSubmission(Q2_ID, {
      status: 'queried',
      decidedOn: '2026-08-11T10:00:00Z'
    })
  })
  afterEach(() => {
    updateSubmission(Q2_ID, originals.submission)
    updateMemberFigure(GREENLEAF_ID, originals.greenleaf)
    updateMemberFigure(VOLTGUARD_ID, originals.voltguard)
  })

  const correct = (id) =>
    updateMemberFigure(id, {
      status: 'resubmitted',
      amendedTonnes: 1.24,
      resubmittedOn: '2026-08-12T09:00:00Z'
    })

  test('with one record still queried, shows success, a Queried tag and a link to the rest', async () => {
    correct(GREENLEAF_ID)
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: urlFor(GREENLEAF_ID)
    })
    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toContain('data-testid="figure-resent-banner"')
    expect(result).toContain('govuk-notification-banner--success')
    expect(result).toContain('Correction sent')
    expect(result).toContain('GreenLeaf Ltd — Lithium-ion')
    expect(result).toContain('sent to the Environment Agency')
    expect(result).toContain('Q2 2026 submission')
    expect(result).toMatch(
      /govuk-tag--orange[^>]*data-testid="figure-resent-status"/
    )
    expect(result).toContain('You still have 1 figure to correct')
    expect(result).toContain(`href="${returnUrl}"`)
    expect(result).toContain('8 August 2026')
    expect(result).toContain('11 August 2026')
    expect(result).toContain('12 August 2026')
  })

  test('once every record is corrected, the return is Awaiting review', async () => {
    correct(GREENLEAF_ID)
    correct(VOLTGUARD_ID)
    const { result } = await server.inject({
      method: 'GET',
      url: urlFor(VOLTGUARD_ID)
    })
    expect(result).toContain('Awaiting review')
    expect(result).toMatch(
      /govuk-tag--blue[^>]*data-testid="figure-resent-status"/
    )
    expect(result).not.toContain('data-testid="figure-resent-outstanding"')
  })

  test('is a task-flow screen with a back link to the queried return', async () => {
    correct(GREENLEAF_ID)
    const { result } = await server.inject({
      method: 'GET',
      url: urlFor(GREENLEAF_ID)
    })
    expect(result).toContain('Batteries: Compliance Scheme')
    expect(result).not.toContain('pEPR')
    expect(result).toMatch(
      new RegExp(`href="${returnUrl}" class="govuk-back-link"`)
    )
    expect(result).not.toContain('govuk-tabs')
    expect(result).not.toContain('Manage account')
    expect(result).not.toContain('govuk-breadcrumbs')
    expect(result).toContain('data-testid="figure-resent-submissions-link"')
  })

  test('404 unless the record has been corrected on a queried return', async () => {
    const notCorrected = await server.inject({
      method: 'GET',
      url: urlFor(GREENLEAF_ID)
    })
    expect(notCorrected.statusCode).toBe(statusCodes.notFound)

    correct(GREENLEAF_ID)
    updateSubmission(Q2_ID, originals.submission)
    const notQueried = await server.inject({
      method: 'GET',
      url: urlFor(GREENLEAF_ID)
    })
    expect(notQueried.statusCode).toBe(statusCodes.notFound)
  })

  test('404s for a quarter with no matching return', async () => {
    const url = pathTo(
      paths.prototypeComplianceSchemeQueryResponseFigureResent,
      { year: '2027', quarter: 'Q1', recordId: GREENLEAF_ID }
    )
    const { statusCode } = await server.inject({ method: 'GET', url })

    expect(statusCode).toBe(statusCodes.notFound)
  })
})
