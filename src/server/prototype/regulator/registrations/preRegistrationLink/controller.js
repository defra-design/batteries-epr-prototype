import joi from 'joi'

import { paths } from '../../../../../config/paths.js'
import { prototypeRegulatorRegistrationsContent } from '../../../../../config/prototype-regulator-registrations-content.js'
import { basePageModel } from '../shared.js'
import { savePreRegistrationInvite } from '../store.js'

const pageContent = () =>
  prototypeRegulatorRegistrationsContent.preRegistrationLink

const NAME_PATTERN = /^[\p{L}][\p{L} .'’-]*$/u

const buildSchema = ({ errors }) =>
  joi
    .object({
      name: joi
        .string()
        .trim()
        .max(100)
        .pattern(NAME_PATTERN)
        .required()
        .messages({
          'string.empty': errors.nameRequired,
          'any.required': errors.nameRequired,
          'string.max': errors.nameTooLong,
          'string.pattern.base': errors.nameInvalid
        }),
      email: joi
        .string()
        .trim()
        .email({ tlds: { allow: false } })
        .required()
        .messages({
          'string.empty': errors.emailRequired,
          'any.required': errors.emailRequired,
          'string.email': errors.emailInvalid
        })
    })
    .options({ stripUnknown: true, abortEarly: false })

const buildViewModel = ({ formValues = {}, errors = {} } = {}) => {
  const content = pageContent()
  const errorSummary = Object.entries(errors).map(([field, text]) => ({
    text,
    href: `#${field}`
  }))

  return {
    ...basePageModel(content, { currentNav: 'registrations' }),
    breadcrumbs: [
      { text: 'NPWD', href: paths.prototypeRegulatorHome },
      {
        text: prototypeRegulatorRegistrationsContent.registrations.heading,
        href: paths.prototypeRegulatorRegistrations
      }
    ],
    action: paths.prototypeRegulatorPreRegistrationLink,
    errorTitle: content.errorTitle,
    errorSummary,
    errors,
    formValues
  }
}

export const preRegistrationLinkController = {
  get: {
    handler(_request, h) {
      return h.view(
        'prototype/regulator/registrations/preRegistrationLink/view',
        buildViewModel()
      )
    }
  },

  post: {
    handler(request, h) {
      const payload = request.payload ?? {}
      const { value, error } = buildSchema(pageContent()).validate(payload)

      if (error) {
        // First error per field, in field order
        const errors = {}
        for (const detail of error.details) {
          errors[detail.path[0]] ??= detail.message
        }
        return h.view(
          'prototype/regulator/registrations/preRegistrationLink/view',
          buildViewModel({
            formValues: { name: payload.name, email: payload.email },
            errors
          })
        )
      }

      savePreRegistrationInvite(value)
      return h.redirect(paths.prototypeRegulatorPreRegistrationLinkSent)
    }
  }
}
