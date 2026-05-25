import joi from 'joi'

const optionalText = joi.string().trim().allow('').optional()
const requiredText = joi.string().trim().min(1).required()
const postcode = joi
  .string()
  .trim()
  .pattern(/^[A-Z]{1,2}[0-9R][0-9A-Z]?\s*[0-9][A-Z]{2}$/i)
  .required()

const toAddress = (payload) => ({
  line1: payload.line1,
  line2: payload.line2 || null,
  line3: null,
  line4: null,
  town: payload.town,
  postcode: payload.postcode.toUpperCase().replace(/\s+/g, ' ').trim(),
  countryCode: 'GB'
})

export const STEPS = {
  'operator-details': {
    contentKey: 'operatorDetails',
    view: 'operator/application/views/operator-details',
    next: 'registered-address',
    schema: joi
      .object({
        name: requiredText,
        approvalType: joi.string().valid('abto', 'abe').required(),
        companyRegistrationNo: requiredText
      })
      .options({ stripUnknown: true }),
    fieldMessages: (errorContent) => ({
      name: errorContent.name,
      approvalType: errorContent.approvalType,
      companyRegistrationNo: errorContent.companyRegistrationNo
    }),
    toOperatorPatch: (payload) => ({
      name: payload.name,
      approvalType: payload.approvalType,
      companyRegistrationNo: payload.companyRegistrationNo
    })
  },
  'registered-address': {
    contentKey: 'registeredAddress',
    view: 'operator/application/views/address',
    next: 'site-details',
    schema: joi
      .object({
        line1: requiredText,
        line2: optionalText,
        town: requiredText,
        postcode
      })
      .options({ stripUnknown: true }),
    fieldMessages: () => ({
      line1: 'Enter the first line of the registered address',
      town: 'Enter the town or city',
      postcode: 'Enter a valid UK postcode'
    }),
    toOperatorPatch: (payload) => ({ registeredAddress: toAddress(payload) })
  },
  'site-details': {
    contentKey: 'siteDetails',
    view: 'operator/application/views/site-details',
    next: 'declaration',
    schema: joi
      .object({
        siteName: requiredText,
        siteLine1: requiredText,
        siteTown: requiredText,
        sitePostcode: postcode,
        isPortable: optionalText,
        isIndustrial: optionalText,
        isAutomotive: optionalText,
        operationsDescription: requiredText
      })
      .options({ stripUnknown: true }),
    fieldMessages: (errorContent) => ({
      siteName: errorContent.siteName,
      siteLine1: errorContent.siteLine1,
      siteTown: errorContent.siteTown,
      sitePostcode: errorContent.sitePostcode,
      operationsDescription: errorContent.operationsDescription
    }),
    toOperatorPatch: (payload) => {
      const batteryTypes = {
        isPortable: payload.isPortable === 'yes',
        isIndustrial: payload.isIndustrial === 'yes',
        isAutomotive: payload.isAutomotive === 'yes'
      }
      return {
        batteryTypes,
        sites: [
          {
            name: payload.siteName,
            address: {
              line1: payload.siteLine1,
              line2: null,
              line3: null,
              line4: null,
              town: payload.siteTown,
              postcode: payload.sitePostcode
                .toUpperCase()
                .replace(/\s+/g, ' ')
                .trim(),
              countryCode: 'GB'
            },
            batteryTypes,
            operationsDescription: payload.operationsDescription
          }
        ]
      }
    }
  },
  declaration: {
    contentKey: 'declaration',
    view: 'operator/application/views/declaration',
    next: 'confirmation',
    schema: joi
      .object({
        declarationAccepted: joi.string().valid('yes').required()
      })
      .options({ stripUnknown: true }),
    fieldMessages: (errorContent) => ({
      declarationAccepted: errorContent.declarationAccepted
    }),
    toOperatorPatch: () => ({
      approvalStatus: 'submitted',
      submittedOn: new Date().toISOString()
    })
  },
  confirmation: {
    contentKey: 'confirmation',
    view: 'operator/application/views/confirmation',
    next: null,
    schema: null,
    fieldMessages: () => ({}),
    toOperatorPatch: () => ({})
  }
}

export const STEP_ORDER = [
  'operator-details',
  'registered-address',
  'site-details',
  'declaration',
  'confirmation'
]

export const isKnownStep = (step) =>
  Object.prototype.hasOwnProperty.call(STEPS, step)
