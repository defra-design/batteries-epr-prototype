import { statusCodes } from '../../../common/constants/status-codes.js'
import { initialiseServer } from '../../../../test-utils/initialise-server.js'
import { paths } from '../../../../config/paths.js'
import { content } from '../../../../config/content.js'

const evidenceDetailUrl = paths.regulatorEvidenceDetail.replace(
  '{evidenceId}',
  'test-evidence-id'
)

describe('#regulatorEvidenceDetailController', () => {
  let server

  beforeAll(async () => {
    server = await initialiseServer()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('GET renders the evidence detail page with hydrate target', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: evidenceDetailUrl
    })

    expect(statusCode).toBe(statusCodes.ok)
    const pageContent = content.regulator({}).evidenceOverviewPages.detail
    expect(result).toEqual(expect.stringContaining(pageContent.heading))
    expect(result).toEqual(
      expect.stringContaining('data-testid="evidence-detail-list"')
    )
    expect(result).toEqual(expect.stringContaining('"target":"hydrate"'))
    expect(result).toEqual(
      expect.stringContaining('"evidenceId":"test-evidence-id"')
    )
  })
})
