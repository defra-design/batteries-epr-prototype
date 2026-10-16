import { paths } from '../../../../../config/paths.js'
import { prototypeRegulatorRegistrationsContent } from '../../../../../config/prototype-regulator-registrations-content.js'
import { basePageModel } from '../shared.js'
import { MEMBER_LIST_SCHEME_ID, getDashboardCases } from '../store.js'
import { APPLICATION_ID } from '../applicationData.js'
import { applicationPath } from '../applicationShared.js'

const TASK_CARD_HREFS = {
  'scheme-member-lists': applicationPath(paths.prototypeRegulatorScheme, {
    schemeId: MEMBER_LIST_SCHEME_ID
  }),
  'applications-for-approval': applicationPath(
    paths.prototypeRegulatorApplication,
    { applicationId: APPLICATION_ID }
  )
}

const QUICK_LINK_HREFS = {
  preRegistrationLink: paths.prototypeRegulatorPreRegistrationLink
}

const buildYears = ({ first, last }, selectedYear) =>
  Array.from({ length: last - first + 1 }, (_, i) => last - i).map((year) => ({
    value: String(year),
    text: String(year),
    selected: String(year) === String(selectedYear)
  }))

const buildCases = (pageContent) =>
  getDashboardCases().map((registrationCase) => {
    const status = pageContent.cases.statuses[registrationCase.status]
    return {
      ...registrationCase,
      statusKey: registrationCase.status,
      statusLabel: status.label,
      statusColour: status.colour
    }
  })

// "All" first, then one tab per status that has cases, in column order.
const buildTabs = (pageContent, cases) => [
  { key: 'all', label: pageContent.cases.allTab, cases },
  ...Object.entries(pageContent.cases.statuses)
    .map(([key, status]) => ({
      key,
      label: status.label,
      cases: cases.filter(
        (registrationCase) => registrationCase.statusKey === key
      )
    }))
    .filter((tab) => tab.cases.length > 0)
]

export const dashboardController = {
  handler(request, h) {
    const pageContent = prototypeRegulatorRegistrationsContent.registrations
    const cases = buildCases(pageContent)

    return h.view('prototype/regulator/registrations/dashboard/view', {
      ...basePageModel(pageContent, { currentNav: 'registrations' }),
      breadcrumbs: [
        { text: 'NPWD', href: paths.prototypeRegulatorHome },
        { text: pageContent.heading }
      ],
      quickLinkItems: Object.entries(pageContent.quickLinks.links).map(
        ([key, text]) => ({ key, text, href: QUICK_LINK_HREFS[key] ?? '#' })
      ),
      years: buildYears(
        pageContent.year,
        request.query.year ?? pageContent.year.last
      ),
      action: paths.prototypeRegulatorRegistrations,
      taskCards: pageContent.tasks.cards.map((card) => ({
        ...card,
        href: TASK_CARD_HREFS[card.key] ?? '#'
      })),
      tabs: buildTabs(pageContent, cases)
    })
  }
}
