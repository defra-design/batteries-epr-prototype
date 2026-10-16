import { createRequire } from 'node:module'

const seedData = createRequire(import.meta.url)(
  '../../../../../../client/javascripts/storage-seed.json'
)

const SCHEME_ID = 'ironwave-compliance'

export const getSchemeRef = () =>
  seedData.prototypeRegulatorSchemes.find((scheme) => scheme.id === SCHEME_ID)
    .npwdRef

// The seeded compliance-scheme members carry no BPRN, so one is generated
// deterministically from the company registration number.
export const generateBprn = (companyRegistrationNo) =>
  `BPRN-${companyRegistrationNo.slice(-6)}`

export const listSelectableMembers = () =>
  seedData.prototypeComplianceSchemeMembers
    .filter((member) => member.status === 'active')
    .map((member) => ({
      id: member.id,
      name: member.companyName,
      bprn: generateBprn(member.companyRegistrationNo),
      schemeRef: getSchemeRef()
    }))
