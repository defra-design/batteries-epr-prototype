import {
  TARGET_CAVEAT,
  categoryIds,
  targetYearFieldName
} from '../../../config/battery-categories.js'
import { content } from '../../../config/content.js'
import { getCurrentYear } from '../../../config/compliance-period.js'
import { paths } from '../../../config/paths.js'

const parseCategoryIds = (payload) => {
  const raw = payload?.categoryIds
  return typeof raw === 'string' && raw.length > 0
    ? raw.split(',')
    : categoryIds
}

const targetYearsFrom = (requestOrPayload) => {
  const raw = requestOrPayload?.targetYears
  if (typeof raw === 'string' && raw.length > 0) return raw.split(',')
  const currentYear = getCurrentYear(requestOrPayload)
  return Array.from({ length: 5 }, (_, index) => String(currentYear + index))
}

const readTargets = (payload) => {
  const ids = parseCategoryIds(payload)
  const years = targetYearsFrom(payload)
  const pick = (type) =>
    Object.fromEntries(
      ids.map((category) => [
        category,
        Object.fromEntries(
          years.map((year) => [
            year,
            payload?.[targetYearFieldName(type, category, year)] ?? ''
          ])
        )
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
    caveat: TARGET_CAVEAT,
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
          targetYears: targetYearsFrom(request),
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
          targetYears: targetYearsFrom(request.payload),
          values: readTargets(request.payload)
        }
      })
    }
  }
}
