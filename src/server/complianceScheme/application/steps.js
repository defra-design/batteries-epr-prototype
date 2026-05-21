import joi from 'joi'

const optionalText = joi.string().trim().allow('').optional()
const requiredText = joi.string().trim().min(1).required()
const postcode = joi
  .string()
  .trim()
  .pattern(/^[A-Z]{1,2}[0-9R][0-9A-Z]?\s*[0-9][A-Z]{2}$/i)
  .required()

const address = ({ requiredErr, postcodeErr, townErr }) => ({
  schema: joi
    .object({
      line1: requiredText,
      line2: optionalText,
      town: requiredText,
      postcode
    })
    .options({ stripUnknown: true }),
  fieldMessages: () => ({
    line1: requiredErr,
    town: townErr,
    postcode: postcodeErr
  })
})

const toAddress = (payload) => ({
  line1: payload.line1,
  line2: payload.line2 || null,
  line3: null,
  line4: null,
  town: payload.town,
  postcode: payload.postcode.toUpperCase().replace(/\s+/g, ' ').trim(),
  countryCode: 'GB'
})

const splitLines = (value) =>
  value
    ? String(value)
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
    : []

export const STEPS = {
  'scheme-details': {
    contentKey: 'schemeDetails',
    view: 'complianceScheme/application/views/scheme-details',
    next: 'registered-address',
    schema: joi
      .object({
        name: requiredText,
        tradingNames: optionalText
      })
      .options({ stripUnknown: true }),
    fieldMessages: (errorContent) => ({ name: errorContent.name }),
    toSchemePatch: (payload) => ({
      name: payload.name,
      tradingNames: splitLines(payload.tradingNames)
    })
  },
  'registered-address': {
    contentKey: 'registeredAddress',
    view: 'complianceScheme/application/views/address',
    next: 'contact-address',
    ...address({
      requiredErr: 'Enter the first line of the registered address',
      townErr: 'Enter the town or city',
      postcodeErr: 'Enter a valid UK postcode'
    }),
    toSchemePatch: (payload) => ({ registeredAddress: toAddress(payload) })
  },
  'contact-address': {
    contentKey: 'contactAddress',
    view: 'complianceScheme/application/views/address',
    next: 'operational-plan',
    ...address({
      requiredErr: 'Enter the first line of the contact address',
      townErr: 'Enter the town or city',
      postcodeErr: 'Enter a valid UK postcode'
    }),
    toSchemePatch: (payload) => ({
      contactAddress: toAddress(payload),
      serviceOfNoticeAddress: toAddress(payload)
    })
  },
  'operational-plan': {
    contentKey: 'operationalPlan',
    view: 'complianceScheme/application/views/operational-plan',
    next: 'partners',
    schema: joi
      .object({ operationalPlan: requiredText })
      .options({ stripUnknown: true }),
    fieldMessages: (errorContent) => ({
      operationalPlan: errorContent.operationalPlan
    }),
    toSchemePatch: (payload) => ({ operationalPlan: payload.operationalPlan })
  },
  partners: {
    contentKey: 'partners',
    view: 'complianceScheme/application/views/partners',
    next: 'offences',
    schema: joi
      .object({ partners: optionalText })
      .options({ stripUnknown: true }),
    fieldMessages: () => ({}),
    toSchemePatch: (payload) => ({
      partners: splitLines(payload.partners).map((name) => ({ name }))
    })
  },
  offences: {
    contentKey: 'offences',
    view: 'complianceScheme/application/views/offences',
    next: 'additional-files',
    schema: joi
      .object({
        hasOffences: joi.string().valid('yes', 'no').required(),
        offencesDetail: joi.when('hasOffences', {
          is: 'yes',
          then: requiredText,
          otherwise: optionalText
        })
      })
      .options({ stripUnknown: true }),
    fieldMessages: (errorContent) => ({
      hasOffences: errorContent.hasOffences,
      offencesDetail: errorContent.offencesDetail
    }),
    toSchemePatch: (payload) => ({
      offences:
        payload.hasOffences === 'yes' ? payload.offencesDetail.trim() : null
    })
  },
  'additional-files': {
    contentKey: 'additionalFiles',
    view: 'complianceScheme/application/views/additional-files',
    next: 'declaration',
    schema: joi
      .object({ additionalFiles: optionalText })
      .options({ stripUnknown: true }),
    fieldMessages: () => ({}),
    toSchemePatch: (payload) => ({
      additionalFiles: splitLines(payload.additionalFiles).map((name) => ({
        name
      }))
    })
  },
  declaration: {
    contentKey: 'declaration',
    view: 'complianceScheme/application/views/declaration',
    next: 'confirmation',
    schema: joi
      .object({
        declarationAccepted: joi.string().valid('yes').required()
      })
      .options({ stripUnknown: true }),
    fieldMessages: (errorContent) => ({
      declarationAccepted: errorContent.declarationAccepted
    }),
    toSchemePatch: () => ({
      approvalStatus: 'submitted',
      submittedOn: new Date().toISOString()
    })
  },
  confirmation: {
    contentKey: 'confirmation',
    view: 'complianceScheme/application/views/confirmation',
    next: null,
    schema: null,
    fieldMessages: () => ({}),
    toSchemePatch: () => ({})
  }
}

export const STEP_ORDER = [
  'scheme-details',
  'registered-address',
  'contact-address',
  'operational-plan',
  'partners',
  'offences',
  'additional-files',
  'declaration',
  'confirmation'
]

export const isKnownStep = (step) =>
  Object.prototype.hasOwnProperty.call(STEPS, step)
