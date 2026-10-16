import { paths } from '../../../../config/paths.js'
import { formatCurrency } from '../../../../config/nunjucks/filters/format-currency.js'
import { formatDate } from '../../../../config/nunjucks/filters/format-date.js'
import { PROTOTYPE_ABTO_SERVICE_NAME } from '../../../../config/prototype-abto-content.js'

// Account-area chrome: the masthead navigation mirrors the ABTO Figma file
// (Home, Manage account, Sign out — no "My profile").
const buildNavigation = (currentPath) => [
  {
    text: 'Home',
    href: paths.prototypeAbtoWasteReturns,
    current: currentPath === paths.prototypeAbtoWasteReturns
  },
  { text: 'Manage account', href: '#' },
  { text: 'Sign out', href: '#' }
]

export const accountPageModel = (pageContent, currentPath) => ({
  pageTitle: pageContent.title,
  heading: pageContent.heading,
  labels: pageContent,
  serviceName: PROTOTYPE_ABTO_SERVICE_NAME,
  navigation: buildNavigation(currentPath)
})

export const fill = (template, values) =>
  Object.entries(values).reduce(
    (text, [key, value]) => text.replaceAll(`{${key}}`, value),
    template
  )

// Task-flow chrome for the pay journey and the email example: service name
// only, no masthead navigation.
export const taskFlowPageModel = (pageContent) => ({
  pageTitle: pageContent.title,
  heading: pageContent.heading,
  labels: pageContent,
  serviceName: PROTOTYPE_ABTO_SERVICE_NAME,
  navigation: []
})

export const formatMoney = (pence) => formatCurrency(pence / 100)
export const longDate = (iso) => formatDate(iso, 'd MMMM yyyy')
