import { paths } from '../../../../../config/paths.js'
import { basePageModel } from '../shared.js'
import {
  applicationBreadcrumbs,
  applicationContent,
  applicationPath,
  findApplication,
  fill,
  resultTag,
  stepPath
} from '../applicationShared.js'
import { getApplicationState } from '../store.js'
import {
  recordDecision,
  toErrorSummary,
  validateDecision
} from '../applicationDecision.js'

export const buildOverviewModel = (
  applicationId,
  { errors = {}, formValues = {} } = {}
) => {
  const content = applicationContent()
  const found = findApplication(applicationId)
  const state = getApplicationState(applicationId)
  const values = {
    schemeName: found.schemeName,
    submittedOn: found.submittedOn,
    total: found.steps.length
  }

  const steps = found.steps.map((step, index) => {
    const number = index + 1
    return {
      number,
      title: step.title,
      summary: step.summary,
      href: stepPath(applicationId, number),
      result: resultTag(step.result),
      checked: Boolean(state.checked[number]),
      noteCount: state.notes[number]?.length ?? 0
    }
  })
  const checkedCount = steps.filter((step) => step.checked).length

  return {
    ...basePageModel(
      {
        title: `${content.title} — ${found.schemeName}`,
        heading: `${content.headingPrefix}${found.schemeName}`,
        intro: fill(content.intro, values)
      },
      { currentNav: 'registrations' }
    ),
    breadcrumbs: applicationBreadcrumbs(found.schemeName),
    labels: content,
    steps,
    progress: fill(content.checks.progress, {
      checked: checkedCount,
      total: values.total
    }),
    allChecked: checkedCount === steps.length,
    errors,
    formValues,
    errorSummary: toErrorSummary(errors, { steps: '#application-checks' }),
    reviewHref: applicationPath(paths.prototypeRegulatorApplicationReview, {
      applicationId
    }),
    decision: {
      intro: fill(content.decision.intro, values),
      reasonHint: fill(content.decision.reasonHint, values),
      confirmLabel: fill(content.decision.confirmLabel, values),
      action: applicationPath(paths.prototypeRegulatorApplication, {
        applicationId
      })
    }
  }
}

const view = 'prototype/regulator/registrations/applicationOverview/view'

export const applicationOverviewController = {
  get: {
    handler(request, h) {
      return h.view(view, buildOverviewModel(request.params.applicationId))
    }
  },

  post: {
    handler(request, h) {
      const { applicationId } = request.params
      const model = buildOverviewModel(applicationId)
      const messages = applicationContent().decision.errors
      const total = model.steps.length

      // The confirmation only appears once every step is checked, and no
      // decision can be made before that.
      const decision = validateDecision(request.payload ?? {}, {
        errors: messages,
        confirm: model.allChecked
      })
      const errors = model.allChecked
        ? decision.errors
        : {
            steps: fill(messages.stepsUnchecked, { total }),
            ...decision.errors
          }

      if (Object.keys(errors).length > 0) {
        return h.view(
          view,
          buildOverviewModel(applicationId, {
            errors,
            formValues: decision.formValues
          })
        )
      }
      return recordDecision(applicationId, decision, h)
    }
  }
}
