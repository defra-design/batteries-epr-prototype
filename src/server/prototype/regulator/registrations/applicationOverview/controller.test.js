import { initialiseServer } from '../../../../../test-utils/initialise-server.js'
import { paths } from '../../../../../config/paths.js'
import { statusCodes } from '../../../../common/constants/status-codes.js'
import { APPLICATION_ID } from '../applicationData.js'
import { applicationPath } from '../applicationShared.js'
import {
  getApplicationDecision,
  resetRegistrationsStore,
  setStepChecked
} from '../store.js'

const url = applicationPath(paths.prototypeRegulatorApplication, {
  applicationId: APPLICATION_ID
})

describe('#prototypeRegulatorApplicationOverview', () => {
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

  const get = (path = url) => server.inject({ method: 'GET', url: path })

  test('renders the H1, intro, breadcrumbs and service navigation', async () => {
    const { result, statusCode } = await get()

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining(
        '>Application for approval — IronWave Compliance</h1>'
      )
    )
    expect(result).toEqual(
      expect.stringContaining(
        'IronWave Compliance submitted its application on 24 July 2026.'
      )
    )
    expect(result).toEqual(expect.stringContaining('>Compliance schemes</a>'))
    expect(result).toEqual(
      expect.stringContaining('data-testid="regulator-nav-registrations"')
    )
  })

  test('lists all ten steps with automated result tags, linked to their pages', async () => {
    const { result } = await get()

    expect(result).toEqual(
      expect.stringContaining('You have checked 0 of 10 steps.')
    )
    for (let step = 1; step <= 10; step++) {
      expect(result).toEqual(
        expect.stringContaining(`data-testid="application-step-link-${step}"`)
      )
    }
    expect(result).toEqual(
      expect.stringContaining('1. Compliance scheme operator')
    )
    expect(result).toEqual(
      expect.stringContaining('10. Additional supporting files')
    )
    expect(result).toEqual(expect.stringContaining('govuk-tag--green'))
    expect(result).toEqual(expect.stringContaining('govuk-tag--yellow'))
    expect(result).toEqual(expect.stringContaining('1 to check'))
    expect(result).toEqual(expect.stringContaining('Not applicable'))
    expect(result).toEqual(expect.stringContaining('Not checked'))
  })

  test('shows the decision section without the confirm checkbox until every step is checked', async () => {
    const { result } = await get()

    expect(result).toEqual(expect.stringContaining('Make a decision'))
    expect(result).toEqual(
      expect.stringContaining('data-testid="application-decision-approve"')
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="application-decision-reject"')
    )
    expect(result).not.toEqual(
      expect.stringContaining('data-testid="application-decision-confirm"')
    )
  })

  test('once all ten steps are checked it shows the progress, Checked tags and confirm checkbox', async () => {
    for (let step = 1; step <= 10; step++) {
      setStepChecked(APPLICATION_ID, step, true)
    }
    const { result } = await get()

    expect(result).toEqual(
      expect.stringContaining('You have checked 10 of 10 steps.')
    )
    expect(result).not.toEqual(expect.stringContaining('Not checked'))
    expect(result).toEqual(
      expect.stringContaining('data-testid="application-decision-confirm"')
    )
    expect(result).toEqual(
      expect.stringContaining('I confirm I have checked all 10 steps')
    )
  })

  test('an unknown application is a 404', async () => {
    const { statusCode } = await get(
      applicationPath(paths.prototypeRegulatorApplication, {
        applicationId: 'nope'
      })
    )
    expect(statusCode).toBe(statusCodes.notFound)
  })
})

describe('#prototypeRegulatorApplicationOverview decision', () => {
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

  const checkAll = () => {
    for (let step = 1; step <= 10; step++) {
      setStepChecked(APPLICATION_ID, step, true)
    }
  }
  const post = (payload) => server.inject({ method: 'POST', url, payload })

  test('links to the registration review', async () => {
    const { result } = await server.inject({ method: 'GET', url })
    expect(result).toEqual(
      expect.stringContaining('data-testid="application-review-link"')
    )
  })

  test('deciding before every step is checked shows an error and records nothing', async () => {
    setStepChecked(APPLICATION_ID, 1, true)
    const { result, statusCode } = await post({ decision: 'approve' })

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('data-testid="application-error-summary"')
    )
    expect(result).toEqual(
      expect.stringContaining('Check all 10 steps before you make a decision')
    )
    expect(result).toEqual(
      expect.stringContaining('href="#application-checks"')
    )
    expect(getApplicationDecision(APPLICATION_ID)).toBeNull()
  })

  test('once all steps are checked, approving needs the confirmation but not a reason', async () => {
    checkAll()
    const missing = await post({ decision: 'approve' })
    expect(missing.result).toEqual(expect.stringContaining('href="#confirm"'))

    const { statusCode, headers } = await post({
      decision: 'approve',
      confirm: 'yes'
    })
    expect(statusCode).toBe(statusCodes.found)
    expect(headers.location).toBe(
      applicationPath(paths.prototypeRegulatorApplicationAccepted, {
        applicationId: APPLICATION_ID
      })
    )
  })

  test('rejecting needs a reason, and carries it to the rejected record', async () => {
    checkAll()
    const empty = await post({ decision: 'reject', confirm: 'yes' })
    expect(empty.result).toEqual(expect.stringContaining('href="#reason"'))

    const { headers } = await post({
      decision: 'reject',
      confirm: 'yes',
      reason: 'Invoice contact missing'
    })
    expect(headers.location).toBe(
      applicationPath(paths.prototypeRegulatorApplicationRejected, {
        applicationId: APPLICATION_ID
      })
    )
    expect(getApplicationDecision(APPLICATION_ID).reason).toBe(
      'Invoice contact missing'
    )
  })

  test('treats an empty POST body the same as an empty form', async () => {
    const empty = await server.inject({ method: 'POST', url })
    const blank = await post({})

    expect(empty.statusCode).toBe(blank.statusCode)
    expect(empty.statusCode).toBeLessThan(statusCodes.internalServerError)
  })
})
