import joi from 'joi'

const tonneSchema = joi
  .string()
  .trim()
  .pattern(/^\d+(\.\d{1,3})?$/)
  .required()

const dateSchema = joi
  .string()
  .trim()
  .pattern(/^\d{4}-\d{2}-\d{2}$/)
  .required()

export const STEPS = {
  scheme: {
    contentKey: 'scheme',
    view: 'operator/evidence/issue/views/scheme',
    next: 'tonnage',
    formStep: true,
    schema: joi
      .object({ schemeId: joi.string().uuid().required() })
      .options({ stripUnknown: true }),
    fieldMessages: (errorContent) => ({
      schemeId: { required: errorContent.schemeId }
    }),
    toPatch: (payload) => ({ schemeId: payload.schemeId })
  },
  tonnage: {
    contentKey: 'tonnage',
    view: 'operator/evidence/issue/views/tonnage',
    next: 'declaration',
    formStep: true,
    schema: joi
      .object({
        category: joi
          .string()
          .valid('portable', 'industrial', 'automotive')
          .required(),
        tonnes: tonneSchema,
        wasteReceivedFrom: dateSchema,
        wasteReceivedTo: dateSchema
      })
      .options({ stripUnknown: true }),
    fieldMessages: (errorContent) => ({
      category: { required: errorContent.category },
      tonnes: { required: errorContent.tonnes, format: errorContent.tonnesFormat },
      wasteReceivedFrom: {
        required: errorContent.wasteReceivedFrom,
        format: errorContent.wasteReceivedFromFormat
      },
      wasteReceivedTo: {
        required: errorContent.wasteReceivedTo,
        format: errorContent.wasteReceivedToFormat
      }
    }),
    toPatch: (payload) => ({
      category: payload.category,
      tonnes: payload.tonnes,
      wasteReceivedFrom: payload.wasteReceivedFrom,
      wasteReceivedTo: payload.wasteReceivedTo
    })
  },
  declaration: {
    contentKey: 'declaration',
    view: 'operator/evidence/issue/views/declaration',
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
    view: 'operator/evidence/issue/views/confirmation',
    next: null,
    formStep: false
  }
}

export const STEP_ORDER = ['scheme', 'tonnage', 'declaration', 'confirmation']

export const isKnownStep = (step) =>
  Object.prototype.hasOwnProperty.call(STEPS, step)
