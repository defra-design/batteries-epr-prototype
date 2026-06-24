const KEY_PREFIX = 'ni-batteries:'

export const NI_STORAGE_KEYS = {
  registration: `${KEY_PREFIX}registration`,
  annualReturns: `${KEY_PREFIX}annualReturns`
}

const now = () => new Date().toISOString()

const newId = () => globalThis.crypto.randomUUID()

const safeParse = (raw) => {
  try {
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

const readJson = (key) => safeParse(globalThis.localStorage.getItem(key))

const writeJson = (key, value) => {
  globalThis.localStorage.setItem(key, JSON.stringify(value))
}

const stamp = (existing, isNew) =>
  isNew
    ? { createdAt: now(), updatedAt: now(), version: 0 }
    : {
        createdAt: existing.createdAt,
        updatedAt: now(),
        version: existing.version + 1
      }

export const saveRegistration = (record) => {
  const existing = readJson(NI_STORAGE_KEYS.registration)
  const base = existing ?? { id: newId() }
  const saved = { ...base, ...record, ...stamp(base, !existing) }
  writeJson(NI_STORAGE_KEYS.registration, saved)
  return saved
}

export const getRegistration = () => readJson(NI_STORAGE_KEYS.registration)

export const saveAnnualReturn = (record) => {
  const map = readJson(NI_STORAGE_KEYS.annualReturns) ?? {}
  const existing = map[record.period]
  const base = existing ?? { id: newId() }
  const saved = { ...base, ...record, ...stamp(base, !existing) }
  map[record.period] = saved
  writeJson(NI_STORAGE_KEYS.annualReturns, map)
  return saved
}

export const listAnnualReturns = () =>
  Object.values(readJson(NI_STORAGE_KEYS.annualReturns) ?? {})

export const getAnnualReturn = (period) =>
  (readJson(NI_STORAGE_KEYS.annualReturns) ?? {})[period] ?? null

export const readJsonScript = (doc, id) => {
  const element = doc.getElementById(id)
  if (!element) return null
  return safeParse(element.textContent)
}

export const storage = {
  saveRegistration,
  getRegistration,
  saveAnnualReturn,
  listAnnualReturns,
  getAnnualReturn,
  readJsonScript
}
