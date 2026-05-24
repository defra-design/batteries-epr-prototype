import joi from 'joi'

const tonneSchema = joi
  .string()
  .trim()
  .pattern(/^\d+(\.\d{1,3})?$/)
  .required()

const tonnePair = joi
  .object({
    industrial: tonneSchema,
    automotive: tonneSchema
  })
  .options({ stripUnknown: true })

const pairMessages = (errorContent) => ({
  industrial: {
    required: errorContent.industrial,
    format: errorContent.industrialFormat
  },
  automotive: {
    required: errorContent.automotive,
    format: errorContent.automotiveFormat
  }
})

const pair = (payload) => ({
  industrial: payload.industrial,
  automotive: payload.automotive
})

const memberTonneStep = (contentKey, fieldKey) => ({
  contentKey,
  view: 'complianceScheme/industrialAutomotive/views/member-tonnes',
  formStep: true,
  schema: tonnePair,
  fieldMessages: pairMessages,
  toPatch: (payload) => ({ [fieldKey]: pair(payload) })
})

export const STEPS = {
  'member-list': {
    contentKey: 'memberList',
    view: 'complianceScheme/industrialAutomotive/views/member-list',
    next: 'check-answers',
    formStep: false
  },
  'check-answers': {
    contentKey: 'checkAnswers',
    view: 'complianceScheme/industrialAutomotive/views/check-answers',
    next: 'declaration',
    formStep: false
  },
  declaration: {
    contentKey: 'declaration',
    view: 'complianceScheme/industrialAutomotive/views/declaration',
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
    view: 'complianceScheme/industrialAutomotive/views/confirmation',
    next: null,
    formStep: false
  }
}

export const MEMBER_STEPS = {
  placed: memberTonneStep('placed', 'placed'),
  exported: memberTonneStep('exported', 'exported'),
  'taken-back': memberTonneStep('takenBack', 'takenBack'),
  delivered: memberTonneStep('delivered', 'delivered')
}

export const MEMBER_STEP_ORDER = [
  'placed',
  'exported',
  'taken-back',
  'delivered'
]

export const STEP_ORDER = [
  'member-list',
  'check-answers',
  'declaration',
  'confirmation'
]

export const isKnownStep = (step) =>
  Object.prototype.hasOwnProperty.call(STEPS, step)

export const isKnownMemberStep = (step) =>
  Object.prototype.hasOwnProperty.call(MEMBER_STEPS, step)
