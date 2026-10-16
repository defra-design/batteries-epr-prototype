import { paths } from '../../../../config/paths.js'
import {
  PROTOTYPE_REGULATOR_SERVICE_NAME,
  prototypeRegulatorRegistrationsContent
} from '../../../../config/prototype-regulator-registrations-content.js'

// Regulator screens are an authenticated account area, not a task flow, so
// every one keeps the service navigation. Only Registrations is built so far;
// the other items stay dead (href="#") until their screens exist.
const buildNavigation = (currentKey) => {
  const { navigation } = prototypeRegulatorRegistrationsContent.layout
  const hrefs = {
    registrations: paths.prototypeRegulatorRegistrations,
    pomSubmissions: '#',
    complianceSchemes: '#',
    manageAccount: '#'
  }

  return Object.entries(navigation).map(([key, text]) => ({
    key,
    text,
    href: hrefs[key],
    current: key === currentKey
  }))
}

// `layout` and `serviceName`/`serviceUrl`/`navigation` feed layouts/regulator.njk
export const basePageModel = (pageContent, { currentNav } = {}) => ({
  pageTitle: pageContent.title,
  heading: pageContent.heading,
  intro: pageContent.intro,
  labels: pageContent,
  layout: prototypeRegulatorRegistrationsContent.layout,
  serviceName: PROTOTYPE_REGULATOR_SERVICE_NAME,
  serviceUrl: paths.prototypeRegulatorHome,
  navigation: buildNavigation(currentNav),
  resetHref: paths.devReset
})
