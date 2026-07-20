import {
  categoryFieldName,
  categoryIds,
  CATEGORY_CAVEAT
} from '../../../config/battery-categories.js'
import { content } from '../../../config/content.js'
import { paths } from '../../../config/paths.js'

const parseCategoryIds = (payload) => {
  const raw = payload?.categoryIds
  return typeof raw === 'string' && raw.length > 0
    ? raw.split(',')
    : categoryIds
}

const readTargets = (payload) => {
  const ids = parseCategoryIds(payload)
  const pick = (type) =>
    Object.fromEntries(
      ids.map((category) => [
        category,
        payload?.[categoryFieldName(type, category)] ?? ''
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
    caveat: CATEGORY_CAVEAT,
    dashboardUrl: paths.regulatorDashboard,
    signInUrl: paths.regulatorSignIn,
    auditTrailUrl: paths.regulatorAuditTrail,
    ...viewModel
  })
}

export const targetsController = {
  get: {
    handler(request, h) {
      return renderView(h, request, {
        saved: Boolean(request.query.saved),
        pagePayload: {
          view: 'targets',
          target: 'hydrate',
          auditCopy: content.regulator(request).auditTrailPage
        }
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
