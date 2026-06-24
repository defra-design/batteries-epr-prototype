import {
  BATTERY_PASSPORT,
  CARBON_FOOTPRINT,
  RECYCLED_CONTENT,
  REMOVABILITY_LABELS
} from './requirements.js'

const appliesTo = (categories, fields) =>
  fields.some((field) => categories[field] === true)

const declaredPercent = (value) =>
  value === undefined || value === '' ? null : Number(value)

const formatPercent = (value) => (value === null ? 'Not declared' : `${value}%`)

const carbonFootprintResult = (categories, cf) => {
  const applies = appliesTo(categories, CARBON_FOOTPRINT.appliesToCategories)
  const value = cf.carbonFootprintValue ?? null
  const performanceClass = cf.performanceClass ?? null
  const declared = value !== null && performanceClass !== null
  return {
    key: CARBON_FOOTPRINT.key,
    heading: CARBON_FOOTPRINT.heading,
    legislation: CARBON_FOOTPRINT.legislation,
    applies,
    status: !applies ? 'not-applicable' : declared ? 'declared' : 'not-declared',
    rows: [
      {
        label: 'Declared carbon footprint',
        value: value === null ? 'Not declared' : `${value} kg CO2e/kWh`,
        target: null,
        status: null
      },
      {
        label: 'Performance class',
        value: performanceClass ?? 'Not declared',
        target: null,
        status: null
      }
    ]
  }
}

const materialStatus = (declared, threshold) => {
  if (declared === null) return 'not-declared'
  return declared >= threshold ? 'met' : 'below'
}

const recycledContentResult = (categories, cf) => {
  const applies = appliesTo(categories, RECYCLED_CONTENT.appliesToCategories)
  const rows = RECYCLED_CONTENT.materials.map((material) => {
    const declared = declaredPercent(cf[material.field])
    return {
      label: material.label,
      value: formatPercent(declared),
      target: `${material.thresholdPercent}%`,
      status: materialStatus(declared, material.thresholdPercent)
    }
  })
  const allMet = rows.every((row) => row.status === 'met')
  return {
    key: RECYCLED_CONTENT.key,
    heading: RECYCLED_CONTENT.heading,
    legislation: RECYCLED_CONTENT.legislation,
    applies,
    status: !applies ? 'not-applicable' : allMet ? 'complete' : 'incomplete',
    rows
  }
}

const batteryPassportResult = (categories, bp) => {
  const applies = appliesTo(categories, BATTERY_PASSPORT.appliesToCategories)
  const carrierId = bp.passportCarrierId ?? null
  const provided = carrierId !== null && carrierId !== ''
  const labelRows = BATTERY_PASSPORT.labelFields.map((field) => ({
    label: field.label,
    value: bp[field.key] === true ? 'Applied' : 'Not applied',
    target: null,
    status: null
  }))
  return {
    key: BATTERY_PASSPORT.key,
    heading: BATTERY_PASSPORT.heading,
    legislation: BATTERY_PASSPORT.legislation,
    applies,
    status: !applies ? 'not-applicable' : provided ? 'provided' : 'missing',
    rows: [
      {
        label: 'Battery passport carrier ID',
        value: provided ? carrierId : 'Not provided',
        target: null,
        status: provided ? 'provided' : 'missing'
      },
      ...labelRows,
      {
        label: 'Removable by the end user',
        value: REMOVABILITY_LABELS[bp.removability] ?? 'Not declared',
        target: null,
        status: null
      }
    ]
  }
}

export const calculateProductRequirements = (registration) => {
  if (!registration) {
    return { hasData: false, bprn: null, sections: [] }
  }
  const categories = registration.batteryCategories ?? {}
  const cf = registration.carbonFootprint ?? {}
  const bp = registration.batteryPassport ?? {}
  return {
    hasData: true,
    bprn: registration.bprn ?? null,
    sections: [
      carbonFootprintResult(categories, cf),
      recycledContentResult(categories, cf),
      batteryPassportResult(categories, bp)
    ]
  }
}
