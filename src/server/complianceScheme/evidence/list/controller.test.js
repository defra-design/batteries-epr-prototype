import { statusCodes } from '../../../common/constants/status-codes.js'
import { initialiseServer } from '../../../../test-utils/initialise-server.js'
import { paths } from '../../../../config/paths.js'
import { content } from '../../../../config/content.js'

describe('#evidenceListController', () => {
  let server

  beforeAll(async () => {
    server = await initialiseServer()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('renders the list shell with slots and payload', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.complianceSchemeEvidence
    })

    expect(statusCode).toBe(statusCodes.ok)
    const listContent = content.complianceScheme({}).evidencePages.list
    expect(result).toEqual(expect.stringContaining(listContent.heading))
    for (const id of [
      'evidence-body',
      'evidence-empty',
      'evidence-issue-link',
      'evidence-availability-link',
      'evidence-back-link',
      'evidence-period'
    ]) {
      expect(result).toEqual(expect.stringContaining(`data-testid="${id}"`))
    }
    expect(result).toEqual(expect.stringContaining('"view":"list"'))
    expect(result).toEqual(
      expect.stringContaining('"compliancePeriodYear":"2026"')
    )
    expect(result).toEqual(
      expect.stringContaining(
        '"detailTemplate":"/compliance-scheme/evidence/{evidenceId}"'
      )
    )
  })
})
