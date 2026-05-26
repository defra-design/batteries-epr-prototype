import { statusCodes } from '../../../common/constants/status-codes.js'
import { initialiseServer } from '../../../../test-utils/initialise-server.js'
import { paths } from '../../../../config/paths.js'
import { content } from '../../../../config/content.js'

describe('#regulatorSchemeListController', () => {
  let server

  beforeAll(async () => {
    server = await initialiseServer()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('renders the scheme list page', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.regulatorSchemes
    })

    expect(statusCode).toBe(statusCodes.ok)
    const pageContent = content.regulator({}).schemesPages.list
    expect(result).toEqual(expect.stringContaining(pageContent.heading))
    expect(result).toEqual(expect.stringContaining(pageContent.intro))
    expect(result).toEqual(expect.stringContaining('data-testid="schemes-table"'))
    expect(result).toEqual(expect.stringContaining('data-testid="schemes-body"'))
    expect(result).toEqual(expect.stringContaining('data-testid="schemes-empty"'))
  })

  test('emits a page-payload with view list', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: paths.regulatorSchemes
    })

    expect(result).toEqual(expect.stringContaining('id="page-payload"'))
    expect(result).toEqual(expect.stringContaining('"view":"list"'))
  })
})
