import { content } from '../../config/content.js'
import { paths } from '../../config/paths.js'

const journeyHrefs = {
  smallProducerRegistration: paths.prototypeRegistrationStart,
  smallProducerSubmission: paths.prototypeSubmissionSignIn,
  complianceSchemeQuarterlySubmission:
    paths.prototypeComplianceSchemeSubmissionSignIn
}

const SECTION_TYPES = ['coded', 'figma']

const buildPersonaGroups = (journeys, personas) =>
  Object.entries(personas).map(([personaId, heading]) => ({
    persona: personaId,
    heading,
    journeys: journeys.filter((journey) => journey.persona === personaId)
  }))

export const prototypeController = {
  handler(request, h) {
    const pageContent = content.prototype(request)

    const journeys = Object.entries(pageContent.journeys).map(
      ([id, journey]) => ({
        id,
        ...journey,
        href: journey.type === 'figma' ? journey.href : journeyHrefs[id]
      })
    )

    const sections = SECTION_TYPES.map((type) => ({
      type,
      heading: pageContent.sections[type],
      personaGroups: buildPersonaGroups(
        journeys.filter((journey) => journey.type === type),
        pageContent.personas
      )
    }))

    return h.view('prototype/index', {
      pageTitle: pageContent.title,
      heading: pageContent.heading,
      intro: pageContent.intro,
      sections,
      backLinkText: pageContent.backLinkText,
      homeUrl: paths.home
    })
  }
}
