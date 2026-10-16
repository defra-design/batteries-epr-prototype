import joi from 'joi'

import { CATEGORIES } from '../data.js'
import { paths, pathTo } from '../../../../../config/paths.js'
import { prototypeRegulatorWasteReturnsContent } from '../../../../../config/prototype-regulator-waste-returns-content.js'
import {
  basePageModel,
  categoryLabels,
  fillTemplate,
  formatLongDateTime,
  joinWithAnd,
  loadReturn,
  returnParams,
  reviewHref,
  siteLabel
} from '../shared.js'
import { updateSubmission } from '../store.js'

const content = prototypeRegulatorWasteReturnsContent
const CATEGORY_IDS = CATEGORIES.map(({ id }) => id)

const asArray = (value) =>
  value === undefined ? [] : [value].flat().filter(Boolean)

const detailsHref = (params, categoryIds) => {
  const query = new URLSearchParams(
    categoryIds.map((id) => ['categories', id])
  ).toString()
  return `${pathTo(paths.prototypeRegulatorWasteReturnsQueryDetails, returnParams(params))}?${query}`
}

// Reads the categories picked on the previous screen from the query string.
const selectedCategories = (request) =>
  asArray(request.query.categories).filter((id) => CATEGORY_IDS.includes(id))

// A query can only be raised on a return that is still awaiting review.
const redirectIfNotQueryable = (request, h, submission) =>
  submission.status === 'awaitingReview'
    ? null
    : h.redirect(reviewHref(request.params))

const categoriesViewModel = (
  request,
  { errorSummary = [], errors = {}, formValues = {} } = {}
) => {
  const { abto, site, submission } = loadReturn(request.params)
  const pageContent = content.queryCategories
  const checked = asArray(formValues.categories)

  return {
    ...basePageModel(pageContent, paths.prototypeRegulatorWasteReturnsHome),
    backLink: reviewHref(request.params),
    cancelHref: reviewHref(request.params),
    action: pathTo(
      paths.prototypeRegulatorWasteReturnsQueryCategories,
      returnParams(request.params)
    ),
    siteHeading: `${abto.name}, ${site.name} – ${site.approvalNumber}`,
    categoryItems: CATEGORIES.map(({ id, label }) => ({
      value: id,
      text: label,
      checked: checked.includes(id),
      attributes: { 'data-testid': `query-category-${id}` },
      // A category with nothing submitted cannot be queried
      disabled: !submission.intake
    })),
    errorTitle: pageContent.error.title,
    errorSummary,
    errors
  }
}

export const queryCategoriesController = {
  get: {
    handler(request, h) {
      const { submission } = loadReturn(request.params)
      const redirect = redirectIfNotQueryable(request, h, submission)

      return (
        redirect ??
        h.view(
          'prototype/regulator/wasteReturns/query/categories',
          categoriesViewModel(request, {
            formValues: { categories: selectedCategories(request) }
          })
        )
      )
    }
  },

  post: {
    options: {
      validate: {
        payload: joi
          .object({
            categories: joi
              .array()
              .items(joi.string().valid(...CATEGORY_IDS))
              .single()
              .min(1)
              .required()
          })
          .options({ stripUnknown: true }),
        failAction: (request, h) => {
          const message = content.queryCategories.error.categories
          return h
            .view(
              'prototype/regulator/wasteReturns/query/categories',
              categoriesViewModel(request, {
                errorSummary: [{ text: message, href: '#categories' }],
                errors: { categories: message }
              })
            )
            .takeover()
        }
      }
    },
    handler(request, h) {
      const { submission } = loadReturn(request.params)
      const redirect = redirectIfNotQueryable(request, h, submission)

      return (
        redirect ??
        h.redirect(detailsHref(request.params, request.payload.categories))
      )
    }
  }
}

const detailsViewModel = (
  request,
  categoryIds,
  { errorSummary = [], errors = {}, formValues = {} } = {}
) => {
  const { abto, site } = loadReturn(request.params)
  const pageContent = content.queryDetails
  const label = siteLabel(abto, site)
  const checkedContacts = asArray(formValues.contacts)

  return {
    ...basePageModel(pageContent, paths.prototypeRegulatorWasteReturnsHome),
    backLink: `${pathTo(paths.prototypeRegulatorWasteReturnsQueryCategories, returnParams(request.params))}?${new URLSearchParams(categoryIds.map((id) => ['categories', id]))}`,
    cancelHref: reviewHref(request.params),
    action: detailsHref(request.params, categoryIds),
    siteHeading: `${abto.name}, ${site.name} – ${site.approvalNumber}`,
    categoriesLine: joinWithAnd(categoryLabels(categoryIds)),
    contactItems: abto.contacts.map((contact) => ({
      value: contact.id,
      text: `${contact.name} – ${contact.role}, ${label}`,
      checked: checkedContacts.includes(contact.id),
      attributes: { 'data-testid': `query-contact-${contact.id}` }
    })),
    reason: formValues.reason ?? '',
    errorTitle: pageContent.error.title,
    errorSummary,
    errors
  }
}

export const queryDetailsController = {
  get: {
    handler(request, h) {
      const { submission } = loadReturn(request.params)
      const redirect = redirectIfNotQueryable(request, h, submission)
      if (redirect) {
        return redirect
      }

      const categoryIds = selectedCategories(request)
      if (categoryIds.length === 0) {
        return h.redirect(
          pathTo(
            paths.prototypeRegulatorWasteReturnsQueryCategories,
            returnParams(request.params)
          )
        )
      }

      return h.view(
        'prototype/regulator/wasteReturns/query/details',
        detailsViewModel(request, categoryIds)
      )
    }
  },

  post: {
    options: {
      validate: {
        payload: joi
          .object({
            contacts: joi
              .array()
              .items(joi.string())
              .single()
              .min(1)
              .required(),
            reason: joi.string().trim().min(1).required()
          })
          .options({ abortEarly: false, stripUnknown: true }),
        failAction: (request, h) => {
          const messages = content.queryDetails.error
          const payload = request.payload ?? {}
          const errors = {}
          if (asArray(payload.contacts).length === 0) {
            errors.contacts = messages.recipients
          }
          if (!payload.reason?.trim()) {
            errors.reason = messages.reason
          }
          const fieldIds = { contacts: '#contacts', reason: '#reason' }

          return h
            .view(
              'prototype/regulator/wasteReturns/query/details',
              detailsViewModel(request, selectedCategories(request), {
                errorSummary: Object.entries(errors).map(([field, text]) => ({
                  text,
                  href: fieldIds[field]
                })),
                errors,
                formValues: payload
              })
            )
            .takeover()
        }
      }
    },
    handler(request, h) {
      const { abto, submission } = loadReturn(request.params)
      const redirect = redirectIfNotQueryable(request, h, submission)
      if (redirect) {
        return redirect
      }

      const categoryIds = selectedCategories(request)
      const contactIds = request.payload.contacts.filter((id) =>
        abto.contacts.some((contact) => contact.id === id)
      )
      if (categoryIds.length === 0 || contactIds.length === 0) {
        return h.redirect(
          pathTo(
            paths.prototypeRegulatorWasteReturnsQueryCategories,
            returnParams(request.params)
          )
        )
      }

      const sentAt = new Date().toISOString()
      updateSubmission(submission.id, {
        status: 'querySent',
        query: {
          categoryIds,
          contactIds,
          reason: request.payload.reason,
          sentAt
        },
        timeline: [
          ...submission.timeline,
          { at: sentAt, text: 'Query sent to ABTO by EA caseworker' }
        ]
      })

      return h.redirect(
        pathTo(
          paths.prototypeRegulatorWasteReturnsQuerySent,
          returnParams(request.params)
        )
      )
    }
  }
}

export const querySentController = {
  handler(request, h) {
    const { abto, site, submission } = loadReturn(request.params)

    if (submission.status !== 'querySent' || !submission.query) {
      return h.redirect(reviewHref(request.params))
    }

    const pageContent = content.querySent
    const { query } = submission
    const categories = joinWithAnd(categoryLabels(query.categoryIds))

    return h.view('prototype/regulator/wasteReturns/query/sent', {
      ...basePageModel(pageContent, paths.prototypeRegulatorWasteReturnsHome),
      bannerBody: fillTemplate(pageContent.bannerBodyTemplate, {
        site: site.name,
        approval: site.approvalNumber,
        abto: abto.name
      }),
      summaryRows: [
        {
          label: pageContent.labels.siteAndCategories,
          text: `${site.approvalNumber} – ${categories}`
        },
        {
          label: pageContent.labels.routedTo,
          text: fillTemplate(pageContent.routedToTemplate, { abto: abto.name })
        },
        { label: pageContent.labels.reason, text: query.reason },
        { label: pageContent.labels.status, text: pageContent.statusValue },
        {
          label: pageContent.labels.sent,
          text: formatLongDateTime(query.sentAt)
        }
      ],
      nextBody: fillTemplate(pageContent.nextBodyTemplate, {
        abto: abto.name,
        site: site.name,
        approval: site.approvalNumber,
        categories: categories.replace('Lead-acid', 'lead-acid')
      }),
      backToReturnLabel: fillTemplate(pageContent.backToReturnTemplate, {
        abto: abto.name
      }),
      backToReturnHref: reviewHref(request.params),
      wasteReturnsHref: paths.prototypeRegulatorWasteReturnsHome
    })
  }
}
