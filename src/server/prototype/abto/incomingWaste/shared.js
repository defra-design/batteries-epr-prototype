import { PROTOTYPE_ABTO_SERVICE_NAME } from '../../../../config/prototype-abto-content.js'

// This journey is task-flow chrome throughout, including the dashboard:
// service name only, no masthead navigation, no tabs, no breadcrumbs.
export const abtoPageModel = (pageContent) => ({
  pageTitle: pageContent.title,
  heading: pageContent.heading,
  labels: pageContent,
  serviceName: PROTOTYPE_ABTO_SERVICE_NAME,
  navigation: []
})
