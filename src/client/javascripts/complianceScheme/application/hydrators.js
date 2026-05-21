const joinLines = (list) =>
  Array.isArray(list) ? list.filter(Boolean).join('\n') : ''

const partnerNames = (list) =>
  Array.isArray(list) ? list.map((p) => p.name).filter(Boolean).join('\n') : ''

const fileNames = (list) =>
  Array.isArray(list) ? list.map((f) => f.name).filter(Boolean).join('\n') : ''

const fromAddress = (address) => ({
  line1: address?.line1 ?? '',
  line2: address?.line2 ?? '',
  town: address?.town ?? '',
  postcode: address?.postcode ?? ''
})

export const HYDRATORS = {
  'scheme-details': (scheme) => ({
    name: scheme.name ?? '',
    tradingNames: joinLines(scheme.tradingNames)
  }),
  'registered-address': (scheme) => fromAddress(scheme.registeredAddress),
  'contact-address': (scheme) => fromAddress(scheme.contactAddress),
  'operational-plan': (scheme) => ({
    operationalPlan: scheme.operationalPlan ?? ''
  }),
  partners: (scheme) => ({ partners: partnerNames(scheme.partners) }),
  offences: (scheme) => ({
    hasOffences: scheme.offences ? 'yes' : '',
    offencesDetail: scheme.offences ?? ''
  }),
  'additional-files': (scheme) => ({
    additionalFiles: fileNames(scheme.additionalFiles)
  }),
  declaration: (scheme) => ({
    declarationAccepted:
      scheme.approvalStatus === 'submitted' ||
      scheme.approvalStatus === 'approved'
        ? 'yes'
        : ''
  })
}
