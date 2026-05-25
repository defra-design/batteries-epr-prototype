import joi from 'joi'

const tonnageField = joi
  .string()
  .trim()
  .pattern(/^\d+(\.\d{1,3})?$/)
  .required()

export const STEPS = {
  tonnages: {
    contentKey: 'tonnages',
    view: 'operator/annualReturn/views/tonnages',
    next: 'declaration',
    schema: joi
      .object({
        industrialAcceptedLeadAcid: tonnageField,
        industrialAcceptedNickelCadmium: tonnageField,
        industrialAcceptedOther: tonnageField,
        industrialTreatedLeadAcid: tonnageField,
        industrialTreatedNickelCadmium: tonnageField,
        industrialTreatedOther: tonnageField,
        automotiveAcceptedLeadAcid: tonnageField,
        automotiveAcceptedNickelCadmium: tonnageField,
        automotiveAcceptedOther: tonnageField,
        automotiveTreatedLeadAcid: tonnageField,
        automotiveTreatedNickelCadmium: tonnageField,
        automotiveTreatedOther: tonnageField
      })
      .options({ stripUnknown: true }),
    fieldMessages: (errorContent) => ({
      industrialAcceptedLeadAcid: errorContent.industrialAcceptedLeadAcid,
      industrialAcceptedNickelCadmium:
        errorContent.industrialAcceptedNickelCadmium,
      industrialAcceptedOther: errorContent.industrialAcceptedOther,
      industrialTreatedLeadAcid: errorContent.industrialTreatedLeadAcid,
      industrialTreatedNickelCadmium:
        errorContent.industrialTreatedNickelCadmium,
      industrialTreatedOther: errorContent.industrialTreatedOther,
      automotiveAcceptedLeadAcid: errorContent.automotiveAcceptedLeadAcid,
      automotiveAcceptedNickelCadmium:
        errorContent.automotiveAcceptedNickelCadmium,
      automotiveAcceptedOther: errorContent.automotiveAcceptedOther,
      automotiveTreatedLeadAcid: errorContent.automotiveTreatedLeadAcid,
      automotiveTreatedNickelCadmium:
        errorContent.automotiveTreatedNickelCadmium,
      automotiveTreatedOther: errorContent.automotiveTreatedOther
    }),
    toPatch: (payload) => ({
      industrial: {
        accepted: {
          leadAcid: payload.industrialAcceptedLeadAcid,
          nickelCadmium: payload.industrialAcceptedNickelCadmium,
          other: payload.industrialAcceptedOther
        },
        treated: {
          leadAcid: payload.industrialTreatedLeadAcid,
          nickelCadmium: payload.industrialTreatedNickelCadmium,
          other: payload.industrialTreatedOther
        }
      },
      automotive: {
        accepted: {
          leadAcid: payload.automotiveAcceptedLeadAcid,
          nickelCadmium: payload.automotiveAcceptedNickelCadmium,
          other: payload.automotiveAcceptedOther
        },
        treated: {
          leadAcid: payload.automotiveTreatedLeadAcid,
          nickelCadmium: payload.automotiveTreatedNickelCadmium,
          other: payload.automotiveTreatedOther
        }
      },
      status: 'in-progress'
    })
  },
  declaration: {
    contentKey: 'declaration',
    view: 'operator/annualReturn/views/declaration',
    next: 'confirmation',
    schema: joi
      .object({
        declarationAccepted: joi.string().valid('yes').required()
      })
      .options({ stripUnknown: true }),
    fieldMessages: (errorContent) => ({
      declarationAccepted: errorContent.declarationAccepted
    }),
    toPatch: () => ({
      status: 'submitted',
      submittedOn: new Date().toISOString()
    })
  },
  confirmation: {
    contentKey: 'confirmation',
    view: 'operator/annualReturn/views/confirmation',
    next: null,
    schema: null,
    fieldMessages: () => ({}),
    toPatch: () => ({})
  }
}

export const STEP_ORDER = ['tonnages', 'declaration', 'confirmation']

export const isKnownStep = (step) =>
  Object.prototype.hasOwnProperty.call(STEPS, step)
