import { paths } from '../../../config/paths.js'
import {
  REGULATOR_SERVICE_NAME,
  regulatorLayoutContent
} from '../../../config/prototype-regulator-layout-content.js'

// Regulator screens are an authenticated account area, not a task flow, so
// every one keeps the service navigation. Registrations and PoM submissions
// are built; the other items stay dead (href="#") until their screens exist.
const NAVIGATION_HREFS = {
  registrations: paths.prototypeRegulatorRegistrations,
  pomSubmissions: paths.prototypeRegulatorPomSubmissionDashboard,
  complianceSchemes: '#',
  reports: '#',
  manageAccount: '#'
}

const buildNavigation = (currentNav) =>
  Object.entries(regulatorLayoutContent.navigation).map(([key, text]) => ({
    key,
    text,
    href: NAVIGATION_HREFS[key],
    current: key === currentNav
  }))

// Everything layouts/regulator.njk needs: the Defra header and service nav,
// then the hero band (optional back link and breadcrumbs, the H1 with an
// optional tag, and an intro). Pass `backLink: { href, text }` for a back
// link, `breadcrumbs` for a trail, and `headingTag: { text, colour }`.
export const regulatorPageModel = (
  pageContent,
  { currentNav, backLink, breadcrumbs, headingTag } = {}
) => ({
  pageTitle: pageContent.title,
  heading: pageContent.heading,
  intro: pageContent.intro,
  labels: pageContent,
  layout: regulatorLayoutContent,
  serviceName: REGULATOR_SERVICE_NAME,
  serviceUrl: paths.prototypeRegulatorHome,
  navigation: buildNavigation(currentNav),
  resetHref: paths.devReset,
  backLink,
  breadcrumbs,
  headingTag
})
