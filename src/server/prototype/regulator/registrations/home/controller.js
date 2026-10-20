import { paths } from '../../../../../config/paths.js'
import { prototypeRegulatorRegistrationsContent } from '../../../../../config/prototype-regulator-registrations-content.js'
import { basePageModel } from '../shared.js'

// Only Registrations is built so far; every other link stays dead.
const buildTasks = (tasks) =>
  tasks.cards.map((card) => ({
    ...card,
    href:
      card.key === 'registrations' ? paths.prototypeRegulatorRegistrations : '#'
  }))

const buildQuickLinks = (quickLinks) =>
  Object.entries(quickLinks.links).map(([key, text]) => ({
    key,
    text,
    href: key === 'registrations' ? paths.prototypeRegulatorRegistrations : '#'
  }))

export const homeController = {
  handler(_request, h) {
    const pageContent = prototypeRegulatorRegistrationsContent.home

    return h.view('prototype/regulator/registrations/home/view', {
      ...basePageModel(pageContent),
      quickLinkItems: buildQuickLinks(pageContent.quickLinks),
      taskCards: buildTasks(pageContent.tasks)
    })
  }
}
