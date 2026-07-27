import joi from 'joi'

import { categoryIds } from '../../../config/battery-categories.js'

const tonneSchema = joi
  .string()
  .trim()
  .pattern(/^\d+(\.\d{1,3})?$/)
  .required()

export const parseCategoryIds = (payload) => {
  const raw = payload?.categoryIds
  return typeof raw === 'string' && raw.length > 0
    ? raw.split(',')
    : categoryIds
}

const buildTonneSchema = (ids) =>
  joi
    .object({
      categoryIds: joi.any().optional(),
      ...Object.fromEntries(ids.map((id) => [id, tonneSchema]))
    })
    .options({ stripUnknown: true })

const buildCategoryMessages = (errorContent, ids) =>
  Object.fromEntries(
    ids.map((id) => [
      id,
      {
        required: errorContent[id] ?? errorContent.generic,
        format: errorContent[`${id}Format`] ?? errorContent.genericFormat
      }
    ])
  )

const byCategory = (payload, ids) =>
  Object.fromEntries(ids.map((id) => [id, payload[id]]))

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
    buildSchema: buildTonneSchema,
    buildMessages: buildCategoryMessages,
    toPatch: (payload, ids) => ({ marketData: byCategory(payload, ids) })
  },
  'waste-data': {
    contentKey: 'wasteData',
    view: 'complianceScheme/quarterly/views/member-tonnes',
    formStep: true,
    buildSchema: buildTonneSchema,
    buildMessages: buildCategoryMessages,
    toPatch: (payload, ids) => ({ wasteData: byCategory(payload, ids) })
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
