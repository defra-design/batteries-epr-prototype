import { statusCodes } from '../common/constants/status-codes.js'
import { initialiseServer } from '../../test-utils/initialise-server.js'
import { paths } from '../../config/paths.js'
import { content } from '../../config/content.js'
import { buildPersonaGroups, withDefaultTabFirst } from './controller.js'

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

  test('renders one tab per persona with journeys, driven by the journeys data', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: paths.prototype
    })

    const pageContent = content.prototype({})
    expect(result).toEqual(expect.stringContaining('data-module="govuk-tabs"'))
    expect(result).toEqual(
      expect.stringContaining('data-testid="prototype-tab-producer"')
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="prototype-tab-complianceScheme"')
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="prototype-tab-operator"')
    )
    expect(result).toEqual(
      expect.stringContaining('data-testid="prototype-tab-regulator"')
    )
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

  test('uses the real ABTO tab label from content, not "Treatment operator"', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: paths.prototype
    })

    const pageContent = content.prototype({})
    expect(pageContent.personas.operator).toBe('ABTO')
    expect(result).toEqual(
      expect.stringContaining('data-testid="prototype-tab-operator"')
    )
    expect(result).toEqual(expect.stringContaining('ABTO'))
    expect(result).not.toEqual(expect.stringContaining('Treatment operator'))
  })

  test('selects the producer tab by default, as it has the most journeys with links', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: paths.prototype
    })

    const producerTabItem = result.match(
      /<li class="govuk-tabs__list-item[^"]*"[^>]*>\s*<a[^>]*data-testid="prototype-tab-producer"/
    )[0]
    expect(producerTabItem).toEqual(
      expect.stringContaining('govuk-tabs__list-item--selected')
    )

    const producerPanel = result.match(
      /<div class="govuk-tabs__panel[^"]*" id="persona-producer"/
    )[0]
    expect(producerPanel).not.toEqual(
      expect.stringContaining('govuk-tabs__panel--hidden')
    )

    const regulatorPanel = result.match(
      /<div class="govuk-tabs__panel[^"]*" id="persona-regulator"/
    )[0]
    expect(regulatorPanel).toEqual(
      expect.stringContaining('govuk-tabs__panel--hidden')
    )
  })

  test('omits a persona tab entirely when it has no journeys', () => {
    const journeys = [{ persona: 'producer' }]
    const personas = { producer: 'Producer', regulator: 'Regulator' }

    const personaGroups = buildPersonaGroups(journeys, personas)

    expect(personaGroups).toHaveLength(1)
    expect(personaGroups[0].persona).toBe('producer')
  })

  test('returns an empty list unchanged when there are no persona groups', () => {
    expect(withDefaultTabFirst([])).toEqual([])
  })

  test('defaults to the persona group with the most linked journeys', () => {
    const personaGroups = [
      {
        persona: 'producer',
        journeys: [{ codedHref: '/a' }]
      },
      {
        persona: 'regulator',
        journeys: [{ figmaHref: '/b' }, { figmaHref: '/c' }]
      },
      {
        persona: 'complianceScheme',
        journeys: [{}]
      }
    ]

    const ordered = withDefaultTabFirst(personaGroups)

    expect(ordered.map((group) => group.persona)).toEqual([
      'regulator',
      'producer',
      'complianceScheme'
    ])
  })

  test('breaks a tie in linked journeys using persona order', () => {
    const personaGroups = [
      { persona: 'producer', journeys: [{ codedHref: '/a' }] },
      { persona: 'regulator', journeys: [{ figmaHref: '/b' }] }
    ]

    const ordered = withDefaultTabFirst(personaGroups)

    expect(ordered[0].persona).toBe('producer')
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

  test('renders coming soon journeys for the ABTO group under the operator persona tab', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: paths.prototype
    })

    const pageContent = content.prototype({})
    const journey = pageContent.journeys.abtoReceivesNotesDecision
    expect(result).toEqual(expect.stringContaining(journey.title))
    expect(journey.description).not.toEqual('')
    expect(result).toEqual(expect.stringContaining(journey.description))
    expect(result).toEqual(
      expect.stringContaining(
        'data-testid="prototype-journey-abtoReceivesNotesDecision-coming-soon"'
      )
    )

    const operatorTabIndex = result.indexOf(
      'data-testid="prototype-tab-operator"'
    )
    const journeyIndex = result.indexOf(
      'data-testid="prototype-journey-abtoReceivesNotesDecision"'
    )
    expect(operatorTabIndex).toBeGreaterThan(-1)
    expect(journeyIndex).toBeGreaterThan(operatorTabIndex)
  })

  test('renders the ABTO generates evidence note journey with a Figma link, opening in a new tab', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: paths.prototype
    })

    const pageContent = content.prototype({})
    const journey = pageContent.journeys.abtoGeneratesEvidenceNote
    expect(result).toEqual(expect.stringContaining(journey.title))
    expect(result).toEqual(expect.stringContaining(journey.description))

    const cta = result.match(
      /<a[^>]*data-testid="prototype-journey-abtoGeneratesEvidenceNote-figma-cta"[^>]*>/
    )[0]
    expect(cta).toEqual(expect.stringContaining(`href="${journey.figmaHref}"`))
    expect(cta).toEqual(expect.stringContaining('target="_blank"'))
    expect(cta).toEqual(expect.stringContaining('rel="noopener noreferrer"'))
    expect(result).not.toEqual(
      expect.stringContaining(
        'data-testid="prototype-journey-abtoGeneratesEvidenceNote-coded-cta"'
      )
    )
    expect(result).not.toEqual(
      expect.stringContaining(
        'data-testid="prototype-journey-abtoGeneratesEvidenceNote-coming-soon"'
      )
    )
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
