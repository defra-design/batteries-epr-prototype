import Boom from '@hapi/boom'

import { paths } from '../../../../config/paths.js'
import { prototypeRegulatorRegistrationsContent } from '../../../../config/prototype-regulator-registrations-content.js'
import { application } from './applicationData.js'

export const applicationContent = () =>
  prototypeRegulatorRegistrationsContent.application

export const fill = (template, values) =>
  template.replace(/\{(\w+)\}/g, (_, key) => values[key])

export const findApplication = (applicationId) => {
  if (applicationId !== application.id) {
    throw Boom.notFound('Application not found')
  }
  return application
}

export const applicationPath = (pathTemplate, params) =>
  Object.entries(params).reduce(
    (path, [key, value]) => path.replace(`{${key}}`, value),
    pathTemplate
  )

export const stepPath = (applicationId, step) =>
  applicationPath(paths.prototypeRegulatorApplicationStep, {
    applicationId,
    step
  })

export const applicationBreadcrumbs = (schemeName) => [
  { text: 'NPWD', href: paths.prototypeRegulatorHome },
  { text: applicationContent().breadcrumbSchemes, href: '#' },
  { text: schemeName }
]

export const resultTag = (resultKey) => {
  const result = applicationContent().results[resultKey]
  return { text: result.label, colour: result.colour }
}

export const formatLongDate = (isoDate) =>
  new Date(isoDate).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC'
  })

const summaryRows = (rows) =>
  rows.map(([key, value]) => ({ key: { text: key }, value: { text: value } }))

export { summaryRows }

export const outcomeBreadcrumbs = () => [
  { text: 'NPWD', href: paths.prototypeRegulatorHome },
  { text: applicationContent().breadcrumbSchemes, href: '#' }
]

// Outcome pages only make sense after the matching decision; otherwise send the
// regulator back to the checks.
export const requireDecision = (applicationId, outcome, h, getDecision) => {
  findApplication(applicationId)
  const decision = getDecision(applicationId)
  if (decision?.outcome !== outcome) {
    return {
      redirect: h.redirect(
        applicationPath(paths.prototypeRegulatorApplication, { applicationId })
      )
    }
  }
  return { decision }
}
