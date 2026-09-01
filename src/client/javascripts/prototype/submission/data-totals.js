const WEIGHT_NAMES = ['weightLeadAcid', 'weightNickelCadmium', 'weightOther']

export const unitSuffix = (unit) => (unit === 'tonnes' ? 't' : 'kg')

export const wireDataTotals = (doc) => {
  const total = doc.querySelector('[data-testid="data-total"]')
  if (!total) return false

  const weightInputs = WEIGHT_NAMES.map((name) =>
    doc.querySelector(`input[name="${name}"]`)
  )
  const unitInputs = [...doc.querySelectorAll('input[name="unit"]')]

  const selectedUnit = () =>
    unitInputs.find((input) => input.checked)?.value ?? 'kilograms'

  const update = () => {
    const sum = weightInputs.reduce(
      (acc, input) => acc + (parseFloat(input.value) || 0),
      0
    )
    const suffix = unitSuffix(selectedUnit())
    total.textContent = `${Math.round(sum * 1000) / 1000}${suffix}`
    doc.querySelectorAll('.govuk-input__suffix').forEach((el) => {
      el.textContent = suffix
    })
  }

  weightInputs.forEach((input) => input.addEventListener('input', update))
  unitInputs.forEach((input) => input.addEventListener('change', update))
  update()
  return true
}
