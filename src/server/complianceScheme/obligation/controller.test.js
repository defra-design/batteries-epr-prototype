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

  test('renders the obligation table shell with period + calculation section', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.complianceSchemeObligation
    })
    expect(statusCode).toBe(statusCodes.ok)
    const pageContent = content.complianceScheme({}).obligationPage
    expect(result).toEqual(expect.stringContaining(pageContent.heading))
    expect(result).toEqual(expect.stringContaining(pageContent.calcHeading))
    for (const id of [
      'obligation-calculate',
      'obligation-empty',
      'obligation-results',
      'obligation-previous',
      'obligation-previous-list',
      'obligation-body',
      'obligation-foot',
      'obligation-total-placed',
      'obligation-total-obligation',
      'obligation-total-accepted',
      'obligation-total-outstanding',
      'obligation-certificate-heading',
      'obligation-certificate-summary',
      'obligation-certificate-calculated-at',
      'obligation-certificate-rule-version',
      'obligation-certificate-config',
      'obligation-certificate-targets',
      'obligation-certificate-caveat',
      'obligation-calc-heading',
      'obligation-calc-warning',
      'obligation-calc-list',
      'obligation-config-changed',
      'obligation-config-changed-list',
      'obligation-period',
      'obligation-back-link'
    ]) {
      expect(result).toEqual(expect.stringContaining(`data-testid="${id}"`))
    }
    expect(result).not.toEqual(
      expect.stringContaining('data-testid="obligation-calc-portable"')
    )
    expect(result).toEqual(expect.stringContaining('"view":"obligation"'))
    expect(result).toEqual(
      expect.stringContaining('"compliancePeriodYear":"2026"')
    )
    expect(result).toEqual(
      expect.stringContaining('/compliance-scheme/quarterly/{quarter}/{step}')
    )
  })
})
