import { initialiseServer } from '../../../../../test-utils/initialise-server.js'
import {
  backLinkHref,
  cookieFrom,
  expectNoFigmaSampleData,
  expectTaskFlowChrome,
  pagePayloadFrom
} from '../../../../../test-utils/waste-data-page.js'
import { paths } from '../../../../../config/paths.js'
import { statusCodes } from '../../../../common/constants/status-codes.js'

describe('#prototypeWasteDataStart', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  const get = () =>
    server.inject({ method: 'GET', url: paths.prototypeWasteDataStart })

  test('GET renders the rendered headings, not the Figma layer names', async () => {
    const { result, statusCode } = await get()

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(expect.stringContaining('Start the submission'))
    expect(result).toEqual(expect.stringContaining('Q3 2026 waste data'))
    expect(result).toEqual(expect.stringContaining('Choose how to submit'))
    expect(result).toEqual(
      expect.stringContaining('How do you want to submit?')
    )
  })

  test('lists on-screen entry first, matching the intro, with neither radio preselected', async () => {
    const { result } = await get()

    const onScreenAt = result.indexOf('waste-data-start-on-screen')
    const csvAt = result.indexOf('waste-data-start-csv')
    expect(onScreenAt).toBeGreaterThan(-1)
    expect(onScreenAt).toBeLessThan(csvAt)
    expect(result).not.toEqual(expect.stringMatching(/<input[^>]*checked/))
  })

  test('attaches a hint to each radio', async () => {
    const { result } = await get()

    expect(result).toEqual(
      expect.stringContaining('For small corrections only')
    )
    expect(result).toEqual(
      expect.stringContaining('Recommended for full quarterly returns')
    )
    expect(result).toEqual(expect.stringContaining('govuk-radios__hint'))
  })

  test('POST with on-screen entry saves the choice and moves on to enter', async () => {
    const { result, statusCode } = await server.inject({
      method: 'POST',
      url: paths.prototypeWasteDataStart,
      payload: { submitMethod: 'onScreen' }
    })

    expect(statusCode).toBe(statusCodes.ok)
    expect(pagePayloadFrom(result)).toMatchObject({
      target: 'save',
      savedFields: { submitMethod: 'onScreen' },
      nextStep: paths.prototypeWasteDataEnter
    })
  })

  test('POST with the CSV option goes to the holding page, not a built route', async () => {
    const { headers, statusCode } = await server.inject({
      method: 'POST',
      url: paths.prototypeWasteDataStart,
      payload: { submitMethod: 'csv' }
    })

    expect(statusCode).toBe(statusCodes.found)
    expect(headers.location).toBe(paths.prototypeWasteDataUploadUnavailable)
  })

  test('POST with nothing chosen shows the error summary and an inline error', async () => {
    const post = await server.inject({
      method: 'POST',
      url: paths.prototypeWasteDataStart,
      payload: {}
    })
    expect(post.statusCode).toBe(statusCodes.found)

    const { result } = await server.inject({
      method: 'GET',
      url: paths.prototypeWasteDataStart,
      headers: { cookie: cookieFrom(post) }
    })
    expect(result).toEqual(
      expect.stringContaining('data-testid="waste-data-error-summary"')
    )
    expect(result).toEqual(
      expect.stringContaining('Select how you want to submit')
    )
    expect(result).toEqual(expect.stringContaining('govuk-error-message'))
    expect(result).toEqual(expect.stringContaining('href="#submitMethod"'))
  })

  test('the back link goes to the account home', async () => {
    const { result } = await get()
    expect(backLinkHref(result)).toBe(paths.prototypeWasteDataAccountHome)
  })

  test('is task-flow chrome with no Figma sample data', async () => {
    const { result } = await get()
    expectTaskFlowChrome(result)
    expectNoFigmaSampleData(result)
  })
})
