const lookup = (source, path) =>
  path.split('.').reduce((acc, key) => {
    if (acc == null) return undefined
    return acc[key]
  }, source)

const setField = (field, value) => {
  if (field.type === 'checkbox') {
    field.checked = Boolean(value)
    return
  }
  if (field.type === 'radio') {
    field.checked = String(field.value) === String(value)
    return
  }
  field.value = value == null ? '' : String(value)
}

export const hydrateForm = (form, source) => {
  if (!form || source == null) return
  const fields = form.querySelectorAll('[name]')
  fields.forEach((field) => {
    const value = lookup(source, field.name)
    if (value === undefined) return
    setField(field, value)
  })
}
