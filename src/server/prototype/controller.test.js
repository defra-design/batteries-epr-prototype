import { statusCodes } from '../common/constants/status-codes.js'
import { initialiseServer } from '../../test-utils/initialise-server.js'
import { paths } from '../../config/paths.js'
import { content } from '../../config/content.js'

const CODED_JOURNEY_IDS = new Set([
  'smallProducerRegistration',
  'smallProducerSubmission',
  'complianceSchemeQuarterlySubmission'
])

describe('#prototypeController', () => {
  let server

  beforeAll(async () => {
    server = await initialiseServer()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('renders the journey card linking to the small producer registration', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.prototype
    })

    expect(statusCode).toBe(statusCodes.ok)
    const pageContent = content.prototype({})
    expect(result).toEqual(expect.stringContaining(pageContent.heading))
    expect(result).toEqual(expect.stringContaining(pageContent.intro))
    expect(result).toEqual(
      expect.stringContaining(
        pageContent.journeys.smallProducerRegistration.title
      )
    )
    expect(result).toEqual(
      expect.stringContaining(
        'data-testid="prototype-journey-smallProducerRegistration-coded-cta"'
      )
    )
    expect(result).toEqual(
      expect.stringContaining(`href="${paths.prototypeRegistrationStart}"`)
    )
    expect(result).toEqual(
      expect.stringContaining(
        'data-testid="prototype-journey-smallProducerSubmission-coded-cta"'
      )
    )
    expect(result).toEqual(
      expect.stringContaining(`href="${paths.prototypeSubmissionSignIn}"`)
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="prototype-home-link"')
    )
    expect(result).toEqual(expect.stringContaining(`href="${paths.home}"`))
  })

  test('renders a single list of journeys grouped by persona, not split into coded/figma sections or tabs', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: paths.prototype
    })

    expect(result).not.toEqual(expect.stringContaining('prototype-section-'))
    expect(result).not.toEqual(expect.stringContaining('govuk-tabs'))
  })

  test('groups journeys by persona, in persona order', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: paths.prototype
    })

    const pageContent = content.prototype({})
    const producerIndex = result.indexOf(
      'data-testid="prototype-persona-heading-producer"'
    )
    const complianceSchemeIndex = result.indexOf(
      'data-testid="prototype-persona-heading-complianceScheme"'
    )
    const operatorIndex = result.indexOf(
      'data-testid="prototype-persona-heading-operator"'
    )
    const regulatorIndex = result.indexOf(
      'data-testid="prototype-persona-heading-regulator"'
    )

    expect(producerIndex).toBeGreaterThan(-1)
    expect(complianceSchemeIndex).toBeGreaterThan(producerIndex)
    expect(operatorIndex).toBeGreaterThan(complianceSchemeIndex)
    expect(regulatorIndex).toBeGreaterThan(operatorIndex)
    expect(result).toEqual(
      expect.stringContaining(pageContent.personas.producer)
    )
    expect(result).toEqual(
      expect.stringContaining(pageContent.personas.complianceScheme)
    )
    expect(result).toEqual(
      expect.stringContaining(pageContent.personas.operator)
    )
    expect(result).toEqual(
      expect.stringContaining(pageContent.personas.regulator)
    )
  })

  test('does not render an empty state for any persona group', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: paths.prototype
    })

    expect(result).not.toEqual(
      expect.stringContaining(
        'data-testid="prototype-persona-group-producer-empty"'
      )
    )
    expect(result).not.toEqual(
      expect.stringContaining(
        'data-testid="prototype-persona-group-complianceScheme-empty"'
      )
    )
    expect(result).not.toEqual(
      expect.stringContaining(
        'data-testid="prototype-persona-group-operator-empty"'
      )
    )
    expect(result).not.toEqual(
      expect.stringContaining(
        'data-testid="prototype-persona-group-regulator-empty"'
      )
    )
  })

  test('renders coming soon journeys with a tag and no links', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: paths.prototype
    })

    const pageContent = content.prototype({})
    const journey = pageContent.journeys.bcsEnquiresHowToApply
    expect(result).toEqual(expect.stringContaining(journey.title))
    expect(journey.description).not.toEqual('')
    expect(result).toEqual(
      expect.stringContaining(journey.description.replace(/'/g, '&#39;'))
    )
    expect(result).toEqual(
      expect.stringContaining(
        'data-testid="prototype-journey-bcsEnquiresHowToApply-coming-soon"'
      )
    )
    expect(result).not.toEqual(
      expect.stringContaining(
        'data-testid="prototype-journey-bcsEnquiresHowToApply-coded-cta"'
      )
    )
    expect(result).not.toEqual(
      expect.stringContaining(
        'data-testid="prototype-journey-bcsEnquiresHowToApply-figma-cta"'
      )
    )
    expect(result).toEqual(expect.stringContaining('Coming soon'))
  })

  test('renders coming soon journeys for the ABTO group under the operator persona', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: paths.prototype
    })

    const pageContent = content.prototype({})
    const journey = pageContent.journeys.abtoGeneratesEvidenceNote
    expect(result).toEqual(expect.stringContaining(journey.title))
    expect(journey.description).not.toEqual('')
    expect(result).toEqual(expect.stringContaining(journey.description))
    expect(result).toEqual(
      expect.stringContaining(
        'data-testid="prototype-journey-abtoGeneratesEvidenceNote-coming-soon"'
      )
    )

    const operatorHeadingIndex = result.indexOf(
      'data-testid="prototype-persona-heading-operator"'
    )
    const journeyIndex = result.indexOf(
      'data-testid="prototype-journey-abtoGeneratesEvidenceNote"'
    )
    expect(operatorHeadingIndex).toBeGreaterThan(-1)
    expect(journeyIndex).toBeGreaterThan(operatorHeadingIndex)
  })

  test('renders coming soon journeys for the regulator group', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: paths.prototype
    })

    const pageContent = content.prototype({})
    const journey = pageContent.journeys.regulatorReviewsAbtoWasteFigures
    expect(result).toEqual(
      expect.stringContaining(journey.title.replace(/'/g, '&#39;'))
    )
    expect(journey.description).not.toEqual('')
    expect(result).toEqual(
      expect.stringContaining(journey.description.replace(/'/g, '&#39;'))
    )
    expect(result).toEqual(
      expect.stringContaining(
        'data-testid="prototype-journey-regulatorReviewsAbtoWasteFigures-coming-soon"'
      )
    )
  })

  test('renders the PoM submission received by regulator journey with a Figma link, opening in a new tab', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: paths.prototype
    })

    const pageContent = content.prototype({})
    const journey = pageContent.journeys.regulatorReceivesPomSubmission
    expect(result).toEqual(expect.stringContaining(journey.title))
    expect(result).toEqual(
      expect.stringContaining(journey.description.replace(/'/g, '&#39;'))
    )

    const cta = result.match(
      /<a[^>]*data-testid="prototype-journey-regulatorReceivesPomSubmission-figma-cta"[^>]*>/
    )[0]
    expect(cta).toEqual(expect.stringContaining(`href="${journey.figmaHref}"`))
    expect(cta).toEqual(expect.stringContaining('target="_blank"'))
    expect(cta).toEqual(expect.stringContaining('rel="noopener noreferrer"'))
    expect(result).not.toEqual(
      expect.stringContaining(
        'data-testid="prototype-journey-regulatorReceivesPomSubmission-coded-cta"'
      )
    )
    expect(result).not.toEqual(
      expect.stringContaining(
        'data-testid="prototype-journey-regulatorReceivesPomSubmission-coming-soon"'
      )
    )
  })

  test('every journey without a coded or figma link has a non-empty description', () => {
    const pageContent = content.prototype({})
    const comingSoonJourneys = Object.entries(pageContent.journeys)
      .filter(
        ([id, journey]) => !CODED_JOURNEY_IDS.has(id) && !journey.figmaHref
      )
      .map(([, journey]) => journey)

    expect(comingSoonJourneys.length).toBeGreaterThan(0)
    comingSoonJourneys.forEach((journey) => {
      expect(journey.description).not.toEqual('')
    })
  })

  test('renders the journey card linking to the compliance scheme sign in', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: paths.prototype
    })

    const pageContent = content.prototype({})
    expect(result).toEqual(
      expect.stringContaining(
        pageContent.journeys.complianceSchemeQuarterlySubmission.title
      )
    )
    expect(result).toEqual(
      expect.stringContaining(
        pageContent.journeys.complianceSchemeQuarterlySubmission.description
      )
    )
    expect(result).toEqual(
      expect.stringContaining(
        'data-testid="prototype-journey-complianceSchemeQuarterlySubmission-coded-cta"'
      )
    )
    expect(result).toEqual(
      expect.stringContaining(
        `href="${paths.prototypeComplianceSchemeSubmissionSignIn}"`
      )
    )
    expect(result).toEqual(expect.stringContaining(pageContent.links.coded))
    expect(result).not.toEqual(
      expect.stringContaining(
        'data-testid="prototype-journey-complianceSchemeQuarterlySubmission-coming-soon"'
      )
    )
    expect(result).not.toEqual(
      expect.stringContaining('/compliance-scheme/quarterly')
    )
  })

  test('renders the Figma journey card with an external link, opening in a new tab', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: paths.prototype
    })

    const pageContent = content.prototype({})
    const figmaJourney = pageContent.journeys.bcsRegulatorReview
    expect(result).toEqual(expect.stringContaining(figmaJourney.title))
    expect(result).toEqual(expect.stringContaining(figmaJourney.description))

    const cta = result.match(
      /<a[^>]*data-testid="prototype-journey-bcsRegulatorReview-figma-cta"[^>]*>/
    )[0]
    expect(cta).toEqual(
      expect.stringContaining(`href="${figmaJourney.figmaHref}"`)
    )
    expect(cta).toEqual(expect.stringContaining('target="_blank"'))
    expect(cta).toEqual(expect.stringContaining('rel="noopener noreferrer"'))
    expect(result).toEqual(
      expect.stringContaining(`${pageContent.links.figma} (opens in new tab)`)
    )
    expect(result).not.toEqual(
      expect.stringContaining(
        'data-testid="prototype-journey-bcsRegulatorReview-coded-cta"'
      )
    )
  })

  test('coded journey links do not open in a new tab', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: paths.prototype
    })

    const cta = result.match(
      /<a[^>]*data-testid="prototype-journey-smallProducerRegistration-coded-cta"[^>]*>/
    )[0]
    expect(cta).not.toEqual(expect.stringContaining('target="_blank"'))
  })
})
