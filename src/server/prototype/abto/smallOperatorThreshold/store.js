import { createRequire } from 'node:module'
import { differenceInCalendarDays, parseISO } from 'date-fns'

import { prototypeAbtoContent } from '../../../../config/prototype-abto-content.js'

const seedData = createRequire(import.meta.url)(
  '../../../../client/javascripts/storage-seed.json'
)

export const getThreshold = () => seedData.prototypeAbtoThreshold

export const formatTonnes = (tonnes) => tonnes.toFixed(3)

// The exceeded category drives the banner and the threshold named in the
// explanatory copy: the first one whose total is over its threshold.
export const getExceededCategory = () =>
  getThreshold().categories.find(
    (category) => category.totalTonnes > category.thresholdTonnes
  )

export const getDaysToPay = () => {
  const { crossedOn, payBy } = getThreshold()
  return differenceInCalendarDays(parseISO(payBy), parseISO(crossedOn))
}

// Rows for the shared running-totals table, used on both the threshold
// screen and the waste returns account home.
export const getTotalsRows = () => {
  const { unit, status } = prototypeAbtoContent.totals
  return getThreshold().categories.map((category) => {
    const exceeded = category.totalTonnes > category.thresholdTonnes
    return {
      id: category.id,
      name: category.name,
      threshold: `${formatTonnes(category.thresholdTonnes)} ${unit}`,
      total: `${formatTonnes(category.totalTonnes)} ${unit}`,
      statusText: exceeded ? status.exceeded : status.within,
      statusColour: exceeded ? 'red' : 'green'
    }
  })
}

export const getWasteReturnsSeed = () => seedData.prototypeAbtoWasteReturns

// Payment state for the balance, held in memory for the lifetime of the
// process (reset via the "Reset data" link) — same approach as the other
// server-side prototype stores. The reference and paid time come from the
// seed so the confirmation is stable.
let payment = null

export const getPayment = () => payment

export const recordPayment = (method) => {
  const { reference, paidOn } = getThreshold().payment
  payment = { method, reference, paidOn }
  return payment
}

export const resetThresholdStore = () => {
  payment = null
}
