import { niContent } from '../../../../config/ni-content.js'
import { paths } from '../../../../config/paths.js'
import { getCompliancePeriod } from '../../../../config/compliance-period.js'
import { readData, saveData } from '../shared.js'

const allocateBprn = (request) => {
  const data = readData(request)
  if (data.bprn) return data.bprn

  const bprn = `NIP${Math.floor(Math.random() * 9_000_000) + 1_000_000}`
  saveData(request, { bprn })
  return bprn
}

export const confirmationController = {
  handler(request, h) {
    const pageContent = niContent.onboarding.confirmation
    const bprn = allocateBprn(request)

    return h.view('ni/onboarding/confirmation/view', {
      pageTitle: pageContent.title,
      labels: pageContent,
      bprn,
      persistPayload: {
        ...readData(request),
        period: getCompliancePeriod(request),
        status: 'Registered'
      },
      dashboardUrl: paths.niDashboard
    })
  }
}
