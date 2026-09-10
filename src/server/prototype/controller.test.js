import { statusCodes } from '../common/constants/status-codes.js'
import { initialiseServer } from '../../test-utils/initialise-server.js'
import { paths } from '../../config/paths.js'
import { content } from '../../config/content.js'

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
        'data-testid="prototype-journey-smallProducerRegistration-cta"'
      )
    )
    expect(result).toEqual(
      expect.stringContaining(`href="${paths.prototypeRegistrationStart}"`)
    )
    expect(result).toEqual(
      expect.stringContaining(
        'data-testid="prototype-journey-smallProducerSubmission-cta"'
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

  test('renders two headed sections, Coded prototypes before Figma prototypes, not tabs', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: paths.prototype
    })

    const pageContent = content.prototype({})
    expect(result).toEqual(
      expect.stringContaining('data-testid="prototype-section-coded"')
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="prototype-section-figma"')
    )
    expect(result).toEqual(expect.stringContaining(pageContent.sections.coded))
    expect(result).toEqual(expect.stringContaining(pageContent.sections.figma))

    const codedIndex = result.indexOf('data-testid="prototype-section-coded"')
    const figmaIndex = result.indexOf('data-testid="prototype-section-figma"')
    expect(codedIndex).toBeGreaterThan(-1)
    expect(figmaIndex).toBeGreaterThan(codedIndex)

    expect(result).not.toEqual(expect.stringContaining('govuk-tabs'))
  })

  test('groups journeys by persona within the coded section, in persona order', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: paths.prototype
    })

    const pageContent = content.prototype({})
    const producerIndex = result.indexOf(
      'data-testid="prototype-persona-heading-coded-producer"'
    )
    const complianceSchemeIndex = result.indexOf(
      'data-testid="prototype-persona-heading-coded-complianceScheme"'
    )
    const operatorIndex = result.indexOf(
      'data-testid="prototype-persona-heading-coded-operator"'
    )
    const regulatorIndex = result.indexOf(
      'data-testid="prototype-persona-heading-coded-regulator"'
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

  test('renders an empty state for figma persona groups with no journeys', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: paths.prototype
    })

    expect(result).toEqual(
      expect.stringContaining(
        'data-testid="prototype-persona-group-figma-producer-empty"'
      )
    )
    expect(result).toEqual(
      expect.stringContaining(
        'data-testid="prototype-persona-group-figma-complianceScheme-empty"'
      )
    )
    expect(result).toEqual(
      expect.stringContaining(
        'data-testid="prototype-persona-group-figma-operator-empty"'
      )
    )
  })

  test('does not render an empty state for a persona group with journeys', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: paths.prototype
    })

    expect(result).not.toEqual(
      expect.stringContaining(
        'data-testid="prototype-persona-group-coded-producer-empty"'
      )
    )
    expect(result).not.toEqual(
      expect.stringContaining(
        'data-testid="prototype-persona-group-coded-complianceScheme-empty"'
      )
    )
    expect(result).not.toEqual(
      expect.stringContaining(
        'data-testid="prototype-persona-group-coded-operator-empty"'
      )
    )
    expect(result).not.toEqual(
      expect.stringContaining(
        'data-testid="prototype-persona-group-coded-regulator-empty"'
      )
    )
    expect(result).not.toEqual(
      expect.stringContaining(
        'data-testid="prototype-persona-group-figma-regulator-empty"'
      )
    )
  })

  test('renders coming soon journeys with a tag and no start link', async () => {
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
        'data-testid="prototype-journey-bcsEnquiresHowToApply-cta"'
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
      'data-testid="prototype-persona-heading-coded-operator"'
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
    const journey = pageContent.journeys.regulatorReceivesPomSubmission
    expect(result).toEqual(expect.stringContaining(journey.title))
    expect(journey.description).not.toEqual('')
    expect(result).toEqual(
      expect.stringContaining(journey.description.replace(/'/g, '&#39;'))
    )
    expect(result).toEqual(
      expect.stringContaining(
        'data-testid="prototype-journey-regulatorReceivesPomSubmission-coming-soon"'
      )
    )
  })

  test('every coming soon journey in the coded section has a non-empty description', () => {
    const pageContent = content.prototype({})
    const comingSoonJourneys = Object.values(pageContent.journeys).filter(
      (journey) => journey.comingSoon
    )

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
        'data-testid="prototype-journey-complianceSchemeQuarterlySubmission-cta"'
      )
    )
    expect(result).toEqual(
      expect.stringContaining(
        `href="${paths.prototypeComplianceSchemeSubmissionSignIn}"`
      )
    )
    expect(result).toEqual(
      expect.stringContaining(
        pageContent.journeys.complianceSchemeQuarterlySubmission.linkText
      )
    )
    expect(result).not.toEqual(
      expect.stringContaining(
        'data-testid="prototype-journey-complianceSchemeQuarterlySubmission-not-built"'
      )
    )
    expect(result).not.toEqual(expect.stringContaining('Not yet built'))
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
      /<a[^>]*data-testid="prototype-journey-bcsRegulatorReview-cta"[^>]*>/
    )[0]
    expect(cta).toEqual(expect.stringContaining(`href="${figmaJourney.href}"`))
    expect(cta).toEqual(expect.stringContaining('target="_blank"'))
    expect(cta).toEqual(expect.stringContaining('rel="noopener noreferrer"'))
    expect(result).toEqual(
      expect.stringContaining(`${figmaJourney.linkText} (opens in new tab)`)
    )
  })

  test('coded journey links do not open in a new tab', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: paths.prototype
    })

    const cta = result.match(
      /<a[^>]*data-testid="prototype-journey-smallProducerRegistration-cta"[^>]*>/
    )[0]
    expect(cta).not.toEqual(expect.stringContaining('target="_blank"'))
  })
})
