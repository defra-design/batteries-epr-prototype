import { initialiseServer } from '../../../../../test-utils/initialise-server.js'
import {
  backLinkHref,
  expectNoFigmaSampleData,
  expectTaskFlowChrome,
  pagePayloadFrom
} from '../../../../../test-utils/waste-data-page.js'
import { paths } from '../../../../../config/paths.js'
import { statusCodes } from '../../../../common/constants/status-codes.js'

describe('#prototypeWasteDataSubmitted', () => {
  let server
  let result
  beforeAll(async () => {
    server = await initialiseServer()
    ;({ result } = await server.inject({
      method: 'GET',
      url: paths.prototypeWasteDataSubmitted
    }))
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('GET renders the success banner, heading, submitted tag and summary list', async () => {
    const { statusCode } = await server.inject({
      method: 'GET',
      url: paths.prototypeWasteDataSubmitted
    })

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('govuk-notification-banner--success')
    )
    expect(result).toEqual(
      expect.stringContaining('Your Q3 2026 waste data has been submitted')
    )
    expect(result).toEqual(expect.stringContaining('Your Q3 2026 waste data'))
    expect(result).toEqual(
      expect.stringMatching(
        /data-testid="waste-data-submitted-tag"[^>]*>\s*Submitted\s*<\/strong>/
      )
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="waste-data-submitted-summary"')
    )
  })

  test('the tag is blue because the return is submitted, not yet final', () => {
    const tag = result.match(
      /<strong[^>]*data-testid="waste-data-submitted-tag"[^>]*>/
    )[0]
    expect(tag).toEqual(expect.stringContaining('govuk-tag--blue'))
  })

  test('the summary shows the seeded final date and leaves the typed figures to the client', () => {
    for (const label of [
      'Total collected',
      'Total delivered',
      'Submitted by',
      'Status'
    ]) {
      expect(result).toEqual(expect.stringContaining(label))
    }
    expect(result).toEqual(
      expect.stringContaining('Submitted — becomes final on 31 October 2026')
    )
    expect(result).not.toEqual(expect.stringContaining('210.500'))
  })

  test('drops the invoice row, which nothing in the journey produces', () => {
    expect(result).not.toEqual(expect.stringContaining('Invoice'))
    expect(result).not.toEqual(expect.stringContaining('invoice'))
  })

  test('the payload carries the templates the client fills from the stored submission', () => {
    expect(pagePayloadFrom(result)).toMatchObject({
      step: 'submitted',
      target: 'hydrate',
      accountHomeUrl: paths.prototypeWasteDataAccountHome,
      collectedTemplate: '{tonnes} tonnes',
      deliveredTemplate: '{tonnes} tonnes, to Halton Battery Processing Ltd',
      submittedByTemplate: 'Priya Shah, {date}'
    })
  })

  test('has no back link, only an in-body link to the account home', () => {
    expect(backLinkHref(result)).toBeNull()
    const link = result.match(
      /<a[^>]*data-testid="waste-data-submitted-account-home"[^>]*>/
    )[0]
    expect(link).toEqual(
      expect.stringContaining(`href="${paths.prototypeWasteDataAccountHome}"`)
    )
  })

  test('is task-flow chrome with no Figma sample data', () => {
    expectTaskFlowChrome(result)
    expectNoFigmaSampleData(result)
  })
})
