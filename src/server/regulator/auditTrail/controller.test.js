import { statusCodes } from '../../common/constants/status-codes.js'
import { initialiseServer } from '../../../test-utils/initialise-server.js'
import { paths } from '../../../config/paths.js'
import { content } from '../../../config/content.js'

describe('#regulatorAuditTrailController', () => {
  let server

  beforeAll(async () => {
    server = await initialiseServer()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('renders the audit trail page with a caveat and list container', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.regulatorAuditTrail
    })

    expect(statusCode).toBe(statusCodes.ok)
    const pageContent = content.regulator({}).auditTrailPage
    expect(result).toEqual(expect.stringContaining(pageContent.heading))
    expect(result).toEqual(expect.stringContaining(pageContent.warningText))
    expect(result).toEqual(
      expect.stringContaining('data-testid="audit-trail-warning"')
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="audit-trail-table"')
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="audit-trail-list"')
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="audit-trail-empty"')
    )
    expect(result).toEqual(
      expect.stringContaining(pageContent.columns.changedBy)
    )
  })

  test('emits a page-payload with view auditTrail and copy', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: paths.regulatorAuditTrail
    })

    expect(result).toEqual(expect.stringContaining('id="page-payload"'))
    expect(result).toEqual(expect.stringContaining('"view":"auditTrail"'))
    expect(result).toEqual(expect.stringContaining('"categoryLabels"'))
  })
})
