import { JSDOM } from 'jsdom'

import { statusCodes } from '../common/constants/status-codes.js'
import { initialiseServer } from '../../test-utils/initialise-server.js'
import { paths } from '../../config/paths.js'
import { content } from '../../config/content.js'

describe('#termsController', () => {
  let server

  beforeAll(async () => {
    server = await initialiseServer()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('renders the terms page', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.terms
    })

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(expect.stringContaining('Terms |'))
  })

  test('has a footer link to /terms', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: paths.terms
    })

    expect(result).toEqual(expect.stringContaining('href="/terms"'))
  })

  test('renders all conditions and related links', async () => {
    const pageContent = content.terms({})
    const { payload } = await server.inject({
      method: 'GET',
      url: paths.terms
    })

    const { document } = new JSDOM(payload).window

    const listItems = document.querySelectorAll('.govuk-list--bullet li')
    expect(listItems).toHaveLength(pageContent.conditions.length)

    const relatedLinks = document.querySelectorAll('.app-related-content a')
    expect(relatedLinks).toHaveLength(pageContent.relatedContent.links.length)
  })
})
