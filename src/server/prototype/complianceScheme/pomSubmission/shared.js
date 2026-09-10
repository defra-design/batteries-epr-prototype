import { paths } from '../../../../config/paths.js'
import { PROTOTYPE_COMPLIANCE_SCHEME_SERVICE_NAME } from '../../../../config/prototype-compliance-scheme-content.js'

export const TABS_LABEL = 'My scheme sections'

const TABS = [
  {
    id: 'myScheme',
    text: 'My scheme',
    href: paths.prototypeComplianceSchemeSubmissionDashboard
  },
  {
    id: 'members',
    text: 'Members',
    href: paths.prototypeComplianceSchemeSubmissionMembers
  },
  {
    id: 'submissions',
    text: 'Submissions',
    href: paths.prototypeComplianceSchemeSubmissionSubmissions
  }
]

const buildNavigation = (currentPath) => [
  {
    text: 'Home',
    href: paths.prototypeComplianceSchemeSubmissionDashboard,
    current: currentPath === paths.prototypeComplianceSchemeSubmissionDashboard
  },
  { text: 'Manage account', href: '#' },
  { text: 'My profile', href: '#' },
  { text: 'Sign out', href: '#' }
]

const buildTabs = (currentPath) =>
  TABS.map((tab) => ({ ...tab, current: tab.href === currentPath }))

export const basePageModel = (pageContent, currentPath) => ({
  pageTitle: pageContent.title,
  heading: pageContent.heading,
  labels: pageContent,
  serviceName: PROTOTYPE_COMPLIANCE_SCHEME_SERVICE_NAME,
  navigation: buildNavigation(currentPath),
  tabsLabel: TABS_LABEL,
  tabs: buildTabs(currentPath)
})

// Task-flow screens (the PoM submission wizard itself, from "before you
// start" onward) are not part of the account area: header, phase banner
// and back link only — no masthead navigation, no tabs.
export const taskFlowPageModel = (pageContent) => ({
  pageTitle: pageContent.title,
  heading: pageContent.heading,
  labels: pageContent,
  serviceName: PROTOTYPE_COMPLIANCE_SCHEME_SERVICE_NAME,
  navigation: []
})
