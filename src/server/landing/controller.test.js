import { statusCodes } from '../common/constants/status-codes.js'
import { initialiseServer } from '../../test-utils/initialise-server.js'
import { paths } from '../../config/paths.js'
import { content } from '../../config/content.js'

describe('#landingController', () => {
  let server

  beforeAll(async () => {
    server = await initialiseServer()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('renders the area chooser with a card for each area', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.home
    })

    expect(statusCode).toBe(statusCodes.ok)
    const pageContent = content.landing({})
    expect(result).toEqual(expect.stringContaining(pageContent.heading))
    expect(result).toEqual(expect.stringContaining(pageContent.intro))
    expect(result).toEqual(
      expect.stringContaining('data-testid="landing-area-playground-cta"')
    )
    expect(result).toEqual(
      expect.stringContaining(`href="${paths.playground}"`)
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="landing-area-prototype-cta"')
    )
    expect(result).toEqual(expect.stringContaining(`href="${paths.prototype}"`))
    expect(result).toEqual(
      expect.stringContaining(
        'data-testid="landing-area-bcs-registration-walkthrough-cta"'
      )
    )
    expect(result).toEqual(
      expect.stringContaining(`href="${paths.bcsRegistrationWalkthrough}"`)
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="landing-area-alpha-assessment-cta"')
    )
    expect(result).toEqual(
      expect.stringContaining(`href="${paths.alphaAssessment}"`)
    )
  })
})
