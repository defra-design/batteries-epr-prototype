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
const params = { year: '2026', quarter: 'Q2' }
const url = pathTo(
  paths.prototypeComplianceSchemeQueryResponseReturnQueried,
  params
)

describe('#prototypeComplianceSchemeQueryResponseReturnQueried', () => {
  let server
  let original
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })
  beforeEach(() => {
    original = getSubmissions().find((s) => s.id === Q2_ID)
  })
  afterEach(() => {
    updateSubmission(Q2_ID, original)
  })

  const queryTheReturn = () =>
    updateSubmission(Q2_ID, {
      status: 'queried',
      decidedOn: '2026-08-11T10:00:00Z',
      decidedBy: 'A. Nwosu, Environment Agency',
      reason: 'Two figures look wrong'
    })

  describe('when the regulator has queried the return', () => {
    let result
    beforeEach(async () => {
      queryTheReturn()
      const response = await server.inject({ method: 'GET', url })
      expect(response.statusCode).toBe(statusCodes.ok)
      result = response.result
    })

    test('shows the important banner with the number of queried figures', () => {
      expect(result).toContain('data-testid="return-queried-banner"')
      expect(result).toContain('Important')
      expect(result).toContain('queried 2 figures in your Q2 2026')
    })

    test('shows the period heading and a Queried tag in the regulator’s colour', () => {
      expect(result).toContain('Q2 2026 submission')
      expect(result).toMatch(
        /govuk-tag--orange[^>]*data-testid="return-queried-status"|data-testid="return-queried-status"[^>]*govuk-tag--orange/
      )
      expect(result).toContain('Queried')
    })

    test('shows the submitted and reviewed dates from the store', () => {
      expect(result).toContain('8 August 2026')
      expect(result).toContain('11 August 2026')
    })

    test('lists the queried records in a govukTable with the regulator’s reasons', () => {
      expect(result).toContain('govuk-table')
      expect(result).toContain('Queried records')
      for (const heading of [
        'Member',
        'Chemistry',
        'Regulator&#39;s reason',
        'Action'
      ]) {
        expect(result).toContain(heading)
      }
      const queried = getMemberFigures().filter(
        (f) => f.submissionId === Q2_ID && f.status === 'queried'
      )
      expect(queried).toHaveLength(2)
      for (const figure of queried) {
        expect(result).toContain(figure.member)
        expect(result).toContain(figure.chemistry)
        expect(result).toContain(figure.reason)
        expect(result).toContain(
          `href="${pathTo(paths.prototypeComplianceSchemeQueryResponseReviewFigure, { ...params, recordId: figure.id })}"`
        )
      }
      expect(result).toMatch(
        /govuk-visually-hidden">\s*queried figure for GreenLeaf Ltd/
      )
    })

    test('lists the same records the regulator’s queried screen does', async () => {
      const regulator = await server.inject({
        method: 'GET',
        url: pathTo(
          paths.prototypeRegulatorPomSubmissionReviewPomReturnQueried,
          { schemeId: 'ironwave-compliance', ...params }
        )
      })
      expect(regulator.statusCode).toBe(statusCodes.ok)
      for (const member of ['GreenLeaf Ltd', 'Voltguard Ltd']) {
        expect(regulator.result).toContain(member)
        expect(result).toContain(member)
      }
    })

    test('is a task-flow screen: service name, back link to submissions, no tabs, navigation or breadcrumbs', () => {
      expect(result).toContain('Batteries: Compliance Scheme')
      expect(result).not.toContain('pEPR')
      expect(result).toContain('data-testid="back-link"')
      expect(result).toMatch(
        new RegExp(
          `href="${paths.prototypeComplianceSchemeSubmissionSubmissions}" class="govuk-back-link" data-testid="back-link"`
        )
      )
      expect(result).not.toContain('govuk-tabs')
      expect(result).not.toContain('Manage account')
      expect(result).not.toContain('govuk-breadcrumbs')
      expect(result).toContain('data-testid="return-queried-submissions-link"')
    })
  })

  describe('after the scheme corrects records', () => {
    const GREENLEAF_ID = 'cccccccc-0001-4000-a000-000000000001'
    const VOLTGUARD_ID = 'cccccccc-0001-4000-a000-000000000002'
    const correct = (id) =>
      updateMemberFigure(id, { status: 'resubmitted', amendedTonnes: 1.24 })
    let saved
    beforeEach(() => {
      saved = getMemberFigures().filter((f) =>
        [GREENLEAF_ID, VOLTGUARD_ID].includes(f.id)
      )
      queryTheReturn()
    })
    afterEach(() => {
      for (const figure of saved) updateMemberFigure(figure.id, figure)
    })

    test('a corrected record shows a Resubmitted tag instead of a Review link, and the banner counts what is left', async () => {
      correct(GREENLEAF_ID)
      const { result } = await server.inject({ method: 'GET', url })
      expect(result).toMatch(
        /govuk-tag--blue[^>]*data-testid="return-queried-record-status-1"/
      )
      expect(result).toContain('Resubmitted')
      expect(result).not.toContain('data-testid="return-queried-review-1"')
      expect(result).toContain('data-testid="return-queried-review-2"')
      expect(result).toContain('queried 1 figure in your Q2 2026')
    })

    test('once every record is corrected the banner says so', async () => {
      correct(GREENLEAF_ID)
      correct(VOLTGUARD_ID)
      const { result } = await server.inject({ method: 'GET', url })
      expect(result).toContain('govuk-notification-banner--success')
      expect(result).toContain('You have corrected all 2 figures queried')
      expect(result).not.toContain('data-testid="return-queried-review-')
    })
  })

  describe('when the return has not been queried', () => {
    test('shows a plain message instead of records', async () => {
      const { result, statusCode } = await server.inject({
        method: 'GET',
        url
      })
      expect(statusCode).toBe(statusCodes.ok)
      expect(result).toContain('data-testid="return-queried-not-queried"')
      expect(result).toContain('has not queried your Q2 2026 submission')
      expect(result).toContain('Received')
      expect(result).toContain('govuk-tag--blue')
      expect(result).not.toContain('data-testid="return-queried-banner"')
      expect(result).not.toContain('data-testid="return-queried-records"')
    })
  })

  test('returns 404 for a quarter the scheme has no return for', async () => {
    const { statusCode } = await server.inject({
      method: 'GET',
      url: pathTo(paths.prototypeComplianceSchemeQueryResponseReturnQueried, {
        year: '2030',
        quarter: 'Q1'
      })
    })
    expect(statusCode).toBe(statusCodes.notFound)
  })
})
