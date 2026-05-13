import { JSDOM } from 'jsdom'

import { statusCodes } from '../common/constants/status-codes.js'
import { initialiseServer } from '../../test-utils/initialise-server.js'
import { paths } from '../../config/paths.js'
import { content } from '../../config/content.js'

describe('#cookiesController', () => {
  let server

  beforeAll(async () => {
    server = await initialiseServer()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('renders the cookies page', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.cookies
    })

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(expect.stringContaining('Cookies |'))
  })

  test('has a footer link to /cookies', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: paths.cookies
    })

    expect(result).toEqual(expect.stringContaining('href="/cookies"'))
  })

  test('renders content from translations', async () => {
    const pageContent = content.cookies({})
    const { payload } = await server.inject({
      method: 'GET',
      url: paths.cookies
    })

    const { document } = new JSDOM(payload).window

    expect(document.title).toEqual(
      expect.stringContaining(`${pageContent.title} |`)
    )

    const h1 = document.querySelector('h1').textContent
    expect(h1).toEqual(expect.stringContaining(pageContent.heading))
  })
})
