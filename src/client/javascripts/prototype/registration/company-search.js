import { lookupCompany } from '../../onboarding/companies-house-stub.js'

const byTestId = (doc, testId) => doc.querySelector(`[data-testid="${testId}"]`)

export const wireCompanySearch = (doc) => {
  const searchButton = byTestId(doc, 'companies-house-search')
  if (!searchButton) return false

  searchButton.addEventListener('click', () => {
    const numberInput = byTestId(doc, 'companies-house-number')
    const company = lookupCompany(numberInput.value)
    const result = byTestId(doc, 'companies-house-result')
    const notFound = byTestId(doc, 'companies-house-not-found')

    if (!company) {
      result.hidden = true
      notFound.hidden = false
      return
    }

    const address = company.registeredAddress
    byTestId(doc, 'companies-house-name').value = company.companyName
    byTestId(doc, 'companies-house-address-line1').value = address.line1
    byTestId(doc, 'companies-house-address-town').value = address.town
    byTestId(doc, 'companies-house-address-postcode').value = address.postcode
    byTestId(doc, 'companies-house-result-summary').textContent =
      `${company.companyName}, ${address.line1}, ${address.town}, ${address.postcode}`
    result.hidden = false
    notFound.hidden = true
  })

  return true
}
