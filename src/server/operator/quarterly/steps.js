import joi from 'joi'

const tonneSchema = joi
  .string()
  .trim()
  .pattern(/^\d+(\.\d{1,3})?$/)
  .required()

export const STEPS = {
  tonnages: {
    contentKey: 'tonnages',
    view: 'operator/quarterly/views/tonnages',
    next: 'declaration',
    formStep: true,
    schema: joi
      .object({
        acceptedLeadAcid: tonneSchema,
        acceptedNickelCadmium: tonneSchema,
        acceptedOther: tonneSchema,
        treatedLeadAcid: tonneSchema,
        treatedNickelCadmium: tonneSchema,
        treatedOther: tonneSchema
      })
      .options({ stripUnknown: true }),
    fieldMessages: (errorContent) => ({
      acceptedLeadAcid: {
        required: errorContent.acceptedLeadAcid,
        format: errorContent.acceptedLeadAcidFormat
      },
      acceptedNickelCadmium: {
        required: errorContent.acceptedNickelCadmium,
        format: errorContent.acceptedNickelCadmiumFormat
      },
      acceptedOther: {
        required: errorContent.acceptedOther,
        format: errorContent.acceptedOtherFormat
      },
      treatedLeadAcid: {
        required: errorContent.treatedLeadAcid,
        format: errorContent.treatedLeadAcidFormat
      },
      treatedNickelCadmium: {
        required: errorContent.treatedNickelCadmium,
        format: errorContent.treatedNickelCadmiumFormat
      },
      treatedOther: {
        required: errorContent.treatedOther,
        format: errorContent.treatedOtherFormat
      }
    }),
    toPatch: (value) => ({
      accepted: {
        leadAcid: value.acceptedLeadAcid,
        nickelCadmium: value.acceptedNickelCadmium,
        other: value.acceptedOther
      },
      treated: {
        leadAcid: value.treatedLeadAcid,
        nickelCadmium: value.treatedNickelCadmium,
        other: value.treatedOther
      },
      status: 'in-progress'
    })
  },
  declaration: {
    contentKey: 'declaration',
    view: 'operator/quarterly/views/declaration',
    next: 'confirmation',
    formStep: true,
    schema: joi
      .object({ declarationAccepted: joi.string().valid('yes').required() })
      .options({ stripUnknown: true }),
    fieldMessages: (errorContent) => ({
      declarationAccepted: { required: errorContent.declarationAccepted }
    }),
    toPatch: () => ({
      status: 'submitted',
      submittedOn: new Date().toISOString()
    })
  },
  confirmation: {
    contentKey: 'confirmation',
    view: 'operator/quarterly/views/confirmation',
    next: null,
    formStep: false
  }
}

export const STEP_ORDER = ['tonnages', 'declaration', 'confirmation']

export const isKnownStep = (step) =>
  Object.prototype.hasOwnProperty.call(STEPS, step)

export const QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4']

export const isKnownQuarter = (quarter) => QUARTERS.includes(quarter)
