import { statusCodes } from '../../../common/constants/status-codes.js'
import { initialiseServer } from '../../../../test-utils/initialise-server.js'
import { paths } from '../../../../config/paths.js'
import { content } from '../../../../config/content.js'

const operatorDetailUrl = paths.regulatorOperatorDetail.replace(
  '{operatorId}',
  'test-operator-id'
)

describe('#regulatorOperatorDetailController', () => {
  let server

  beforeAll(async () => {
    server = await initialiseServer()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('GET renders the operator detail page with hydrate target', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: operatorDetailUrl
    })

    expect(statusCode).toBe(statusCodes.ok)
    const pageContent = content.regulator({}).operatorsPages.detail
    expect(result).toEqual(expect.stringContaining(pageContent.heading))
    expect(result).toEqual(
      expect.stringContaining('data-testid="operator-detail-list"')
    )
    expect(result).toEqual(expect.stringContaining('"target":"hydrate"'))
    expect(result).toEqual(
      expect.stringContaining('"operatorId":"test-operator-id"')
    )
  })

  test('POST renders with persist target and approve action', async () => {
    const { result, statusCode } = await server.inject({
      method: 'POST',
      url: operatorDetailUrl,
      payload: { action: 'approve', approvalNumber: 'ABTO-001' }
    })

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(expect.stringContaining('"target":"persist"'))
    expect(result).toEqual(expect.stringContaining('"action":"approve"'))
    expect(result).toEqual(
      expect.stringContaining('"approvalNumber":"ABTO-001"')
    )
  })

  test('POST renders with persist target and reject action', async () => {
    const { result, statusCode } = await server.inject({
      method: 'POST',
      url: operatorDetailUrl,
      payload: { action: 'reject' }
    })

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(expect.stringContaining('"target":"persist"'))
    expect(result).toEqual(expect.stringContaining('"action":"reject"'))
  })
})
