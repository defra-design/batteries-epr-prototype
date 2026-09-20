import { initialiseServer } from '../../../../../test-utils/initialise-server.js'
import {
  backLinkHref,
  expectNoFigmaSampleData,
  expectTaskFlowChrome,
  pagePayloadFrom
} from '../../../../../test-utils/waste-data-page.js'
import { paths } from '../../../../../config/paths.js'
import { statusCodes } from '../../../../common/constants/status-codes.js'

describe('#prototypeWasteDataCheck', () => {
  let server
  let result
  beforeAll(async () => {
    server = await initialiseServer()
    ;({ result } = await server.inject({
      method: 'GET',
      url: paths.prototypeWasteDataCheck
    }))
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('GET renders the check heading, draft caption and a govukTable', async () => {
    const { statusCode } = await server.inject({
      method: 'GET',
      url: paths.prototypeWasteDataCheck
    })

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(expect.stringContaining('Check and confirm'))
    expect(result).toEqual(
      expect.stringContaining('Q3 2026 waste data · draft')
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="waste-data-check-table"')
    )
  })

  test('the table has collected and delivered rows and hooks for the typed figures', () => {
    for (const text of [
      'Figure',
      'Treatment operator',
      'Tonnes',
      'Collected',
      'All members (scheme level)',
      'Delivered',
      'Halton Battery Processing Ltd'
    ]) {
      expect(result).toEqual(expect.stringContaining(text))
    }
    expect(result).toEqual(
      expect.stringContaining('data-testid="waste-data-check-collected"')
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="waste-data-check-delivered"')
    )
  })

  test('has no Estimated flag, no Flags column and no repeated total row', () => {
    expect(result).not.toEqual(expect.stringContaining('Estimated'))
    expect(result).not.toEqual(expect.stringContaining('Flags'))
    expect(result).not.toEqual(expect.stringContaining('Total delivered'))
  })

  test('continues to the declaration', () => {
    const button = result.match(
      /<a[^>]*data-testid="waste-data-check-continue"[^>]*>/
    )[0]
    expect(button).toEqual(
      expect.stringContaining(`href="${paths.prototypeWasteDataDeclaration}"`)
    )
    expect(result).toEqual(expect.stringContaining('Continue to declaration'))
  })

  test('the payload sends the client back to enter when nothing is stored', () => {
    expect(pagePayloadFrom(result)).toMatchObject({
      step: 'check',
      target: 'hydrate',
      enterUrl: paths.prototypeWasteDataEnter
    })
  })

  test('the back link goes to the enter screen', () => {
    expect(backLinkHref(result)).toBe(paths.prototypeWasteDataEnter)
  })

  test('is task-flow chrome with no Figma sample data', () => {
    expectTaskFlowChrome(result)
    expectNoFigmaSampleData(result)
  })
})
