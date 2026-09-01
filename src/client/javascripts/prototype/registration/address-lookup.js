const byTestId = (doc, testId) => doc.querySelector(`[data-testid="${testId}"]`)

export const fakeAddressesFor = (postcode) => [
  { line1: '2 Elm Court, Riverside Way', town: 'Leeds', postcode },
  { line1: '14 Harbour Street', town: 'Leeds', postcode },
  { line1: 'Unit 3, Millworks Yard', town: 'Leeds', postcode }
]

export const wireAddressLookup = (doc) => {
  const findButton = byTestId(doc, 'details-find-address')
  if (!findButton) return false

  const select = byTestId(doc, 'details-address-select')

  findButton.addEventListener('click', () => {
    const postcode = byTestId(doc, 'details-postcode').value.trim()
    if (!postcode) return

    const addresses = fakeAddressesFor(postcode)
    select.innerHTML = ''
    addresses.forEach((address, index) => {
      const option = doc.createElement('option')
      option.value = String(index)
      option.textContent = `${address.line1}, ${address.town}, ${address.postcode}`
      select.appendChild(option)
    })
    byTestId(doc, 'details-address-select-wrapper').hidden = false

    const applyChoice = () => {
      const chosen = addresses[Number(select.value)]
      byTestId(doc, 'details-address-line1').value = chosen.line1
      byTestId(doc, 'details-address-town').value = chosen.town
    }
    select.onchange = applyChoice
    applyChoice()
  })

  byTestId(doc, 'details-manual-link').addEventListener('click', (event) => {
    event.preventDefault()
    byTestId(doc, 'details-manual-address').hidden = false
  })

  return true
}
