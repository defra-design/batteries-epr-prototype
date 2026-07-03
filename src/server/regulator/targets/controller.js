import { content } from '../../../config/content.js'
import { paths } from '../../../config/paths.js'

const CATEGORIES = ['portable', 'industrial', 'automotive']

const fieldName = (type, category) =>
  `${type}${category[0].toUpperCase()}${category.slice(1)}`

const readTargets = (payload) => {
  const pick = (type) =>
    Object.fromEntries(
      CATEGORIES.map((category) => [
        category,
        payload?.[fieldName(type, category)] ?? ''
      ])
    )
  return { collection: pick('collection'), recycling: pick('recycling') }
}

const renderView = (h, request, viewModel) => {
  const pageContent = content.regulator(request).targetsPage
  return h.view('regulator/targets/view', {
    pageTitle: pageContent.title,
    heading: pageContent.heading,
    intro: pageContent.intro,
    labels: pageContent,
    categories: CATEGORIES,
    dashboardUrl: paths.regulatorDashboard,
    signInUrl: paths.regulatorSignIn,
    ...viewModel
  })
}

export const targetsController = {
  get: {
    handler(request, h) {
      return renderView(h, request, {
        pagePayload: { view: 'targets', target: 'hydrate' }
      })
    }
  },
  post: {
    handler(request, h) {
      return renderView(h, request, {
        pagePayload: {
          view: 'targets',
          target: 'persist',
          values: readTargets(request.payload)
        }
      })
    }
  }
}
