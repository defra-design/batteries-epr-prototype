import Boom from '@hapi/boom'
import joi from 'joi'

import { paths, pathTo } from '../../../../../config/paths.js'
import { prototypeRegulatorWasteReturnsContent } from '../../../../../config/prototype-regulator-waste-returns-content.js'
import {
  basePageModel,
  findAbto,
  findScheme,
  fillTemplate,
  reviewHref,
  submissionsForSchemeAbto
} from '../shared.js'

const content = prototypeRegulatorWasteReturnsContent

// Only the sites that handed in a waste return for this scheme are listed:
// the same ABTO can have other sites that treated nobody else's batteries.
const loadSites = ({ schemeId, abtoId }) => {
  const scheme = findScheme(schemeId)
  const abto = findAbto(abtoId)
  const submissions = submissionsForSchemeAbto(schemeId, abtoId)

  if (!scheme || !abto || submissions.length === 0) {
    throw Boom.notFound()
  }

  const sites = submissions.map((submission) => ({
    ...abto.sites.find((site) => site.id === submission.siteId),
    submission
  }))

  return { scheme, abto, sites }
}

const buildViewModel = (
  request,
  { errorSummary = [], errors = {}, formValues = {} } = {}
) => {
  const { schemeId, abtoId } = request.params
  const pageContent = content.abtoSites
  const { scheme, abto, sites } = loadSites(request.params)

  return {
    ...basePageModel(pageContent, paths.prototypeRegulatorWasteReturnsHome),
    backLink: pathTo(paths.prototypeRegulatorWasteReturnsSchemeAbtos, {
      schemeId
    }),
    action: pathTo(paths.prototypeRegulatorWasteReturnsAbtoSites, {
      schemeId,
      abtoId
    }),
    intro: fillTemplate(pageContent.introTemplate, {
      abto: abto.name,
      count: sites.length,
      scheme: scheme.name
    }),
    siteItems: sites.map((site) => ({
      value: site.id,
      text: `${abto.name}, ${site.name} – ${site.approvalNumber}`,
      hint: content.statusLabels[site.submission.status],
      checked: formValues.site === site.id,
      attributes: { 'data-testid': `abto-sites-site-${site.id}` }
    })),
    errorTitle: pageContent.error.title,
    errorSummary,
    errors,
    formValues
  }
}

export const abtoSitesController = {
  get: {
    handler(request, h) {
      const { schemeId, abtoId } = request.params
      const { sites } = loadSites(request.params)

      // Nothing to choose between: go straight to the only site's return.
      if (sites.length === 1) {
        return h.redirect(reviewHref({ schemeId, abtoId, siteId: sites[0].id }))
      }

      return h.view(
        'prototype/regulator/wasteReturns/abtoSites/view',
        buildViewModel(request)
      )
    }
  },

  post: {
    options: {
      validate: {
        payload: joi
          .object({ site: joi.string().required() })
          .options({ stripUnknown: true }),
        failAction: (request, h) => {
          const message = content.abtoSites.error.site
          return h
            .view(
              'prototype/regulator/wasteReturns/abtoSites/view',
              buildViewModel(request, {
                errorSummary: [{ text: message, href: '#site' }],
                errors: { site: message }
              })
            )
            .takeover()
        }
      }
    },
    handler(request, h) {
      const { schemeId, abtoId } = request.params
      const { sites } = loadSites(request.params)
      const chosen = sites.find((site) => site.id === request.payload.site)

      if (!chosen) {
        throw Boom.badRequest()
      }

      return h.redirect(reviewHref({ schemeId, abtoId, siteId: chosen.id }))
    }
  }
}
