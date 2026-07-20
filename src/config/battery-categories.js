export const BATTERY_CATEGORIES = [
  { id: 'portable', label: 'Portable batteries', shortLabel: 'Portable' },
  { id: 'industrial', label: 'Industrial batteries', shortLabel: 'Industrial' },
  { id: 'automotive', label: 'Automotive batteries', shortLabel: 'Automotive' }
]

export const categoryIds = BATTERY_CATEGORIES.map((category) => category.id)

export const categoryLabels = Object.fromEntries(
  BATTERY_CATEGORIES.map((category) => [category.id, category.label])
)

export const categoryShortLabels = Object.fromEntries(
  BATTERY_CATEGORIES.map((category) => [category.id, category.shortLabel])
)

const capitalise = (value) => `${value[0].toUpperCase()}${value.slice(1)}`

export const categoryFieldName = (prefix, id) => `${prefix}${capitalise(id)}`

export const categoryFlagName = (id) => `is${capitalise(id)}`

export const emptyCategoryMap = (value = 0) =>
  Object.fromEntries(categoryIds.map((id) => [id, value]))

export const CATEGORY_CAVEAT =
  'These are demonstration categories for the playground, not the authoritative statutory battery-category definitions.'
