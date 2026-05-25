import { statusCodes } from '../../../common/constants/status-codes.js'
import { initialiseServer } from '../../../../test-utils/initialise-server.js'
import { paths } from '../../../../config/paths.js'
import { content } from '../../../../config/content.js'

describe('#operatorEvidenceListController', () => {
  let server

  beforeAll(async () => {
    server = await initialiseServer()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('GET renders the evidence list page with table and issue link', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.operatorEvidence
    })

    expect(statusCode).toBe(statusCodes.ok)
    const pageContent = content.operator({}).evidencePages.list
    expect(result).toEqual(expect.stringContaining(pageContent.heading))
    expect(result).toEqual(
      expect.stringContaining('data-testid="evidence-table"')
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="evidence-issue-link"')
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="evidence-back-link"')
    )
    expect(result).toEqual(expect.stringContaining('"view":"list"'))
  })
})
