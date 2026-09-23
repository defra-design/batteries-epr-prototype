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
const OK_FIGURE_ID = 'cccccccc-0001-4000-a000-000000000003'
const params = { year: '2026', quarter: 'Q2' }
const urlFor = (recordId) =>
  pathTo(paths.prototypeComplianceSchemeQueryResponseCorrectFigure, {
    ...params,
    recordId
  })
const findFigure = (id) => getMemberFigures().find((f) => f.id === id)

describe('#prototypeComplianceSchemeQueryResponseCorrectFigure', () => {
  let server
  let originalSubmission
  let originalFigure
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })
  beforeEach(() => {
    originalSubmission = getSubmissions().find((s) => s.id === Q2_ID)
    originalFigure = findFigure(GREENLEAF_ID)
    updateSubmission(Q2_ID, {
      status: 'queried',
      decidedOn: '2026-08-11T10:00:00Z'
    })
  })
  afterEach(() => {
    updateSubmission(Q2_ID, originalSubmission)
    updateMemberFigure(GREENLEAF_ID, originalFigure)
  })

  const post = (payload, recordId = GREENLEAF_ID) =>
    server.inject({ method: 'POST', url: urlFor(recordId), payload })

  describe('GET', () => {
    let result
    beforeEach(async () => {
      const response = await server.inject({
        method: 'GET',
        url: urlFor(GREENLEAF_ID)
      })
      expect(response.statusCode).toBe(statusCodes.ok)
      result = response.result
    })

    test('shows the heading, the original figure and the regulator’s reason from the store', () => {
      const figure = findFigure(GREENLEAF_ID)
      expect(result).toContain(
        'Correct the figure: GreenLeaf Ltd — Lithium-ion'
      )
      expect(result).toContain('Q2 2026 submission: queried record')
      expect(result).toContain(
        `You previously submitted ${figure.figureTonnes} tonnes`
      )
      expect(result).toContain(figure.reason)
    })

    test('has a labelled tonnage field with its hint attached and a t suffix', () => {
      expect(result).toContain('Corrected tonnage (t)')
      expect(result).toContain('id="tonnage-hint"')
      expect(result).toContain('aria-describedby="tonnage-hint"')
      expect(result).toContain('not kilograms')
      expect(result).toContain('govuk-input__suffix')
      expect(result).not.toContain('govuk-error-summary')
      expect(result).not.toContain('govuk-radios')
    })

    test('is a task-flow screen with a back link to the record', () => {
      expect(result).toContain('Batteries: Compliance Scheme')
      expect(result).not.toContain('pEPR')
      expect(result).toMatch(
        new RegExp(
          `href="${pathTo(paths.prototypeComplianceSchemeQueryResponseReviewFigure, { ...params, recordId: GREENLEAF_ID })}" class="govuk-back-link"`
        )
      )
      expect(result).not.toContain('govuk-tabs')
      expect(result).not.toContain('Manage account')
      expect(result).not.toContain('govuk-breadcrumbs')
    })
  })

  describe('POST validation', () => {
    test('an empty value shows the error summary and an inline error', async () => {
      const { result, statusCode } = await post({ tonnage: '' })
      expect(statusCode).toBe(statusCodes.ok)
      expect(result).toContain('data-testid="correct-figure-error-summary"')
      expect(result).toContain('There is a problem')
      expect(result).toContain('href="#tonnage"')
      expect(result).toContain('id="tonnage-error"')
      expect(result).toContain('Enter the corrected tonnage')
      expect(result).toMatch(/<title[^>]*>\s*Error: /)
      expect(findFigure(GREENLEAF_ID).status).toBe('queried')
    })

    test.each([
      ['abc', 'must be a number, like 1.240'],
      ['1,240', 'must be a number, like 1.240'],
      ['-5', 'must be a number, like 1.240'],
      ['1.2345', 'no more than 3 decimal places'],
      ['0', 'must be more than 0']
    ])(
      '%s is rejected with a specific message and the value is kept',
      async (value, message) => {
        const { result } = await post({ tonnage: value })
        expect(result).toContain(message)
        expect(result).toContain(`value="${value}"`)
        expect(findFigure(GREENLEAF_ID).status).toBe('queried')
      }
    )
  })

  describe('POST with a valid figure', () => {
    test('writes the correction to the store and redirects to the confirmation', async () => {
      const { statusCode, headers } = await post({ tonnage: ' 1.240 ' })
      expect(statusCode).toBe(statusCodes.found)
      expect(headers.location).toBe(
        pathTo(paths.prototypeComplianceSchemeQueryResponseFigureResent, {
          ...params,
          recordId: GREENLEAF_ID
        })
      )
      const figure = findFigure(GREENLEAF_ID)
      expect(figure.status).toBe('resubmitted')
      expect(figure.amendedTonnes).toBe(1.24)
      expect(figure.figureTonnes).toBe(12.4)
      expect(figure.resubmittedOn).toEqual(expect.any(String))
    })

    test('the regulator’s screens show the correction from the same store', async () => {
      await post({ tonnage: '1.240' })

      const queried = await server.inject({
        method: 'GET',
        url: pathTo(
          paths.prototypeRegulatorPomSubmissionReviewPomReturnQueried,
          { schemeId: 'ironwave-compliance', ...params }
        )
      })
      expect(queried.statusCode).toBe(statusCodes.ok)
      expect(queried.result).toMatch(
        /govuk-tag--blue">\s*Resubmitted\s*<\/strong>/
      )
      expect(queried.result).toContain('1.24')
      expect(queried.result).toContain('2 records queried')

      const sales = await server.inject({
        method: 'GET',
        url: pathTo(
          paths.prototypeRegulatorPomSubmissionBatterySalesDataSubmission,
          { schemeId: 'ironwave-compliance' }
        )
      })
      expect(sales.statusCode).toBe(statusCodes.ok)
      expect(sales.result).toMatch(
        /govuk-tag--blue">\s*Resubmitted\s*<\/strong>/
      )
    })

    test('a corrected record cannot be corrected again', async () => {
      await post({ tonnage: '1.240' })
      const again = await post({ tonnage: '2.000' })
      expect(again.statusCode).toBe(statusCodes.notFound)
      expect(findFigure(GREENLEAF_ID).amendedTonnes).toBe(1.24)
    })
  })

  describe('not found', () => {
    test('404 when the return has not been queried', async () => {
      updateSubmission(Q2_ID, originalSubmission)
      const get = await server.inject({
        method: 'GET',
        url: urlFor(GREENLEAF_ID)
      })
      const posted = await post({ tonnage: '1.240' })
      expect(get.statusCode).toBe(statusCodes.notFound)
      expect(posted.statusCode).toBe(statusCodes.notFound)
    })

    test('404 for a record that was not queried or does not exist, on GET and on an invalid POST', async () => {
      for (const id of [OK_FIGURE_ID, 'does-not-exist']) {
        const get = await server.inject({ method: 'GET', url: urlFor(id) })
        const invalid = await post({ tonnage: '' }, id)
        expect(get.statusCode).toBe(statusCodes.notFound)
        expect(invalid.statusCode).toBe(statusCodes.notFound)
      }
    })

    test('404 for a quarter with no matching return', async () => {
      const url = pathTo(
        paths.prototypeComplianceSchemeQueryResponseCorrectFigure,
        { year: '2027', quarter: 'Q1', recordId: GREENLEAF_ID }
      )
      const { statusCode } = await server.inject({ method: 'GET', url })

      expect(statusCode).toBe(statusCodes.notFound)
    })
  })
})
