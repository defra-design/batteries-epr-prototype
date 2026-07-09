import { statusCodes } from '../../../common/constants/status-codes.js'
import { initialiseServer } from '../../../../test-utils/initialise-server.js'
import { paths } from '../../../../config/paths.js'
import { content } from '../../../../config/content.js'

const withdrawUrl = paths.regulatorSchemeWithdraw.replace(
  '{schemeId}',
  'test-scheme-id'
)

describe('#regulatorSchemeWithdrawController', () => {
  let server

  beforeAll(async () => {
    server = await initialiseServer()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('GET renders the withdraw confirmation page with hydrate target', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: withdrawUrl
    })

    expect(statusCode).toBe(statusCodes.ok)
    const pageContent = content.regulator({}).schemesPages.withdraw
    expect(result).toEqual(expect.stringContaining(pageContent.heading))
    expect(result).toEqual(
      expect.stringContaining('data-testid="scheme-withdraw-heading"')
    )
    expect(result).toEqual(expect.stringContaining('"target":"hydrate"'))
    expect(result).toEqual(
      expect.stringContaining('"schemeId":"test-scheme-id"')
    )
  })

  test('POST renders with persist target and reason', async () => {
    const { result, statusCode } = await server.inject({
      method: 'POST',
      url: withdrawUrl,
      payload: { reason: 'Non-compliance' }
    })

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(expect.stringContaining('"target":"persist"'))
    expect(result).toEqual(expect.stringContaining('"reason":"Non-compliance"'))
  })

  test('POST renders with empty reason when not provided', async () => {
    const { result, statusCode } = await server.inject({
      method: 'POST',
      url: withdrawUrl,
      payload: {}
    })

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(expect.stringContaining('"target":"persist"'))
    expect(result).toEqual(expect.stringContaining('"reason":""'))
  })
})
