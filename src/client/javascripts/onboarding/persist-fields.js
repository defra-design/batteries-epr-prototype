import { storage } from '../storage-adapter.js'
import { postcodeToAgency } from '../postcode-to-agency.js'

const findRegistration = (producerId, compliancePeriod) =>
  storage
    .listRegistrationsForProducer(producerId)
    .find((r) => r.compliancePeriod === compliancePeriod) ?? null

const ensureProducer = (email, baseFields = {}) => {
  const existing = storage.getProducerByEmail(email) ?? {}
  const merged = {
    ...existing,
    ...baseFields,
    contactEmail: email
  }
  if (merged.registeredAddress?.postcode) {
    merged.agencyCode = postcodeToAgency(merged.registeredAddress.postcode)
  }
  return storage.saveProducer(merged)
}

const ensureRegistration = (producer, compliancePeriod, baseFields = {}) => {
  const existing = findRegistration(producer.id, compliancePeriod)
  return storage.saveRegistration({
    ...(existing ?? {}),
    ...baseFields,
    producerId: producer.id,
    compliancePeriod
  })
}

export const persistProducerFields = (email, savedFields) => {
  const fields = { ...savedFields }
  if (fields.serviceOfNoticeAddressSameAsRegistered) {
    const existing = storage.getProducerByEmail(email)
    fields.serviceOfNoticeAddress = existing?.registeredAddress ?? null
    delete fields.serviceOfNoticeAddressSameAsRegistered
  }
  return ensureProducer(email, fields)
}

export const persistRegistrationFields = (
  email,
  compliancePeriod,
  savedFields
) => {
  const producer = storage.getProducerByEmail(email)
  if (!producer) return null
  return ensureRegistration(producer, compliancePeriod, savedFields)
}

export const submitRegistration = (email, compliancePeriod) => {
  const producer = storage.getProducerByEmail(email)
  if (!producer) return null

  let bprn = producer.bprn
  if (!bprn) {
    bprn = storage.allocateBprn({
      agencyCode: producer.agencyCode ?? 'EA',
      compliancePeriod
    })
    storage.saveProducer({
      ...producer,
      bprn,
      bprnAllocatedAt: new Date().toISOString()
    })
  }

  const refreshed = storage.getProducerByEmail(email)
  const registration = ensureRegistration(refreshed, compliancePeriod, {
    status: 'Submitted',
    submittedAt: new Date().toISOString()
  })
  return { producer: refreshed, registration }
}

export const readOnboardingState = (email, compliancePeriod) => {
  const producer = storage.getProducerByEmail(email) ?? {}
  const registration =
    producer && producer.id
      ? findRegistration(producer.id, compliancePeriod)
      : null

  const registered = producer.registeredAddress ?? {}
  const son = producer.serviceOfNoticeAddress ?? {}
  const contact = producer.primaryContact ?? {}
  const battery = producer.batteryTypes ?? {}
  const declaration = registration?.declaration ?? {}

  return {
    companyName: producer.companyName ?? '',
    tradingName: producer.tradingName ?? '',
    companyRegistrationNo: producer.companyRegistrationNo ?? '',
    webAddress: producer.webAddress ?? '',
    sicCode: producer.sicCode ?? '',
    line1: registered.line1 ?? '',
    line2: registered.line2 ?? '',
    town: registered.town ?? '',
    postcode: registered.postcode ?? '',
    sonChoice: producer.serviceOfNoticeAddress
      ? sameAddress(producer.registeredAddress, son)
        ? 'sameAsRegistered'
        : 'differentAddress'
      : '',
    sonLine1: son.line1 ?? '',
    sonLine2: son.line2 ?? '',
    sonTown: son.town ?? '',
    sonPostcode: son.postcode ?? '',
    firstName: contact.firstName ?? '',
    lastName: contact.lastName ?? '',
    position: contact.position ?? '',
    phone: contact.phone ?? '',
    email: contact.email ?? '',
    isPortable: Boolean(battery.isPortable),
    isIndustrial: Boolean(battery.isIndustrial),
    isAutomotive: Boolean(battery.isAutomotive),
    brandNamesText: (producer.brandNames ?? []).join('\n'),
    producerRoute: registration?.producerRoute ?? '',
    smallProducerSelfDeclare:
      registration?.producerRoute === 'smallProducer' ? 'yes' : '',
    declarationFirstName: declaration.firstName ?? '',
    declarationLastName: declaration.lastName ?? '',
    declarationPosition: declaration.position ?? '',
    declarationConfirm: declaration.declaredAt ? 'yes' : ''
  }
}

const sameAddress = (a, b) => {
  if (!a || !b) return false
  return (
    a.line1 === b.line1 &&
    a.line2 === b.line2 &&
    a.town === b.town &&
    a.postcode === b.postcode
  )
}
