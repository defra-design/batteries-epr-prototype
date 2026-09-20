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
import { validateEnter } from './controller.js'

describe('#prototypeWasteDataEnter', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  const get = (headers) =>
    server.inject({
      method: 'GET',
      url: paths.prototypeWasteDataEnter,
      headers
    })
  const post = (payload) =>
    server.inject({
      method: 'POST',
      url: paths.prototypeWasteDataEnter,
      payload
    })

  test('GET renders the rendered heading with both collected and delivered fields', async () => {
    const { result, statusCode } = await get()

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(
      expect.stringContaining('Enter tonnes collected and delivered')
    )
    expect(result).toEqual(expect.stringContaining('name="collectedTonnes"'))
    expect(result).toEqual(expect.stringContaining('name="deliveredTonnes"'))
    expect(result).not.toEqual(expect.stringContaining('chemistry'))
  })

  test('attaches a hint to each field and names the receiving operator', async () => {
    const { result } = await get()

    expect(result).toEqual(expect.stringContaining('id="collectedTonnes-hint"'))
    expect(result).toEqual(expect.stringContaining('id="deliveredTonnes-hint"'))
    expect(result).toEqual(
      expect.stringContaining('Halton Battery Processing Ltd')
    )
    expect(result).toEqual(expect.stringContaining('govuk-input__suffix'))
  })

  test('has Back and Continue buttons and a save-and-come-back-later link', async () => {
    const { result } = await get()

    const back = result.match(
      /<a[^>]*data-testid="waste-data-enter-back"[^>]*>/
    )[0]
    expect(back).toEqual(
      expect.stringContaining(`href="${paths.prototypeWasteDataStart}"`)
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="waste-data-enter-continue"')
    )
    expect(result).toEqual(expect.stringContaining('Save and come back later'))
  })

  test('POST with valid figures saves them and moves on to check', async () => {
    const { result, statusCode } = await post({
      collectedTonnes: '80.900',
      deliveredTonnes: '60.250'
    })

    expect(statusCode).toBe(statusCodes.ok)
    expect(pagePayloadFrom(result)).toMatchObject({
      target: 'save',
      savedFields: { collectedTonnes: '80.900', deliveredTonnes: '60.250' },
      nextStep: paths.prototypeWasteDataCheck
    })
  })

  test('POST trims whitespace before validating and saving', async () => {
    const { result } = await post({
      collectedTonnes: ' 80.900 ',
      deliveredTonnes: '60.250 '
    })

    expect(pagePayloadFrom(result).savedFields).toEqual({
      collectedTonnes: '80.900',
      deliveredTonnes: '60.250'
    })
  })

  test('POST with both fields empty shows an error summary and inline errors on both', async () => {
    const response = await post({ collectedTonnes: '', deliveredTonnes: '' })
    expect(response.statusCode).toBe(statusCodes.found)

    const { result } = await get({ cookie: cookieFrom(response) })
    expect(result).toEqual(
      expect.stringContaining('data-testid="waste-data-error-summary"')
    )
    expect(result).toEqual(
      expect.stringContaining('Enter the tonnes collected')
    )
    expect(result).toEqual(
      expect.stringContaining('Enter the tonnes delivered')
    )
    expect(result).toEqual(expect.stringContaining('href="#collectedTonnes"'))
    expect(result).toEqual(expect.stringContaining('href="#deliveredTonnes"'))
    expect(result.match(/govuk-error-message/g).length).toBeGreaterThanOrEqual(
      2
    )
  })

  test('re-renders with what was typed and does not overwrite it from storage', async () => {
    const response = await post({
      collectedTonnes: '80.9',
      deliveredTonnes: '60.250'
    })
    const { result } = await get({ cookie: cookieFrom(response) })

    expect(result).toEqual(expect.stringContaining('value="80.9"'))
    expect(pagePayloadFrom(result).skipHydration).toBe(true)
  })

  test('the back link goes to the start screen', async () => {
    const { result } = await get()
    expect(backLinkHref(result)).toBe(paths.prototypeWasteDataStart)
  })

  test('is task-flow chrome with no Figma sample data', async () => {
    const { result } = await get()
    expectTaskFlowChrome(result)
    expectNoFigmaSampleData(result)
  })
})

describe('validateEnter', () => {
  const messages = (input) => validateEnter(input).map((error) => error.text)

  test('accepts three-decimal figures where delivered does not exceed collected', () => {
    expect(
      validateEnter({ collectedTonnes: '80.900', deliveredTonnes: '80.900' })
    ).toEqual([])
  })

  test.each([
    ['80', 'exactly 3 decimal places'],
    ['80.9', 'exactly 3 decimal places'],
    ['80.9000', 'exactly 3 decimal places'],
    ['eighty', 'must be a number'],
    ['-1.000', 'must be a number'],
    ['0.000', 'must be more than 0']
  ])('rejects collected tonnes of %s', (value, fragment) => {
    const [text] = messages({
      collectedTonnes: value,
      deliveredTonnes: '0.500'
    })
    expect(text).toEqual(expect.stringContaining(fragment))
  })

  test('rejects delivered tonnes above collected tonnes on the delivered field', () => {
    const errors = validateEnter({
      collectedTonnes: '10.000',
      deliveredTonnes: '10.001'
    })

    expect(errors).toEqual([
      {
        text: 'Tonnes delivered cannot be more than the tonnes collected',
        href: '#deliveredTonnes'
      }
    ])
  })

  test('does not compare against an invalid collected figure', () => {
    const errors = validateEnter({
      collectedTonnes: 'abc',
      deliveredTonnes: '10.000'
    })

    expect(errors.map((error) => error.href)).toEqual(['#collectedTonnes'])
  })
})
