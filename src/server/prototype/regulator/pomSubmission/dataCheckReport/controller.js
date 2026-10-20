import { createRequire } from 'node:module'
import Boom from '@hapi/boom'

import { paths, pathTo } from '../../../../../config/paths.js'
import { prototypeRegulatorContent } from '../../../../../config/prototype-regulator-content.js'
import {
  basePageModel,
  fill,
  flagsFor,
  latestSubmissionFor,
  SCHEMES_WITH_DETAIL_SCREENS_BUILT
} from '../shared.js'
import { getSubmissionNote, saveSubmissionNote } from '../store.js'

const seedData = createRequire(import.meta.url)(
  '../../../../../client/javascripts/storage-seed.json'
)

const view = 'prototype/regulator/pomSubmission/dataCheckReport/view'

const locate = (schemeId) => {
  if (!SCHEMES_WITH_DETAIL_SCREENS_BUILT.has(schemeId)) {
    throw Boom.notFound()
  }
  const scheme = seedData.prototypeRegulatorSchemes.find(
    (s) => s.id === schemeId
  )
  return { scheme, submission: latestSubmissionFor(schemeId) }
}

const buildViewModel = (schemeId, { note, errors = {} } = {}) => {
  const labels = prototypeRegulatorContent.dataCheckReport
  const { scheme, submission } = locate(schemeId)
  const flags = flagsFor(
    schemeId,
    submission.compliancePeriodYear,
    submission.quarter
  )

  return {
    ...basePageModel(
      {
        ...labels,
        intro: fill(labels.intro, {
          count: flags.length,
          producers: new Set(flags.map((flag) => flag.producer)).size,
          scheme: scheme.name,
          period: submission.periodLabel
        })
      },
      {
        backLink: {
          href: paths.prototypeRegulatorPomSubmissionDashboard,
          text: labels.backLink
        }
      }
    ),
    flags: flags.map((flag) => ({
      producer: flag.producer,
      description: flag.description,
      type: labels.types[flag.type]
    })),
    note:
      note ??
      getSubmissionNote(
        schemeId,
        submission.compliancePeriodYear,
        submission.quarter
      ),
    errors,
    errorSummary: Object.entries(errors).map(([field, text]) => ({
      text,
      href: `#${field}`
    })),
    action: pathTo(paths.prototypeRegulatorPomSubmissionDataCheckReport, {
      schemeId
    })
  }
}

export const dataCheckReportController = {
  get: {
    handler(request, h) {
      return h.view(view, buildViewModel(request.params.schemeId))
    }
  },

  // Saves the regulator's private notes, then moves on to the producer
  // figures. Notes never go to the scheme.
  post: {
    handler(request, h) {
      const { schemeId } = request.params
      const labels = prototypeRegulatorContent.dataCheckReport
      const { submission } = locate(schemeId)
      const note = (request.payload.notes ?? '').trim()

      if (note.length > labels.notesMax) {
        return h.view(
          view,
          buildViewModel(schemeId, {
            note: request.payload.notes,
            errors: { notes: labels.errors.notesTooLong }
          })
        )
      }

      saveSubmissionNote(
        schemeId,
        submission.compliancePeriodYear,
        submission.quarter,
        note
      )
      return h.redirect(
        pathTo(
          paths.prototypeRegulatorPomSubmissionBatterySalesDataSubmission,
          { schemeId }
        )
      )
    }
  }
}
