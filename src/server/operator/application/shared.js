const FLASH_KEY = (step) => `operatorApplicationErrors:${step}`
const VALUES_KEY = (step) => `operatorApplicationValues:${step}`

export const flashStepErrors = (request, step, errors, values) => {
  request.yar.flash(FLASH_KEY(step), errors)
  request.yar.flash(VALUES_KEY(step), values)
}

export const readStepErrors = (request, step) => {
  const errors = request.yar.flash(FLASH_KEY(step))
  const valuesArr = request.yar.flash(VALUES_KEY(step))
  return {
    errors: errors.length ? errors : null,
    values: valuesArr[0] ?? null
  }
}

export const errorListToMap = (errorList) =>
  (errorList || []).reduce((acc, e) => {
    acc[e.href.replace(/^#/, '')] = e.text
    return acc
  }, {})

export const collectErrors = (joiError, fieldMessages) => {
  const seen = new Set()
  const list = []
  for (const detail of joiError.details) {
    const field = detail.path[0]
    if (seen.has(field)) continue
    seen.add(field)
    if (fieldMessages[field]) {
      list.push({ text: fieldMessages[field], href: `#${field}` })
    }
  }
  return list
}
