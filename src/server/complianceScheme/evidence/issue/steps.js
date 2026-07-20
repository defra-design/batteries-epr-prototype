import joi from 'joi'

import { categoryIds } from '../../../../config/battery-categories.js'

export const parseCategoryIds = (payload) => {
  const raw = payload?.categoryIds
  return typeof raw === 'string' && raw.length > 0
    ? raw.split(',')
    : categoryIds
}

const tonneSchema = joi
  .string()
  .trim()
  .pattern(/^\d+(\.\d{1,3})?$/)
  .required()

export const STEPS = {
  recipient: {
    contentKey: 'recipient',
    view: 'complianceScheme/evidence/issue/views/recipient',
    next: 'tonnes',
    formStep: true,
    schema: joi
      .object({ recipientBprn: joi.string().trim().min(1).required() })
      .options({ stripUnknown: true }),
    fieldMessages: (errorContent) => ({
      recipientBprn: { required: errorContent.recipientBprn }
    }),
    toPatch: (payload) => ({ recipientBprn: payload.recipientBprn })
  },
  tonnes: {
    contentKey: 'tonnes',
    view: 'complianceScheme/evidence/issue/views/tonnes',
    next: 'declaration',
    formStep: true,
    buildSchema: (ids) =>
      joi
        .object({
          categoryIds: joi.any().optional(),
          category: joi
            .string()
            .valid(...ids)
            .required(),
          tonnes: tonneSchema
        })
        .options({ stripUnknown: true }),
    fieldMessages: (errorContent) => ({
      category: { required: errorContent.category },
      tonnes: {
        required: errorContent.tonnes,
        format: errorContent.tonnesFormat
      }
    }),
    toPatch: (payload) => ({
      category: payload.category,
      tonnes: payload.tonnes
    })
  },
  declaration: {
    contentKey: 'declaration',
    view: 'complianceScheme/evidence/issue/views/declaration',
    next: 'confirmation',
    formStep: true,
    schema: joi
      .object({ declarationAccepted: joi.string().valid('yes').required() })
      .options({ stripUnknown: true }),
    fieldMessages: (errorContent) => ({
      declarationAccepted: { required: errorContent.declarationAccepted }
    }),
    toPatch: () => ({ commit: true })
  },
  confirmation: {
    contentKey: 'confirmation',
    view: 'complianceScheme/evidence/issue/views/confirmation',
    next: null,
    formStep: false
  }
}

export const STEP_ORDER = ['recipient', 'tonnes', 'declaration', 'confirmation']

export const isKnownStep = (step) =>
  Object.prototype.hasOwnProperty.call(STEPS, step)
