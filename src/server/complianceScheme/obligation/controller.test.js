import { statusCodes } from '../../common/constants/status-codes.js'
import { initialiseServer } from '../../../test-utils/initialise-server.js'
import { paths } from '../../../config/paths.js'
import { content } from '../../../config/content.js'

describe('#obligationController', () => {
  let server

  beforeAll(async () => {
    server = await initialiseServer()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('renders the obligation table shell with period + methodology', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.complianceSchemeObligation
    })
    expect(statusCode).toBe(statusCodes.ok)
    const pageContent = content.complianceScheme({}).obligationPage
    expect(result).toEqual(expect.stringContaining(pageContent.heading))
    for (const id of [
      'obligation-body',
      'obligation-foot',
      'obligation-total-placed',
      'obligation-total-obligation',
      'obligation-total-accepted',
      'obligation-total-outstanding',
      'obligation-methodology',
      'obligation-period',
      'obligation-back-link'
    ]) {
      expect(result).toEqual(expect.stringContaining(`data-testid="${id}"`))
    }
    expect(result).toEqual(expect.stringContaining('"view":"obligation"'))
    expect(result).toEqual(
      expect.stringContaining('"compliancePeriodYear":"2026"')
    )
  })
})
