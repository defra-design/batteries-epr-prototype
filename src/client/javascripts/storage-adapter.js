import seedData from './storage-seed.json'

const KEY_PREFIX = 'npwd-batteries:'

export const STORAGE_KEYS = {
  currentUser: `${KEY_PREFIX}currentUser`,
  producers: `${KEY_PREFIX}producers`,
  registrations: `${KEY_PREFIX}registrations`,
  submissions: `${KEY_PREFIX}submissions`,
  payments: `${KEY_PREFIX}payments`,
  seedVersion: `${KEY_PREFIX}seed-version`,
  timeTravelTargetYear: `${KEY_PREFIX}time-travel-target-year`
}

const bprnSequenceKey = (agencyCode, compliancePeriod) =>
  `${KEY_PREFIX}seq:bprn:${agencyCode}:${compliancePeriod}`

const PAYMENT_COMPLETE_DELAY_MS = 1000

const now = () => new Date().toISOString()

const newId = () => globalThis.crypto.randomUUID()

const safeParse = (raw, key) => {
  try {
    return raw ? JSON.parse(raw) : null
  } catch (error) {
    console.warn(`[storage] failed to parse ${key}: ${error.message}`)
    return null
  }
}

const readJson = (key) => safeParse(globalThis.localStorage.getItem(key), key)

const writeJson = (key, value) => {
  globalThis.localStorage.setItem(key, JSON.stringify(value))
}

const removeKey = (key) => {
  globalThis.localStorage.removeItem(key)
}

const allOurKeys = () => {
  const keys = []
  for (let i = 0; i < globalThis.localStorage.length; i += 1) {
    const key = globalThis.localStorage.key(i)
    if (key && key.startsWith(KEY_PREFIX)) {
      keys.push(key)
    }
  }
  return keys
}

const readMap = (key) => readJson(key) ?? {}

const coerceTonnes = (value) => {
  if (typeof value === 'string') return value
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value.toFixed(3)
  }
  return '0.000'
}

const stamp = (existing, isNew) => ({
  createdAt: isNew ? now() : (existing?.createdAt ?? now()),
  updatedAt: now(),
  version: isNew ? 0 : (existing?.version ?? 0) + 1
})

export const createProducer = (input = {}) => ({
  id: input.id ?? newId(),
  version: 0,
  bprn: input.bprn ?? null,
  contactEmail: input.contactEmail ?? null,
  companyName: input.companyName ?? null,
  tradingName: input.tradingName ?? null,
  companyRegistrationNo: input.companyRegistrationNo ?? null,
  webAddress: input.webAddress ?? null,
  sicCode: input.sicCode ?? null,
  registeredAddress: input.registeredAddress ?? null,
  serviceOfNoticeAddress: input.serviceOfNoticeAddress ?? null,
  primaryContact: input.primaryContact ?? null,
  brandNames: input.brandNames ?? [],
  batteryTypes: input.batteryTypes ?? {
    isPortable: false,
    isIndustrial: false,
    isAutomotive: false
  },
  agencyCode: input.agencyCode ?? null,
  status: input.status ?? 'Active',
  createdAt: input.createdAt ?? now(),
  updatedAt: input.updatedAt ?? now()
})

export const createRegistration = (input = {}) => ({
  id: input.id ?? newId(),
  version: 0,
  producerId: input.producerId ?? null,
  compliancePeriod: input.compliancePeriod ?? null,
  status: input.status ?? 'Started',
  producerRoute: input.producerRoute ?? null,
  companySnapshot: input.companySnapshot ?? null,
  contactSnapshot: input.contactSnapshot ?? null,
  brandNamesSnapshot: input.brandNamesSnapshot ?? [],
  batteryTypesSnapshot: input.batteryTypesSnapshot ?? null,
  declaration: input.declaration ?? null,
  fee: input.fee ?? { amountPence: 0, paymentId: null, status: 'NotStarted' },
  createdAt: input.createdAt ?? now(),
  updatedAt: input.updatedAt ?? now()
})

export const createSubmission = (input = {}) => ({
  id: input.id ?? newId(),
  version: 0,
  registrationId: input.registrationId ?? null,
  submissionType: input.submissionType ?? 'smallProducerAnnual',
  status: input.status ?? 'Started',
  useDetailedDataEntry: input.useDetailedDataEntry ?? false,
  lines: (input.lines ?? []).map((line) => ({
    ...line,
    tonnes: coerceTonnes(line.tonnes)
  })),
  totals: input.totals ?? {
    placedTotal: '0.000',
    collectedTotal: '0.000',
    deliveredTotal: '0.000',
    exportedTotal: '0.000'
  },
  declaration: input.declaration ?? null,
  createdAt: input.createdAt ?? now(),
  updatedAt: input.updatedAt ?? now()
})

const getCurrentUser = () => readJson(STORAGE_KEYS.currentUser)

const setCurrentUser = ({ email }) => {
  writeJson(STORAGE_KEYS.currentUser, { email })
}

const signOut = () => {
  removeKey(STORAGE_KEYS.currentUser)
}

const getProducerByEmail = (email) => {
  const producers = readMap(STORAGE_KEYS.producers)
  return producers[email] ?? null
}

const saveProducer = (producer) => {
  if (!producer?.contactEmail) {
    throw new Error('saveProducer requires producer.contactEmail')
  }
  const producers = readMap(STORAGE_KEYS.producers)
  const existing = producers[producer.contactEmail]
  const merged = {
    ...producer,
    id: existing?.id ?? producer.id ?? newId(),
    ...stamp(existing, !existing)
  }
  producers[producer.contactEmail] = merged
  writeJson(STORAGE_KEYS.producers, producers)
  return merged
}

const getRegistration = (id) => readMap(STORAGE_KEYS.registrations)[id] ?? null

const listRegistrationsForProducer = (producerId) => {
  const registrations = readMap(STORAGE_KEYS.registrations)
  return Object.values(registrations).filter((r) => r.producerId === producerId)
}

const saveRegistration = (registration) => {
  const registrations = readMap(STORAGE_KEYS.registrations)
  const existing = registration.id ? registrations[registration.id] : null
  const merged = {
    ...registration,
    id: existing?.id ?? registration.id ?? newId(),
    ...stamp(existing, !existing)
  }
  registrations[merged.id] = merged
  writeJson(STORAGE_KEYS.registrations, registrations)
  return merged
}

const getSubmission = (id) => readMap(STORAGE_KEYS.submissions)[id] ?? null

const listSubmissionsForRegistration = (registrationId) => {
  const submissions = readMap(STORAGE_KEYS.submissions)
  return Object.values(submissions).filter(
    (s) => s.registrationId === registrationId
  )
}

const saveSubmission = (submission) => {
  const submissions = readMap(STORAGE_KEYS.submissions)
  const existing = submission.id ? submissions[submission.id] : null
  const lines = (submission.lines ?? []).map((line) => ({
    ...line,
    tonnes: coerceTonnes(line.tonnes)
  }))
  const merged = {
    ...submission,
    lines,
    id: existing?.id ?? submission.id ?? newId(),
    ...stamp(existing, !existing)
  }
  submissions[merged.id] = merged
  writeJson(STORAGE_KEYS.submissions, submissions)
  return merged
}

const createPayment = (submissionId, amountPence) => {
  const payments = readMap(STORAGE_KEYS.payments)
  const payment = {
    id: newId(),
    submissionId,
    amountPence,
    status: 'Created',
    createdAt: now(),
    updatedAt: now()
  }
  payments[payment.id] = payment
  writeJson(STORAGE_KEYS.payments, payments)
  return payment
}

const completePayment = (paymentId) =>
  new Promise((resolve) => {
    setTimeout(() => {
      const payments = readMap(STORAGE_KEYS.payments)
      const existing = payments[paymentId]
      if (!existing) {
        resolve(null)
        return
      }
      const completed = {
        ...existing,
        status: 'Success',
        updatedAt: now()
      }
      payments[paymentId] = completed
      writeJson(STORAGE_KEYS.payments, payments)
      resolve(completed)
    }, PAYMENT_COMPLETE_DELAY_MS)
  })

const getPayment = (id) => readMap(STORAGE_KEYS.payments)[id] ?? null

const matchesSearch = (producer, { q, bprn, postcode }) => {
  if (bprn && producer.bprn !== bprn) return false
  if (q) {
    const haystack = String(producer.companyName ?? '').toLowerCase()
    if (!haystack.includes(q.toLowerCase())) return false
  }
  if (postcode) {
    const producerPostcode = producer.registeredAddress?.postcode ?? ''
    const target = postcode.replace(/\s+/g, '').toUpperCase()
    const candidate = String(producerPostcode).replace(/\s+/g, '').toUpperCase()
    if (!candidate.startsWith(target)) return false
  }
  return true
}

const PUBLIC_PAGE_SIZE = 10

const searchPublicRegister = ({
  q = '',
  bprn = '',
  postcode = '',
  page = 1
} = {}) => {
  const producers = Object.values(readMap(STORAGE_KEYS.producers))
  const filtered = producers
    .filter(
      (p) => p.status === 'Active' || p.status === 'Approved' || p.bprn != null
    )
    .filter((p) => matchesSearch(p, { q, bprn, postcode }))
    .sort((a, b) =>
      String(a.companyName ?? '').localeCompare(String(b.companyName ?? ''))
    )

  const totalCount = filtered.length
  const totalPages = Math.max(1, Math.ceil(totalCount / PUBLIC_PAGE_SIZE))
  const safePage = Math.min(Math.max(1, page), totalPages)
  const start = (safePage - 1) * PUBLIC_PAGE_SIZE
  const items = filtered.slice(start, start + PUBLIC_PAGE_SIZE).map((p) => ({
    bprn: p.bprn,
    companyName: p.companyName,
    registeredAddress: p.registeredAddress,
    batteryTypes: p.batteryTypes,
    brandNames: p.brandNames
  }))

  return {
    items,
    page: safePage,
    pageSize: PUBLIC_PAGE_SIZE,
    totalCount,
    totalPages
  }
}

const getPublicProducer = (bprn) => {
  const producers = Object.values(readMap(STORAGE_KEYS.producers))
  const producer = producers.find((p) => p.bprn === bprn)
  if (!producer) return null
  return {
    bprn: producer.bprn,
    companyName: producer.companyName,
    registeredAddress: producer.registeredAddress,
    batteryTypes: producer.batteryTypes,
    brandNames: producer.brandNames
  }
}

const highestExistingBprnSequence = (agencyCode, compliancePeriod) => {
  const prefix = `BPRN-${agencyCode}-${compliancePeriod}-`
  let max = 0
  for (const producer of Object.values(readMap(STORAGE_KEYS.producers))) {
    const bprn = producer?.bprn
    if (typeof bprn !== 'string' || !bprn.startsWith(prefix)) continue
    const seq = Number(bprn.slice(prefix.length))
    if (Number.isFinite(seq) && seq > max) {
      max = seq
    }
  }
  return max
}

const allocateBprn = ({ agencyCode, compliancePeriod }) => {
  if (!agencyCode || !compliancePeriod) {
    throw new Error('allocateBprn requires agencyCode and compliancePeriod')
  }
  const sequenceKey = bprnSequenceKey(agencyCode, compliancePeriod)
  const stored = Number(globalThis.localStorage.getItem(sequenceKey) ?? '0')
  const baseline = Math.max(
    stored,
    highestExistingBprnSequence(agencyCode, compliancePeriod)
  )
  const next = baseline + 1
  globalThis.localStorage.setItem(sequenceKey, String(next))
  const padded = String(next).padStart(6, '0')
  return `BPRN-${agencyCode}-${compliancePeriod}-${padded}`
}

const resetAllData = () => {
  for (const key of allOurKeys()) {
    removeKey(key)
  }
}

const getTimeTravelTargetYear = () => {
  const raw = globalThis.localStorage.getItem(STORAGE_KEYS.timeTravelTargetYear)
  if (raw === null || raw === '') return null
  const parsed = Number(raw)
  return Number.isInteger(parsed) ? parsed : null
}

const clearTimeTravel = () => {
  removeKey(STORAGE_KEYS.timeTravelTargetYear)
}

const setTimeTravelToYear = (targetYear) => {
  const year = Number(targetYear)
  if (!Number.isInteger(year) || year < 1970 || year > 9999) {
    throw new Error('setTimeTravelToYear requires a four-digit year')
  }
  globalThis.localStorage.setItem(
    STORAGE_KEYS.timeTravelTargetYear,
    String(year)
  )
  return year
}

const seedDemoData = () => {
  const localVersion = Number(
    globalThis.localStorage.getItem(STORAGE_KEYS.seedVersion) ?? '0'
  )
  if (localVersion >= seedData.seedVersion) return false

  const producersByEmail = readMap(STORAGE_KEYS.producers)
  for (const producer of seedData.producers) {
    if (!producersByEmail[producer.contactEmail]) {
      producersByEmail[producer.contactEmail] = producer
    }
  }
  writeJson(STORAGE_KEYS.producers, producersByEmail)
  globalThis.localStorage.setItem(
    STORAGE_KEYS.seedVersion,
    String(seedData.seedVersion)
  )
  return true
}

export const storage = {
  getCurrentUser,
  setCurrentUser,
  signOut,
  getProducerByEmail,
  saveProducer,
  getRegistration,
  listRegistrationsForProducer,
  saveRegistration,
  getSubmission,
  listSubmissionsForRegistration,
  saveSubmission,
  createPayment,
  completePayment,
  getPayment,
  searchPublicRegister,
  getPublicProducer,
  allocateBprn,
  resetAllData,
  seedDemoData,
  setTimeTravelToYear,
  getTimeTravelTargetYear,
  clearTimeTravel
}
