import joi from 'joi'

import { paths } from '../../../../../config/paths.js'
import { prototypeRegulatorRegistrationsContent } from '../../../../../config/prototype-regulator-registrations-content.js'
import { basePageModel } from '../shared.js'
import {
  applicationBreadcrumbs,
  applicationPath,
  findApplication,
  fill,
  resultTag,
  stepPath
} from '../applicationShared.js'
import { addStepNote, getApplicationState, setStepChecked } from '../store.js'

const stepContent = () => prototypeRegulatorRegistrationsContent.applicationStep
const overviewPath = (applicationId) =>
  applicationPath(paths.prototypeRegulatorApplication, { applicationId })

const NOTE_MAX_LENGTH = 500

// Steps are numbered from 1; anything else is a 404 rather than a crash.
const findStep = (applicationId, stepParam) => {
  const found = findApplication(applicationId)
  const number = Number(stepParam)
  const step = Number.isInteger(number) ? found.steps[number - 1] : undefined
  if (!step) {
    return { found, number: null, step: null }
  }
  return { found, number, step }
}

const buildViewModel = (
  applicationId,
  { found, number, step },
  { errors = {}, formValues = {} } = {}
) => {
  const content = stepContent()
  const state = getApplicationState(applicationId)
  const values = {
    schemeName: found.schemeName,
    submittedOn: found.submittedOn,
    number,
    title: step.title
  }
  const heading = fill(content.stepHeading, values)

  return {
    ...basePageModel(
      { title: heading, heading, intro: fill(content.intro, values) },
      { currentNav: 'registrations' }
    ),
    breadcrumbs: applicationBreadcrumbs(found.schemeName),
    labels: content,
    headingTag: resultTag(step.result),
    details: step.details.map(([key, value]) => ({
      key: { text: key },
      value: { text: value }
    })),
    checks: step.checks.map(([title, detail, result]) => ({
      title,
      detail,
      tag: resultTag(result)
    })),
    warning: step.warning,
    notesIntro: fill(content.notesIntro, values),
    notes: state.notes[number] ?? [],
    checked: formValues.checked ?? Boolean(state.checked[number]),
    noteText: formValues.note,
    errors,
    errorSummary: Object.entries(errors).map(([field, text]) => ({
      text,
      href: `#${field}`
    })),
    action: stepPath(applicationId, number),
    backHref: overviewPath(applicationId)
  }
}

const noteSchema = (errors) =>
  joi.string().trim().max(NOTE_MAX_LENGTH).required().messages({
    'string.empty': errors.noteRequired,
    'any.required': errors.noteRequired,
    'string.max': errors.noteTooLong
  })

const view = 'prototype/regulator/registrations/applicationStep/view'

export const applicationStepController = {
  get: {
    handler(request, h) {
      const { applicationId, step: stepParam } = request.params
      const located = findStep(applicationId, stepParam)
      if (!located.step) {
        return h.response('Step not found').code(404)
      }
      return h.view(view, buildViewModel(applicationId, located))
    }
  },

  post: {
    handler(request, h) {
      const { applicationId, step: stepParam } = request.params
      const located = findStep(applicationId, stepParam)
      if (!located.step) {
        return h.response('Step not found').code(404)
      }
      const { number } = located
      const payload = request.payload ?? {}
      const checked = payload.checked === 'yes'

      if (payload.action === 'addNote') {
        const { value, error } = noteSchema(stepContent().errors).validate(
          payload.note
        )
        if (error) {
          return h.view(
            view,
            buildViewModel(applicationId, located, {
              errors: { note: error.details[0].message },
              formValues: { checked, note: payload.note }
            })
          )
        }
        addStepNote(applicationId, number, value)
        setStepChecked(applicationId, number, checked)
        return h.redirect(stepPath(applicationId, number))
      }

      setStepChecked(applicationId, number, checked)
      const isLast = number === located.found.steps.length
      return h.redirect(
        isLast
          ? overviewPath(applicationId)
          : stepPath(applicationId, number + 1)
      )
    }
  }
}
