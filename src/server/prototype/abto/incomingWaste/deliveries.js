import { createRequire } from 'node:module'

const seedData = createRequire(import.meta.url)(
  '../../../../client/javascripts/storage-seed.json'
)

// A delivery is treated as needing review once the operator's weighbridge
// figure diverges from the scheme's reported figure by more than this —
// the same 20% tolerance used elsewhere in the service.
const VARIANCE_THRESHOLD_PERCENT = 20

export const formatTonnes = (tonnes) => tonnes.toFixed(3)

export const computeVariance = (delivery) => {
  const varianceTonnes = delivery.measuredTonnes - delivery.reportedTonnes
  const variancePercent = (varianceTonnes / delivery.reportedTonnes) * 100
  const exceedsThreshold =
    Math.abs(variancePercent) > VARIANCE_THRESHOLD_PERCENT

  return {
    varianceTonnes,
    variancePercent,
    exceedsThreshold
  }
}

export const getDeliveries = () => seedData.prototypeAbtoDeliveries

export const getDeliveryById = (id) =>
  getDeliveries().find((delivery) => delivery.id === id) ?? null
