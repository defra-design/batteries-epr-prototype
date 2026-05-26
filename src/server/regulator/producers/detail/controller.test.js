import { statusCodes } from '../../../common/constants/status-codes.js'
import { initialiseServer } from '../../../../test-utils/initialise-server.js'
import { paths } from '../../../../config/paths.js'
import { content } from '../../../../config/content.js'

const producerDetailUrl = paths.regulatorProducerDetail.replace('{producerId}', 'test-producer-id')

describe('#regulatorProducerDetailController', () => {
  let server

  beforeAll(async () => {
    server = await initialiseServer()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('GET renders the producer detail page with hydrate target', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: producerDetailUrl
    })

    expect(statusCode).toBe(statusCodes.ok)
    const pageContent = content.regulator({}).producersPages.detail
    expect(result).toEqual(expect.stringContaining(pageContent.heading))
    expect(result).toEqual(expect.stringContaining('data-testid="producer-detail-list"'))
    expect(result).toEqual(expect.stringContaining('"target":"hydrate"'))
    expect(result).toEqual(expect.stringContaining('"producerId":"test-producer-id"'))
  })
})
