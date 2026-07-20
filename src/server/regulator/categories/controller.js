import { CATEGORY_CAVEAT } from '../../../config/battery-categories.js'
import { content } from '../../../config/content.js'
import { paths } from '../../../config/paths.js'

const readCategories = (payload) => {
  try {
    const parsed = JSON.parse(payload?.categoriesJson ?? '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const renderView = (h, request, viewModel) => {
  const pageContent = content.regulator(request).categoriesPage
  return h.view('regulator/categories/view', {
    pageTitle: pageContent.title,
    heading: pageContent.heading,
    intro: pageContent.intro,
    labels: pageContent,
    caveat: CATEGORY_CAVEAT,
    dashboardUrl: paths.regulatorDashboard,
    signInUrl: paths.regulatorSignIn,
    auditTrailUrl: paths.regulatorAuditTrail,
    ...viewModel
  })
}

export const categoriesController = {
  get: {
    handler(request, h) {
      const pageContent = content.regulator(request).categoriesPage
      return renderView(h, request, {
        saved: Boolean(request.query.saved),
        pagePayload: {
          view: 'categories',
          target: 'hydrate',
          rowCopy: {
            nameLabel: pageContent.nameLabel,
            moveUpAction: pageContent.moveUpAction,
            moveDownAction: pageContent.moveDownAction,
            removeAction: pageContent.removeAction
          },
          auditCopy: { empty: pageContent.historyEmpty }
        }
      })
    }
  },
  post: {
    handler(request, h) {
      return renderView(h, request, {
        pagePayload: {
          view: 'categories',
          target: 'persist',
          categories: readCategories(request.payload)
        }
      })
    }
  }
}
