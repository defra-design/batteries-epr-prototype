import fakeCompanies from '../../../config/fake-companies.json'

export const lookupCompany = (registrationNo) => {
  const trimmed = String(registrationNo ?? '').trim()
  if (!/^\d{8}$/.test(trimmed)) return null
  return (
    fakeCompanies.companies.find((c) => c.companyRegistrationNo === trimmed) ??
    null
  )
}
