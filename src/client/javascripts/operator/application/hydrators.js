const fromAddress = (address) => ({
  line1: address?.line1 ?? '',
  line2: address?.line2 ?? '',
  town: address?.town ?? '',
  postcode: address?.postcode ?? ''
})

export const HYDRATORS = {
  'operator-details': (operator) => ({
    name: operator.name ?? '',
    approvalType: operator.approvalType ?? '',
    companyRegistrationNo: operator.companyRegistrationNo ?? ''
  }),
  'registered-address': (operator) => fromAddress(operator.registeredAddress),
  'site-details': (operator) => {
    const site = operator.sites?.[0]
    return {
      siteName: site?.name ?? '',
      siteLine1: site?.address?.line1 ?? '',
      siteTown: site?.address?.town ?? '',
      sitePostcode: site?.address?.postcode ?? '',
      isPortable: site?.batteryTypes?.isPortable ? 'yes' : '',
      isIndustrial: site?.batteryTypes?.isIndustrial ? 'yes' : '',
      isAutomotive: site?.batteryTypes?.isAutomotive ? 'yes' : '',
      operationsDescription: site?.operationsDescription ?? ''
    }
  },
  declaration: (operator) => ({
    declarationAccepted:
      operator.approvalStatus === 'submitted' ||
      operator.approvalStatus === 'approved'
        ? 'yes'
        : ''
  })
}
