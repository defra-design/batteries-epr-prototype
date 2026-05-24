import seedData from './storage-seed.json'

const KEY_PREFIX = 'npwd-batteries:'

export const STORAGE_KEYS = {
  currentUser: `${KEY_PREFIX}currentUser`,
  producers: `${KEY_PREFIX}producers`,
  registrations: `${KEY_PREFIX}registrations`,
  submissions: `${KEY_PREFIX}submissions`,
  payments: `${KEY_PREFIX}payments`,
  schemes: `${KEY_PREFIX}schemes`,
  schemeMembers: `${KEY_PREFIX}schemeMembers`,
  quarterlySubmissions: `${KEY_PREFIX}quarterlySubmissions`,
  iaSubmissions: `${KEY_PREFIX}iaSubmissions`,
  evidence: `${KEY_PREFIX}evidence`,
  seedVersion: `${KEY_PREFIX}seed-version`,
  timeTravelTargetYear: `${KEY_PREFIX}time-travel-target-year`,
  currentSchemeId: `${KEY_PREFIX}currentSchemeId`
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

export const createScheme = (input = {}) => ({
  id: input.id ?? newId(),
  version: 0,
  name: input.name ?? null,
  tradingNames: input.tradingNames ?? [],
  approvalNumber: input.approvalNumber ?? null,
  approvalStatus: input.approvalStatus ?? 'not-started',
  approvedOn: input.approvedOn ?? null,
  submittedOn: input.submittedOn ?? null,
  registeredAddress: input.registeredAddress ?? null,
  contactAddress: input.contactAddress ?? null,
  serviceOfNoticeAddress: input.serviceOfNoticeAddress ?? null,
  operationalPlan: input.operationalPlan ?? null,
  partners: input.partners ?? [],
  offences: input.offences ?? null,
  additionalFiles: input.additionalFiles ?? [],
  evidenceAvailable: input.evidenceAvailable ?? false,
  agencyCode: input.agencyCode ?? null,
  compliancePeriod: input.compliancePeriod ?? null,
  operator: input.operator ?? null,
  contactEmail: input.contactEmail ?? null,
  webAddress: input.webAddress ?? null,
  createdAt: input.createdAt ?? now(),
  updatedAt: input.updatedAt ?? now()
})

export const createSchemeMember = (input = {}) => ({
  id: input.id ?? newId(),
  version: 0,
  schemeId: input.schemeId ?? null,
  producerBprn: input.producerBprn ?? null,
  producerEmail: input.producerEmail ?? null,
  companyName: input.companyName ?? null,
  compliancePeriod: input.compliancePeriod ?? null,
  status: input.status ?? 'active',
  joinedOn: input.joinedOn ?? now(),
  acceptedOn: input.acceptedOn ?? null,
  leftOn: input.leftOn ?? null,
  reasonForLeaving: input.reasonForLeaving ?? null,
  replacedById: input.replacedById ?? null,
  createdAt: input.createdAt ?? now(),
  updatedAt: input.updatedAt ?? now()
})

export const createQuarterlySubmission = (input = {}) => ({
  id: input.id ?? newId(),
  version: 0,
  schemeId: input.schemeId ?? null,
  compliancePeriodYear: input.compliancePeriodYear ?? null,
  quarter: input.quarter ?? null,
  status: input.status ?? 'not-started',
  memberData: input.memberData ?? [],
  submittedOn: input.submittedOn ?? null,
  createdAt: input.createdAt ?? now(),
  updatedAt: input.updatedAt ?? now()
})

export const createIaSubmission = (input = {}) => ({
  id: input.id ?? newId(),
  version: 0,
  schemeId: input.schemeId ?? null,
  compliancePeriodYear: input.compliancePeriodYear ?? null,
  status: input.status ?? 'not-started',
  memberData: input.memberData ?? [],
  submittedOn: input.submittedOn ?? null,
  createdAt: input.createdAt ?? now(),
  updatedAt: input.updatedAt ?? now()
})

export const createEvidence = (input = {}) => ({
  id: input.id ?? newId(),
  version: 0,
  schemeId: input.schemeId ?? null,
  compliancePeriodYear: input.compliancePeriodYear ?? null,
  recipientBprn: input.recipientBprn ?? null,
  recipientName: input.recipientName ?? null,
  tonnes: coerceTonnes(input.tonnes),
  category: input.category ?? null,
  status: input.status ?? 'awaiting-acceptance',
  issuedOn: input.issuedOn ?? now(),
  transferDirection: input.transferDirection ?? null,
  counterpartySchemeId: input.counterpartySchemeId ?? null,
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

const findRepresentingSchemeForProducer = (producerId) => {
  const registrations = Object.values(readMap(STORAGE_KEYS.registrations))
    .filter(
      (r) =>
        r.producerId === producerId &&
        r.producerRoute === 'complianceScheme' &&
        r.schemeId
    )
    .sort((a, b) => String(b.compliancePeriod).localeCompare(a.compliancePeriod))
  if (registrations.length === 0) return null
  return getScheme(registrations[0].schemeId)
}

const matchesSearch = (producer, scheme, { q, bprn, postcode }) => {
  if (bprn && producer.bprn !== bprn) return false
  if (q) {
    const needle = q.toLowerCase()
    const company = String(producer.companyName ?? '').toLowerCase()
    const schemeName = String(scheme?.name ?? '').toLowerCase()
    if (!company.includes(needle) && !schemeName.includes(needle)) return false
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
  const withScheme = producers
    .filter((p) => p.bprn)
    .filter((p) => p.status === 'Active' || p.status === 'Approved')
    .map((p) => ({ producer: p, scheme: findRepresentingSchemeForProducer(p.id) }))
    .filter(({ producer, scheme }) =>
      matchesSearch(producer, scheme, { q, bprn, postcode })
    )
    .sort((a, b) =>
      String(a.producer.companyName ?? '').localeCompare(
        String(b.producer.companyName ?? '')
      )
    )

  const totalCount = withScheme.length
  const totalPages = Math.max(1, Math.ceil(totalCount / PUBLIC_PAGE_SIZE))
  const safePage = Math.min(Math.max(1, page), totalPages)
  const start = (safePage - 1) * PUBLIC_PAGE_SIZE
  const items = withScheme
    .slice(start, start + PUBLIC_PAGE_SIZE)
    .map(({ producer: p, scheme }) => ({
      bprn: p.bprn,
      companyName: p.companyName,
      registeredAddress: p.registeredAddress,
      batteryTypes: p.batteryTypes,
      brandNames: p.brandNames,
      representedBy: scheme?.name ?? null
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
  if (!bprn) return null
  const producers = Object.values(readMap(STORAGE_KEYS.producers))
  const producer = producers.find((p) => p.bprn === bprn)
  if (!producer) return null
  const scheme = findRepresentingSchemeForProducer(producer.id)
  return {
    bprn: producer.bprn,
    companyName: producer.companyName,
    registeredAddress: producer.registeredAddress,
    batteryTypes: producer.batteryTypes,
    brandNames: producer.brandNames,
    scheme: scheme
      ? {
          name: scheme.name,
          operator: scheme.operator,
          approvalNumber: scheme.approvalNumber
        }
      : null
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

const listSchemes = () => Object.values(readMap(STORAGE_KEYS.schemes))

const getSchemes = ({
  agencyCode,
  compliancePeriod,
  status = 'approved'
} = {}) =>
  listSchemes().filter(
    (s) =>
      (!status || s.approvalStatus === status) &&
      (!agencyCode || s.agencyCode === agencyCode) &&
      (!compliancePeriod || s.compliancePeriod === compliancePeriod)
  )

const getScheme = (id) => readMap(STORAGE_KEYS.schemes)[id] ?? null

const getSchemeById = (id) => getScheme(id)

const getCurrentSchemeId = () =>
  globalThis.localStorage.getItem(STORAGE_KEYS.currentSchemeId)

const setCurrentSchemeId = (id) => {
  globalThis.localStorage.setItem(STORAGE_KEYS.currentSchemeId, id)
}

const clearCurrentSchemeId = () => {
  globalThis.localStorage.removeItem(STORAGE_KEYS.currentSchemeId)
}

const currentScheme = () => {
  const id = getCurrentSchemeId()
  return id ? getScheme(id) : null
}

const saveScheme = (scheme) => {
  const schemes = readMap(STORAGE_KEYS.schemes)
  const existing = scheme.id ? schemes[scheme.id] : null
  const merged = {
    ...scheme,
    id: existing?.id ?? scheme.id ?? newId(),
    ...stamp(existing, !existing)
  }
  schemes[merged.id] = merged
  writeJson(STORAGE_KEYS.schemes, schemes)
  return merged
}

const listSchemeMembers = (schemeId) => {
  const members = Object.values(readMap(STORAGE_KEYS.schemeMembers))
  return schemeId ? members.filter((m) => m.schemeId === schemeId) : members
}

const listActiveSchemeMembers = (schemeId) =>
  listSchemeMembers(schemeId).filter(
    (m) => m.leftOn === null && m.status === 'active'
  )

const listPendingSchemeMembers = (schemeId) =>
  listSchemeMembers(schemeId).filter(
    (m) => m.status === 'pendingAcceptance'
  )

const yearOf = (iso) => Number(String(iso).slice(0, 4))

const membersForYear = (schemeId, compliancePeriodYear) => {
  const year = Number(compliancePeriodYear)
  const all = listSchemeMembers(schemeId).filter(
    (m) =>
      yearOf(m.joinedOn) <= year && m.status !== 'pendingAcceptance'
  )
  const active = all.filter(
    (m) => m.leftOn === null || yearOf(m.leftOn) > year
  )
  const history = all.filter(
    (m) => m.leftOn !== null && yearOf(m.leftOn) <= year
  )
  return { active, history }
}

const listMembershipsForProducer = (producerBprn) =>
  Object.values(readMap(STORAGE_KEYS.schemeMembers)).filter(
    (m) => m.producerBprn === producerBprn
  )

const getSchemeMembershipHistory = (producerBprn) =>
  listMembershipsForProducer(producerBprn).sort((a, b) =>
    b.joinedOn.localeCompare(a.joinedOn)
  )

const getActiveSchemeMembership = (producerBprn, compliancePeriod) =>
  listMembershipsForProducer(producerBprn).find(
    (m) =>
      m.leftOn === null &&
      m.status === 'active' &&
      (!compliancePeriod || m.compliancePeriod === compliancePeriod)
  ) ?? null

const saveSchemeMember = (member) => {
  const members = readMap(STORAGE_KEYS.schemeMembers)
  const existing = member.id ? members[member.id] : null
  const merged = {
    ...member,
    id: existing?.id ?? member.id ?? newId(),
    ...stamp(existing, !existing)
  }
  members[merged.id] = merged
  writeJson(STORAGE_KEYS.schemeMembers, members)
  return merged
}

const findOpenMembership = (predicate) =>
  Object.values(readMap(STORAGE_KEYS.schemeMembers)).find(
    (m) => m.leftOn === null && predicate(m)
  ) ?? null

const joinScheme = ({
  producerBprn,
  producerEmail = null,
  schemeId,
  compliancePeriod,
  companyName = null,
  status = 'active'
}) => {
  const matchByBprn =
    producerBprn &&
    findOpenMembership(
      (m) =>
        m.producerBprn === producerBprn &&
        m.compliancePeriod === compliancePeriod
    )
  const matchByEmail =
    !matchByBprn &&
    producerEmail &&
    findOpenMembership(
      (m) =>
        m.producerEmail === producerEmail &&
        m.compliancePeriod === compliancePeriod
    )
  const existing = matchByBprn || matchByEmail
  if (existing && existing.schemeId === schemeId) return existing
  return saveSchemeMember(
    createSchemeMember({
      producerBprn,
      producerEmail,
      schemeId,
      compliancePeriod,
      companyName,
      status,
      joinedOn: now(),
      acceptedOn: status === 'active' ? now() : null
    })
  )
}

const leaveScheme = ({
  producerBprn,
  compliancePeriod,
  reasonForLeaving = null
}) => {
  const active = getActiveSchemeMembership(producerBprn, compliancePeriod)
  if (!active) return null
  return saveSchemeMember({
    ...active,
    leftOn: now(),
    reasonForLeaving
  })
}

const acceptSchemeMember = (memberId, { agencyCode = 'EA' } = {}) => {
  const members = readMap(STORAGE_KEYS.schemeMembers)
  const member = members[memberId]
  if (!member || member.status !== 'pendingAcceptance') return null

  let bprn = member.producerBprn
  if (!bprn) {
    const producer = member.producerEmail
      ? getProducerByEmail(member.producerEmail)
      : null
    const allocAgency = producer?.agencyCode ?? agencyCode
    bprn = allocateBprn({
      agencyCode: allocAgency,
      compliancePeriod: member.compliancePeriod
    })
    if (producer) {
      saveProducer({
        ...producer,
        bprn,
        agencyCode: allocAgency,
        bprnAllocatedAt: now(),
        status: 'Approved'
      })
      const registrations = listRegistrationsForProducer(producer.id).filter(
        (r) => r.compliancePeriod === member.compliancePeriod
      )
      for (const reg of registrations) {
        saveRegistration({ ...reg, status: 'Submitted' })
      }
    }
  }

  return saveSchemeMember({
    ...member,
    producerBprn: bprn,
    status: 'active',
    acceptedOn: now()
  })
}

const transitionToDirect = ({
  producerEmail,
  compliancePeriod,
  reasonForLeaving,
  otherReason = null
}) => {
  const producer = getProducerByEmail(producerEmail)
  if (!producer) return null
  const oldRegistration = listRegistrationsForProducer(producer.id).find(
    (r) =>
      r.compliancePeriod === compliancePeriod &&
      r.producerRoute === 'complianceScheme' &&
      r.status !== 'superseded'
  )
  if (!oldRegistration) return null

  const codedReason =
    reasonForLeaving === 'other' && otherReason
      ? `other:${otherReason}`
      : reasonForLeaving
  leaveScheme({
    producerBprn: producer.bprn,
    compliancePeriod,
    reasonForLeaving: codedReason
  })

  saveRegistration({ ...oldRegistration, status: 'superseded' })

  const reusedBprn =
    producer.bprn ??
    allocateBprn({
      agencyCode: producer.agencyCode ?? 'EA',
      compliancePeriod
    })

  const updatedProducer = saveProducer({
    ...producer,
    bprn: reusedBprn,
    bprnAllocatedAt: producer.bprnAllocatedAt ?? now(),
    status: 'Approved'
  })

  const newRegistration = saveRegistration({
    producerId: producer.id,
    compliancePeriod,
    producerRoute: 'directRegistrant',
    status: 'Submitted',
    submittedAt: now(),
    replacesId: oldRegistration.id,
    schemeId: null
  })

  return {
    producer: updatedProducer,
    registration: newRegistration,
    bprn: reusedBprn
  }
}

const rejectSchemeMember = (memberId, reasonForLeaving = null) => {
  const members = readMap(STORAGE_KEYS.schemeMembers)
  const member = members[memberId]
  if (!member || member.status !== 'pendingAcceptance') return null
  return saveSchemeMember({
    ...member,
    status: 'rejected',
    leftOn: now(),
    reasonForLeaving
  })
}

const listQuarterlySubmissions = (schemeId, compliancePeriodYear) => {
  const items = Object.values(readMap(STORAGE_KEYS.quarterlySubmissions))
  return items.filter(
    (s) =>
      (!schemeId || s.schemeId === schemeId) &&
      (!compliancePeriodYear || s.compliancePeriodYear === compliancePeriodYear)
  )
}

const saveQuarterlySubmission = (submission) => {
  const items = readMap(STORAGE_KEYS.quarterlySubmissions)
  const existing = submission.id ? items[submission.id] : null
  const merged = {
    ...submission,
    id: existing?.id ?? submission.id ?? newId(),
    ...stamp(existing, !existing)
  }
  items[merged.id] = merged
  writeJson(STORAGE_KEYS.quarterlySubmissions, items)
  return merged
}

const findQuarterlySubmission = (schemeId, compliancePeriodYear, quarter) =>
  listQuarterlySubmissions(schemeId, compliancePeriodYear).find(
    (s) => s.quarter === quarter
  ) ?? null

const upsertQuarterlySubmission = (
  schemeId,
  compliancePeriodYear,
  quarter,
  patch
) => {
  const existing = findQuarterlySubmission(
    schemeId,
    compliancePeriodYear,
    quarter
  )
  return saveQuarterlySubmission({
    ...(existing ?? {
      schemeId,
      compliancePeriodYear,
      quarter,
      status: 'in-progress'
    }),
    ...patch
  })
}

const listIaSubmissions = (schemeId, compliancePeriodYear) => {
  const items = Object.values(readMap(STORAGE_KEYS.iaSubmissions))
  return items.filter(
    (s) =>
      (!schemeId || s.schemeId === schemeId) &&
      (!compliancePeriodYear || s.compliancePeriodYear === compliancePeriodYear)
  )
}

const saveIaSubmission = (submission) => {
  const items = readMap(STORAGE_KEYS.iaSubmissions)
  const existing = submission.id ? items[submission.id] : null
  const merged = {
    ...submission,
    id: existing?.id ?? submission.id ?? newId(),
    ...stamp(existing, !existing)
  }
  items[merged.id] = merged
  writeJson(STORAGE_KEYS.iaSubmissions, items)
  return merged
}

const findIaSubmission = (schemeId, compliancePeriodYear) =>
  listIaSubmissions(schemeId, compliancePeriodYear)[0] ?? null

const upsertIaSubmission = (schemeId, compliancePeriodYear, patch) => {
  const existing = findIaSubmission(schemeId, compliancePeriodYear)
  return saveIaSubmission({
    ...(existing ?? {
      schemeId,
      compliancePeriodYear,
      status: 'in-progress'
    }),
    ...patch
  })
}

const emptyQuarterlyMemberEntry = (member) => ({
  memberId: member.id,
  producerBprn: member.producerBprn,
  companyName: member.companyName,
  marketData: null,
  wasteData: null
})

const emptyIaMemberEntry = (member) => ({
  memberId: member.id,
  producerBprn: member.producerBprn,
  companyName: member.companyName,
  placed: null,
  exported: null,
  takenBack: null,
  delivered: null
})

const initQuarterlyMemberData = (schemeId, compliancePeriodYear, quarter) => {
  const submission = findQuarterlySubmission(
    schemeId,
    compliancePeriodYear,
    quarter
  )
  const { active } = membersForYear(schemeId, compliancePeriodYear)
  const existing = submission?.memberData ?? []
  const memberData = active.map((member) => {
    const found = existing.find((e) => e.memberId === member.id)
    return found ?? emptyQuarterlyMemberEntry(member)
  })
  return upsertQuarterlySubmission(schemeId, compliancePeriodYear, quarter, {
    memberData
  })
}

const upsertQuarterlyMemberTonnage = (
  schemeId,
  compliancePeriodYear,
  quarter,
  memberId,
  patch
) => {
  const submission = findQuarterlySubmission(
    schemeId,
    compliancePeriodYear,
    quarter
  )
  if (!submission) return null
  /* v8 ignore next */
  const memberData = (submission.memberData ?? []).map((entry) =>
    entry.memberId === memberId ? { ...entry, ...patch } : entry
  )
  return upsertQuarterlySubmission(schemeId, compliancePeriodYear, quarter, {
    memberData
  })
}

const initIaMemberData = (schemeId, compliancePeriodYear) => {
  const submission = findIaSubmission(schemeId, compliancePeriodYear)
  const { active } = membersForYear(schemeId, compliancePeriodYear)
  const existing = submission?.memberData ?? []
  const memberData = active.map((member) => {
    const found = existing.find((e) => e.memberId === member.id)
    return found ?? emptyIaMemberEntry(member)
  })
  return upsertIaSubmission(schemeId, compliancePeriodYear, { memberData })
}

const upsertIaMemberTonnage = (
  schemeId,
  compliancePeriodYear,
  memberId,
  patch
) => {
  const submission = findIaSubmission(schemeId, compliancePeriodYear)
  if (!submission) return null
  /* v8 ignore next */
  const memberData = (submission.memberData ?? []).map((entry) =>
    entry.memberId === memberId ? { ...entry, ...patch } : entry
  )
  return upsertIaSubmission(schemeId, compliancePeriodYear, { memberData })
}

const listEvidence = (schemeId, compliancePeriodYear) => {
  const items = Object.values(readMap(STORAGE_KEYS.evidence))
  return items.filter(
    (e) =>
      (!schemeId || e.schemeId === schemeId) &&
      (!compliancePeriodYear || e.compliancePeriodYear === compliancePeriodYear)
  )
}

const findEvidence = (id) => readMap(STORAGE_KEYS.evidence)[id] ?? null

const saveEvidence = (evidence) => {
  const items = readMap(STORAGE_KEYS.evidence)
  const existing = evidence.id ? items[evidence.id] : null
  const merged = {
    ...evidence,
    id: existing?.id ?? evidence.id ?? newId(),
    tonnes: coerceTonnes(evidence.tonnes),
    ...stamp(existing, !existing)
  }
  items[merged.id] = merged
  writeJson(STORAGE_KEYS.evidence, items)
  return merged
}

const updateEvidenceStatus = (id, status) => {
  const existing = findEvidence(id)
  if (!existing) return null
  return saveEvidence({ ...existing, status })
}

const transferEvidence = (id, counterpartySchemeId) => {
  const existing = findEvidence(id)
  if (!existing) return null
  return saveEvidence({
    ...existing,
    transferDirection: 'XOUT',
    counterpartySchemeId,
    status: 'awaiting-authorisation'
  })
}

const setEvidenceAvailability = (schemeId, evidenceAvailable) => {
  const scheme = getScheme(schemeId)
  if (!scheme) return null
  return saveScheme({ ...scheme, evidenceAvailable })
}

const sumByCategory = (evidenceItems) => {
  const totals = { portable: 0, industrial: 0, automotive: 0 }
  for (const item of evidenceItems) {
    if (totals[item.category] !== undefined) {
      totals[item.category] += Number(item.tonnes) || 0
    }
  }
  return totals
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

  const schemes = readMap(STORAGE_KEYS.schemes)
  for (const scheme of seedData.schemes) {
    if (!schemes[scheme.id]) schemes[scheme.id] = scheme
  }
  writeJson(STORAGE_KEYS.schemes, schemes)

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
  clearTimeTravel,
  listSchemes,
  getSchemes,
  getScheme,
  getSchemeById,
  getCurrentSchemeId,
  setCurrentSchemeId,
  clearCurrentSchemeId,
  currentScheme,
  saveScheme,
  listSchemeMembers,
  listActiveSchemeMembers,
  listPendingSchemeMembers,
  membersForYear,
  saveSchemeMember,
  getActiveSchemeMembership,
  getSchemeMembershipHistory,
  joinScheme,
  leaveScheme,
  acceptSchemeMember,
  rejectSchemeMember,
  transitionToDirect,
  listQuarterlySubmissions,
  saveQuarterlySubmission,
  findQuarterlySubmission,
  upsertQuarterlySubmission,
  listIaSubmissions,
  saveIaSubmission,
  findIaSubmission,
  upsertIaSubmission,
  initQuarterlyMemberData,
  upsertQuarterlyMemberTonnage,
  initIaMemberData,
  upsertIaMemberTonnage,
  listEvidence,
  findEvidence,
  saveEvidence,
  updateEvidenceStatus,
  transferEvidence,
  setEvidenceAvailability,
  sumByCategory
}
