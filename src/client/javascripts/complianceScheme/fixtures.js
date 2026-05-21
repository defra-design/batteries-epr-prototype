import seedData from '../storage-seed.json'

const findSchemeByStatus = (status) =>
  seedData.schemes.find((s) => s.approvalStatus === status)

export const seededApprovedScheme = () => findSchemeByStatus('approved')

export const seededNotStartedScheme = () => findSchemeByStatus('not-started')
