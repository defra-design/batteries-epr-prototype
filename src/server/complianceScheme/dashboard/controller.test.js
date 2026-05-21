import { statusCodes } from '../../common/constants/status-codes.js'
import { initialiseServer } from '../../../test-utils/initialise-server.js'
import { paths } from '../../../config/paths.js'
import { content } from '../../../config/content.js'

describe('#complianceSchemeDashboardController', () => {
  let server

  beforeAll(async () => {
    server = await initialiseServer()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('renders the dashboard shell with all tile slots', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.complianceSchemeDashboard
    })

    expect(statusCode).toBe(statusCodes.ok)
    const pageContent = content.complianceScheme({})
    expect(result).toEqual(expect.stringContaining(pageContent.heading.text))
    expect(result).toEqual(expect.stringContaining(pageContent.introParagraph))

    for (const id of [
      'compliance-scheme-dashboard',
      'tile-approval-status',
      'tile-approval-action',
      'tile-members-count',
      'tile-evidence-accepted',
      'tile-evidence-awaiting',
      'tile-evidence-obligation',
      'tile-evidence-delta',
      'tile-evidence-availability',
      'tile-quarterly-list',
      'tile-ia-status',
      'tile-ia-action',
      'tile-obligation-action'
    ]) {
      expect(result).toEqual(expect.stringContaining(`data-testid="${id}"`))
    }
  })

  test('emits a page-payload with urls and copy', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: paths.complianceSchemeDashboard
    })

    expect(result).toEqual(expect.stringContaining('id="page-payload"'))
    expect(result).toEqual(
      expect.stringContaining(
        '"applicationStart":"/compliance-scheme/application/scheme-details"'
      )
    )
    expect(result).toEqual(
      expect.stringContaining('"members":"/compliance-scheme/members"')
    )
    expect(result).toEqual(
      expect.stringContaining(
        '"quarterly":"/compliance-scheme/quarterly/{quarter}/{step}"'
      )
    )
    expect(result).toEqual(expect.stringContaining('"copy"'))
  })
})
