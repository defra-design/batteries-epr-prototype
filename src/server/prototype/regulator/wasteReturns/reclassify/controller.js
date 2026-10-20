import joi from 'joi'
import { format } from 'date-fns'

import { SMALL_OPERATOR_THRESHOLD_TONNES } from '../data.js'
import { paths, pathTo } from '../../../../../config/paths.js'
import { prototypeRegulatorWasteReturnsContent } from '../../../../../config/prototype-regulator-waste-returns-content.js'
import {
  abtoFacts,
  basePageModel,
  fillTemplate,
  formatTonnes,
  isOverThreshold,
  loadAbto
} from '../shared.js'
import { updateAbto } from '../store.js'

const content = prototypeRegulatorWasteReturnsContent
const accountContent = content.abtoAccount

const accountHref = (abto) =>
  pathTo(paths.prototypeRegulatorWasteReturnsAbtoAccount, { abtoId: abto.id })

const factsFor = (abto) => abtoFacts(abto, accountContent.factsLabels)

// Reclassifying only makes sense for a small ABTO over the threshold.
const redirectIfNotReclassifiable = (h, abto) =>
  isOverThreshold(abto) ? null : h.redirect(accountHref(abto))

const classificationViewModel = (
  request,
  abto,
  { errorSummary = [], errors = {}, formValues = {} } = {}
) => {
  const pageContent = content.classification
  const over = abto.bensIssuedThisYear - SMALL_OPERATOR_THRESHOLD_TONNES

  return {
    ...basePageModel(
      { ...pageContent, heading: abto.name },
      paths.prototypeRegulatorWasteReturnsHome
    ),
    backLink: accountHref(abto),
    action: pathTo(paths.prototypeRegulatorWasteReturnsClassification, {
      abtoId: abto.id
    }),
    facts: factsFor(abto),
    bensLine: fillTemplate(pageContent.bensLineTemplate, {
      tonnes: formatTonnes(abto.bensIssuedThisYear)
    }),
    overLine: fillTemplate(pageContent.overLineTemplate, {
      tonnes: formatTonnes(over)
    }),
    optionItems: [
      {
        value: 'reclassify',
        text: pageContent.options.reclassify,
        checked: formValues.decision === 'reclassify',
        attributes: { 'data-testid': 'classification-reclassify' }
      },
      {
        value: 'keep',
        text: pageContent.options.keep,
        checked: formValues.decision === 'keep',
        attributes: { 'data-testid': 'classification-keep' }
      }
    ],
    errorTitle: pageContent.error.title,
    errorSummary,
    errors
  }
}

export const classificationController = {
  get: {
    handler(request, h) {
      const abto = loadAbto(request.params)

      return (
        redirectIfNotReclassifiable(h, abto) ??
        h.view(
          'prototype/regulator/wasteReturns/reclassify/classification',
          classificationViewModel(request, abto)
        )
      )
    }
  },

  post: {
    options: {
      validate: {
        payload: joi
          .object({
            decision: joi.string().valid('reclassify', 'keep').required()
          })
          .options({ stripUnknown: true }),
        failAction: (request, h) => {
          const abto = loadAbto(request.params)
          const message = content.classification.error.decision

          return h
            .view(
              'prototype/regulator/wasteReturns/reclassify/classification',
              classificationViewModel(request, abto, {
                errorSummary: [{ text: message, href: '#decision' }],
                errors: { decision: message }
              })
            )
            .takeover()
        }
      }
    },
    handler(request, h) {
      const abto = loadAbto(request.params)
      const redirect = redirectIfNotReclassifiable(h, abto)
      if (redirect) {
        return redirect
      }

      // Keeping the classification changes nothing: back to the queue.
      return h.redirect(
        request.payload.decision === 'reclassify'
          ? pathTo(paths.prototypeRegulatorWasteReturnsClassificationConfirm, {
              abtoId: abto.id
            })
          : paths.prototypeRegulatorWasteReturnsFlags
      )
    }
  }
}

const confirmViewModel = (
  request,
  abto,
  { errorSummary = [], errors = {}, formValues = {} } = {}
) => {
  const pageContent = content.classificationConfirm
  const classifications = accountContent.classifications

  return {
    ...basePageModel(
      {
        ...pageContent,
        title: fillTemplate(pageContent.titleTemplate, { abto: abto.name }),
        heading: fillTemplate(pageContent.titleTemplate, { abto: abto.name })
      },
      paths.prototypeRegulatorWasteReturnsHome
    ),
    backLink: pathTo(paths.prototypeRegulatorWasteReturnsClassification, {
      abtoId: abto.id
    }),
    cancelHref: accountHref(abto),
    action: pathTo(paths.prototypeRegulatorWasteReturnsClassificationConfirm, {
      abtoId: abto.id
    }),
    facts: factsFor(abto),
    summaryRows: [
      { label: pageContent.labels.operator, text: abto.name },
      {
        label: pageContent.labels.approvalNumber,
        text: abto.sites[0].approvalNumber
      },
      {
        label: pageContent.labels.currentClassification,
        text: classifications[abto.classification]
      },
      {
        label: pageContent.labels.newClassification,
        text: classifications.large
      },
      {
        label: pageContent.labels.effectiveFrom,
        text: pageContent.effectiveFrom
      }
    ],
    fee: formValues.fee ?? '',
    errorTitle: pageContent.error.title,
    errorSummary,
    errors
  }
}

export const classificationConfirmController = {
  get: {
    handler(request, h) {
      const abto = loadAbto(request.params)

      return (
        redirectIfNotReclassifiable(h, abto) ??
        h.view(
          'prototype/regulator/wasteReturns/reclassify/confirm',
          confirmViewModel(request, abto)
        )
      )
    }
  },

  post: {
    options: {
      validate: {
        payload: joi
          .object({ fee: joi.string().trim().min(1).required() })
          .options({ stripUnknown: true }),
        failAction: (request, h) => {
          const abto = loadAbto(request.params)
          const message = content.classificationConfirm.error.fee

          return h
            .view(
              'prototype/regulator/wasteReturns/reclassify/confirm',
              confirmViewModel(request, abto, {
                errorSummary: [{ text: message, href: '#fee' }],
                errors: { fee: message },
                formValues: request.payload ?? {}
              })
            )
            .takeover()
        }
      }
    },
    handler(request, h) {
      const abto = loadAbto(request.params)
      const redirect = redirectIfNotReclassifiable(h, abto)
      if (redirect) {
        return redirect
      }

      updateAbto(abto.id, {
        classification: 'large',
        reclassification: {
          feeNote: request.payload.fee,
          at: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss")
        }
      })

      return h.redirect(
        pathTo(paths.prototypeRegulatorWasteReturnsReclassified, {
          abtoId: abto.id
        })
      )
    }
  }
}

export const reclassifiedController = {
  handler(request, h) {
    const abto = loadAbto(request.params)

    if (!abto.reclassification) {
      return h.redirect(accountHref(abto))
    }

    const pageContent = content.reclassified
    const title = fillTemplate(pageContent.titleTemplate, { abto: abto.name })
    const { feeNote, at } = abto.reclassification

    return h.view('prototype/regulator/wasteReturns/reclassify/done', {
      ...basePageModel(
        { ...pageContent, title, heading: title },
        paths.prototypeRegulatorWasteReturnsHome
      ),
      facts: factsFor(abto),
      bannerBody: fillTemplate(pageContent.bannerBodyTemplate, {
        abto: abto.name
      }),
      summaryRows: [
        {
          label: pageContent.labels.newClassification,
          text: accountContent.classifications.large
        },
        {
          label: pageContent.labels.effectiveFrom,
          text: content.classificationConfirm.effectiveFrom
        },
        { label: pageContent.labels.feeReference, text: feeNote },
        { label: pageContent.labels.updatedBy, text: pageContent.updatedBy },
        {
          label: pageContent.labels.updated,
          text: format(new Date(at), 'd MMM yyyy, HH:mm')
        }
      ],
      nextBody: fillTemplate(pageContent.nextBodyTemplate, { abto: abto.name }),
      flagsHref: paths.prototypeRegulatorWasteReturnsFlags,
      accountHref: accountHref(abto),
      viewAccountLabel: fillTemplate(pageContent.viewAccountTemplate, {
        abto: abto.name
      })
    })
  }
}
