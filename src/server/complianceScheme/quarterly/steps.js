import joi from 'joi'

const tonneSchema = joi
  .string()
  .trim()
  .pattern(/^\d+(\.\d{1,3})?$/)
  .required()

const tonneTriple = joi
  .object({
    portable: tonneSchema,
    industrial: tonneSchema,
    automotive: tonneSchema
  })
  .options({ stripUnknown: true })

const tripleMessages = (errorContent) => ({
  portable: {
    required: errorContent.portable,
    format: errorContent.portableFormat
  },
  industrial: {
    required: errorContent.industrial,
    format: errorContent.industrialFormat
  },
  automotive: {
    required: errorContent.automotive,
    format: errorContent.automotiveFormat
  }
})

const triple = (payload) => ({
  portable: payload.portable,
  industrial: payload.industrial,
  automotive: payload.automotive
})

export const STEPS = {
  'member-list': {
    contentKey: 'memberList',
    view: 'complianceScheme/quarterly/views/member-list',
    next: 'check-answers',
    formStep: false
  },
  'check-answers': {
    contentKey: 'checkAnswers',
    view: 'complianceScheme/quarterly/views/check-answers',
    next: 'declaration',
    formStep: false
  },
  declaration: {
    contentKey: 'declaration',
    view: 'complianceScheme/quarterly/views/declaration',
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
    view: 'complianceScheme/quarterly/views/confirmation',
    next: null,
    formStep: false
  }
}

export const MEMBER_STEPS = {
  'market-data': {
    contentKey: 'marketData',
    view: 'complianceScheme/quarterly/views/member-tonnes',
    formStep: true,
    schema: tonneTriple,
    fieldMessages: tripleMessages,
    toPatch: (payload) => ({ marketData: triple(payload) })
  },
  'waste-data': {
    contentKey: 'wasteData',
    view: 'complianceScheme/quarterly/views/member-tonnes',
    formStep: true,
    schema: tonneTriple,
    fieldMessages: tripleMessages,
    toPatch: (payload) => ({ wasteData: triple(payload) })
  }
}

export const STEP_ORDER = [
  'member-list',
  'check-answers',
  'declaration',
  'confirmation'
]

export const isKnownStep = (step) =>
  Object.prototype.hasOwnProperty.call(STEPS, step)

export const isKnownMemberStep = (dataType) =>
  Object.prototype.hasOwnProperty.call(MEMBER_STEPS, dataType)

export const QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4']

export const isKnownQuarter = (quarter) => QUARTERS.includes(quarter)
