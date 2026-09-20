import { initialiseServer } from '../../../../../test-utils/initialise-server.js'
import { paths, pathTo } from '../../../../../config/paths.js'
import { statusCodes } from '../../../../common/constants/status-codes.js'
import {
  getMemberFigures,
  getSubmissions,
  updateSubmission
} from '../../../regulator/pomSubmission/store.js'

const Q2_ID = '88888888-0001-4000-a000-000000000001'
const GREENLEAF_ID = 'cccccccc-0001-4000-a000-000000000001'
const OK_FIGURE_ID = 'cccccccc-0001-4000-a000-000000000003'
const params = { year: '2026', quarter: 'Q2' }
const urlFor = (recordId) =>
  pathTo(paths.prototypeComplianceSchemeQueryResponseReviewFigure, {
    ...params,
    recordId
  })

describe('#prototypeComplianceSchemeQueryResponseReviewFigure', () => {
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
      decidedOn: '2026-08-11T10:00:00Z'
    })

  describe('for a queried record', () => {
    let result
    beforeEach(async () => {
      queryTheReturn()
      const response = await server.inject({
        method: 'GET',
        url: urlFor(GREENLEAF_ID)
      })
      expect(response.statusCode).toBe(statusCodes.ok)
      result = response.result
    })

    test('shows the record from the store: member, chemistry, original figure and the regulator’s reason', () => {
      const figure = getMemberFigures().find((f) => f.id === GREENLEAF_ID)
      expect(result).toContain('Q2 2026 submission: queried record')
      expect(result).toContain('GreenLeaf Ltd — Lithium-ion')
      expect(result).toContain('Original figure')
      expect(result).toContain(`${figure.figureTonnes} tonnes`)
      expect(result).toContain(figure.reason)
    })

    test('has one action, to correct the figure, with no radios to choose from', () => {
      expect(result).toMatch(
        new RegExp(
          `href="${urlFor(GREENLEAF_ID)}/correct"[^>]*data-testid="review-figure-continue"`
        )
      )
      expect(result).toContain('Correct the figure')
      expect(result).not.toContain('govuk-radios')
    })

    test('is a task-flow screen with a back link to the queried return', () => {
      expect(result).toContain('Batteries: Compliance Scheme')
      expect(result).not.toContain('pEPR')
      expect(result).toMatch(
        new RegExp(
          `href="${pathTo(paths.prototypeComplianceSchemeQueryResponseReturnQueried, params)}" class="govuk-back-link" data-testid="back-link"`
        )
      )
      expect(result).not.toContain('govuk-tabs')
      expect(result).not.toContain('Manage account')
      expect(result).not.toContain('govuk-breadcrumbs')
    })
  })

  test('returns 404 when the return has not been queried, even though the record is seeded as queried', async () => {
    const { statusCode } = await server.inject({
      method: 'GET',
      url: urlFor(GREENLEAF_ID)
    })
    expect(statusCode).toBe(statusCodes.notFound)
  })

  test('returns 404 for a record that was not queried', async () => {
    queryTheReturn()
    const { statusCode } = await server.inject({
      method: 'GET',
      url: urlFor(OK_FIGURE_ID)
    })
    expect(statusCode).toBe(statusCodes.notFound)
  })

  test('returns 404 for an unknown record or return', async () => {
    queryTheReturn()
    const unknownRecord = await server.inject({
      method: 'GET',
      url: urlFor('does-not-exist')
    })
    expect(unknownRecord.statusCode).toBe(statusCodes.notFound)

    const unknownReturn = await server.inject({
      method: 'GET',
      url: pathTo(paths.prototypeComplianceSchemeQueryResponseReviewFigure, {
        year: '2030',
        quarter: 'Q1',
        recordId: GREENLEAF_ID
      })
    })
    expect(unknownReturn.statusCode).toBe(statusCodes.notFound)
  })
})
