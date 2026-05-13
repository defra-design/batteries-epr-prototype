import { JSDOM } from 'jsdom'

import { statusCodes } from '../common/constants/status-codes.js'
import { initialiseServer } from '../../test-utils/initialise-server.js'
import { paths } from '../../config/paths.js'
import { content } from '../../config/content.js'

describe('#privacyNoticeController', () => {
  let server

  beforeAll(async () => {
    server = await initialiseServer()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('renders the privacy notice', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.privacyNotice
    })

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual(expect.stringContaining('Privacy notice |'))
  })

  test('has a footer link to /privacy-notice', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: paths.privacyNotice
    })

    expect(result).toEqual(expect.stringContaining('href="/privacy-notice"'))
  })

  test('renders all configured sections', async () => {
    const pageContent = content.privacyNotice({})
    const { payload } = await server.inject({
      method: 'GET',
      url: paths.privacyNotice
    })

    const { document } = new JSDOM(payload).window
    const sectionHeadings = document.querySelectorAll(
      '.govuk-grid-column-two-thirds h2'
    )
    expect(sectionHeadings).toHaveLength(pageContent.sections.length)
  })
})
