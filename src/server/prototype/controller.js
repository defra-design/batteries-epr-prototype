import { content } from '../../config/content.js'
import { paths } from '../../config/paths.js'

const journeyHrefs = {
  smallProducerRegistration: paths.prototypeRegistrationStart,
  smallProducerSubmission: paths.prototypeSubmissionSignIn,
  complianceSchemeQuarterlySubmission:
    paths.prototypeComplianceSchemeSubmissionSignIn
}

export const buildPersonaGroups = (journeys, personas) =>
  Object.entries(personas)
    .map(([personaId, heading]) => ({
      persona: personaId,
      heading,
      journeys: journeys.filter((journey) => journey.persona === personaId)
    }))
    .filter((group) => group.journeys.length > 0)

const countLinkedJourneys = (group) =>
  group.journeys.filter((journey) => journey.codedHref || journey.figmaHref)
    .length

export const withDefaultTabFirst = (personaGroups) => {
  if (personaGroups.length === 0) {
    return personaGroups
  }

  const defaultGroup = personaGroups.reduce((mostLinked, group) =>
    countLinkedJourneys(group) > countLinkedJourneys(mostLinked)
      ? group
      : mostLinked
  )

  return [
    defaultGroup,
    ...personaGroups.filter((group) => group !== defaultGroup)
  ]
}

export const prototypeController = {
  handler(request, h) {
    const pageContent = content.prototype(request)

    const journeys = Object.entries(pageContent.journeys).map(
      ([id, journey]) => ({
        id,
        ...journey,
        codedHref: journeyHrefs[id]
      })
    )

    const personaGroups = withDefaultTabFirst(
      buildPersonaGroups(journeys, pageContent.personas)
    )

    return h.view('prototype/index', {
      pageTitle: pageContent.title,
      heading: pageContent.heading,
      intro: pageContent.intro,
      personaGroups,
      links: pageContent.links,
      backLinkText: pageContent.backLinkText,
      homeUrl: paths.home
    })
  }
}
