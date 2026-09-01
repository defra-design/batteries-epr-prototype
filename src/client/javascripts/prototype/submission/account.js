export const renderAccountName = (doc, registration) => {
  if (!registration.organisationName) return false
  doc.querySelector('[data-testid="account-company-name"]').textContent =
    registration.organisationName
  return true
}
