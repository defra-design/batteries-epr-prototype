import { initialiseServer } from '../../../../../test-utils/initialise-server.js'
import { paths } from '../../../../../config/paths.js'
import { statusCodes } from '../../../../common/constants/status-codes.js'
import { APPLICATION_ID } from '../applicationData.js'
import { applicationPath } from '../applicationShared.js'
import { getApplicationDecision, resetRegistrationsStore } from '../store.js'

const urlFor = (pathKey) =>
  applicationPath(paths[pathKey], { applicationId: APPLICATION_ID })

const url = urlFor('prototypeRegulatorApplicationReview')

describe('#prototypeRegulatorApplicationReview', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })
  beforeEach(() => {
    resetRegistrationsStore()
  })

  const get = () => server.inject({ method: 'GET', url })
  const post = (payload) => server.inject({ method: 'POST', url, payload })

  test('renders the scheme name as H1 with a status tag and the submitted intro', async () => {
    const { result, statusCode } = await get()

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(expect.stringContaining('IronWave Compliance'))
    expect(result).toMatch(/<h1[^>]*>\s*IronWave Compliance/)
    expect(result).toEqual(
      expect.stringContaining('data-testid="review-status-tag"')
    )
    expect(result).toEqual(
      expect.stringContaining(
        'IronWave Compliance submitted their registration on 24 July 2026.'
      )
    )
  })

  test('shows the organisation (7 rows), signatory (3 rows) and Super User (4 rows) lists', async () => {
    const { result } = await get()
    const rowsIn = (testId) =>
      result
        .split(`data-testid="${testId}"`)[1]
        .split('</dl>')[0]
        .split('govuk-summary-list__row').length - 1

    expect(rowsIn('review-organisation')).toBe(7)
    expect(rowsIn('review-signatory')).toBe(3)
    expect(rowsIn('review-super-user')).toBe(4)
    expect(result).toEqual(expect.stringContaining('Priya Shah'))
    expect(result).toEqual(expect.stringContaining('Tom Whitfield'))
  })

  test('shows the three passed checks and the decision form', async () => {
    const { result } = await get()

    expect(result).toEqual(
      expect.stringContaining(
        'Companies House check – organisation name and number match'
      )
    )
    expect(result).toEqual(
      expect.stringContaining('Authorised signatory details verified')
    )
    expect(result).toEqual(
      expect.stringContaining('Super User details verified')
    )
    expect(result).toEqual(expect.stringContaining('Make a decision'))
    expect(result).toEqual(
      expect.stringContaining(
        'Required if you&#39;re rejecting this registration. The applicant will see this reason.'
      )
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="review-confirm"')
    )
  })

  test('approving with no reason records the decision and goes to accepted', async () => {
    const { statusCode, headers } = await post({
      decision: 'approve',
      confirm: 'yes',
      reason: ''
    })

    expect(statusCode).toBe(statusCodes.found)
    expect(headers.location).toBe(
      urlFor('prototypeRegulatorApplicationAccepted')
    )
    expect(getApplicationDecision(APPLICATION_ID)).toMatchObject({
      outcome: 'approve'
    })
  })

  test('rejecting with a reason records it and goes to rejected', async () => {
    const { headers } = await post({
      decision: 'reject',
      confirm: 'yes',
      reason: 'Incorrect address'
    })

    expect(headers.location).toBe(
      urlFor('prototypeRegulatorApplicationRejected')
    )
    expect(getApplicationDecision(APPLICATION_ID)).toMatchObject({
      outcome: 'reject',
      reason: 'Incorrect address'
    })
  })

  test('rejecting without a reason shows an error summary and inline error', async () => {
    const { result, statusCode } = await post({
      decision: 'reject',
      confirm: 'yes',
      reason: '   '
    })

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('data-testid="review-error-summary"')
    )
    expect(result).toEqual(expect.stringContaining('href="#reason"'))
    expect(result).toEqual(
      expect.stringContaining('Enter a reason for rejecting this registration')
    )
    expect(getApplicationDecision(APPLICATION_ID)).toBeNull()
  })

  test('submitting without the confirmation is an error on both paths and keeps the reason', async () => {
    for (const decision of ['approve', 'reject']) {
      const { result } = await post({ decision, reason: 'Some reason' })
      expect(result).toEqual(expect.stringContaining('href="#confirm"'))
      expect(result).toEqual(expect.stringContaining('Some reason'))
    }
    expect(getApplicationDecision(APPLICATION_ID)).toBeNull()
  })

  test('a reason over 1000 characters is rejected', async () => {
    const { result } = await post({
      decision: 'reject',
      confirm: 'yes',
      reason: 'a'.repeat(1001)
    })
    expect(result).toEqual(
      expect.stringContaining('Reason must be 1000 characters or fewer')
    )
  })

  test('treats an empty POST body the same as an empty form', async () => {
    const empty = await server.inject({ method: 'POST', url })
    const blank = await post({})

    expect(empty.statusCode).toBe(blank.statusCode)
    expect(empty.statusCode).toBeLessThan(statusCodes.internalServerError)
  })
})
