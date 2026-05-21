import seedData from '../storage-seed.json'

export const seededApprovedScheme = () =>
  seedData.schemes.find((s) => s.approvalStatus === 'approved')
