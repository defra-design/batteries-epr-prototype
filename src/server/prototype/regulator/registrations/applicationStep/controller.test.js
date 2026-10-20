import { initialiseServer } from '../../../../../test-utils/initialise-server.js'
import { paths } from '../../../../../config/paths.js'
import { statusCodes } from '../../../../common/constants/status-codes.js'
import { APPLICATION_ID } from '../applicationData.js'
import { applicationPath, stepPath } from '../applicationShared.js'
import { getApplicationState, resetRegistrationsStore } from '../store.js'

const overviewUrl = applicationPath(paths.prototypeRegulatorApplication, {
  applicationId: APPLICATION_ID
})

describe('#prototypeRegulatorApplicationStep', () => {
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

  const get = (step) =>
    server.inject({ method: 'GET', url: stepPath(APPLICATION_ID, step) })
  const post = (step, payload) =>
    server.inject({
      method: 'POST',
      url: stepPath(APPLICATION_ID, step),
      payload
    })

  test('step 1 renders its heading, tag, submitted details and automated checks', async () => {
    const { result, statusCode } = await get(1)

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('Step 1: Compliance scheme operator')
    )
    expect(result).toMatch(/>\s*Passed\s*</)
    expect(result).toEqual(
      expect.stringContaining('Company registration number')
    )
    expect(result).toEqual(expect.stringContaining('09217364'))
    expect(result).toEqual(
      expect.stringContaining(
        'Operator listed as a director on Companies House'
      )
    )
    expect(result).toEqual(
      expect.stringContaining('There are no notes for this step yet.')
    )
  })

  test('step 5 shows the warning and the "Check needed" row', async () => {
    const { result } = await get(5)

    expect(result).toEqual(expect.stringContaining('Step 5: Invoice address'))
    expect(result).toEqual(expect.stringContaining('1 to check'))
    expect(result).toEqual(
      expect.stringContaining('data-testid="application-step-warning"')
    )
    expect(result).toEqual(
      expect.stringContaining(
        'No named contact was given for invoicing queries.'
      )
    )
    expect(result).toEqual(expect.stringContaining('Check needed'))
  })

  test.each([2, 3, 4, 6, 7, 8, 9, 10])('step %i renders', async (step) => {
    const { result, statusCode } = await get(step)

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(expect.stringContaining(`Step ${step}:`))
    expect(result).toEqual(
      expect.stringContaining('data-testid="application-step-checks"')
    )
  })

  test('step 0, step 11 and non-numeric steps are 404s', async () => {
    for (const step of [0, 11, 'x']) {
      expect((await get(step)).statusCode).toBe(statusCodes.notFound)
    }
  })

  test('Save and continue stores the check and goes to the next step', async () => {
    const { statusCode, headers } = await post(1, {
      action: 'save',
      checked: 'yes'
    })

    expect(statusCode).toBe(statusCodes.found)
    expect(headers.location).toBe(stepPath(APPLICATION_ID, 2))
    expect(getApplicationState(APPLICATION_ID).checked[1]).toBe(true)
  })

  test('Save and continue without ticking records the step as not checked', async () => {
    await post(1, { action: 'save', checked: 'yes' })
    await post(1, { action: 'save' })

    expect(getApplicationState(APPLICATION_ID).checked[1]).toBe(false)
  })

  test('Save and continue on step 10 returns to the overview', async () => {
    const { headers } = await post(10, { action: 'save', checked: 'yes' })
    expect(headers.location).toBe(overviewUrl)
  })

  test('Add note stores the note and shows it on the step and the overview count', async () => {
    const { statusCode, headers } = await post(5, {
      action: 'addNote',
      note: 'Asked IronWave for an invoice contact'
    })
    expect(statusCode).toBe(statusCodes.found)
    expect(headers.location).toBe(stepPath(APPLICATION_ID, 5))

    const step = await get(5)
    expect(step.result).toEqual(
      expect.stringContaining('Asked IronWave for an invoice contact')
    )
    expect(step.result).not.toEqual(
      expect.stringContaining('There are no notes for this step yet.')
    )

    const overview = await server.inject({ method: 'GET', url: overviewUrl })
    const row5 = overview.result.split('application-step-row-5')[1]
    expect(row5).toMatch(/govuk-table__cell--numeric"\s*>\s*1\s*<\/td>/)
  })

  test('Add note keeps the checkbox state the regulator had ticked', async () => {
    await post(2, { action: 'addNote', note: 'Called Tom', checked: 'yes' })
    expect(getApplicationState(APPLICATION_ID).checked[2]).toBe(true)
  })

  test('an empty note shows an error summary and inline error and stores nothing', async () => {
    const { result, statusCode } = await post(3, {
      action: 'addNote',
      note: '  '
    })

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('data-testid="application-step-error-summary"')
    )
    expect(result).toEqual(expect.stringContaining('There is a problem'))
    expect(result).toEqual(expect.stringContaining('href="#note"'))
    expect(result).toEqual(expect.stringContaining('Enter a note'))
    expect(getApplicationState(APPLICATION_ID).notes[3]).toBeUndefined()
  })

  test('a note over 500 characters is rejected', async () => {
    const { result } = await post(3, {
      action: 'addNote',
      note: 'a'.repeat(501)
    })
    expect(result).toEqual(
      expect.stringContaining('Note must be 500 characters or fewer')
    )
  })

  test('Back to all checks links to the overview', async () => {
    const { result } = await get(4)
    expect(result).toEqual(expect.stringContaining(`href="${overviewUrl}"`))
  })

  test('POST to an unknown step is a 404', async () => {
    const { statusCode } = await post(99, {})

    expect(statusCode).toBe(statusCodes.notFound)
  })

  test('an empty POST body is treated as an unchecked step', async () => {
    const empty = await server.inject({
      method: 'POST',
      url: stepPath(APPLICATION_ID, 1)
    })
    const blank = await post(1, {})

    expect(empty.statusCode).toBe(blank.statusCode)
    expect(empty.statusCode).toBeLessThan(statusCodes.internalServerError)
  })
})
