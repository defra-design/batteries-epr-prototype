import { niContent } from '../../../../config/ni-content.js'
import { paths } from '../../../../config/paths.js'
import { getCompliancePeriod } from '../../../../config/compliance-period.js'
import { readData, saveData } from '../shared.js'

const allocateReference = (request) => {
  const data = readData(request)
  if (data.reference) return data.reference

  const reference = `NI-AR-${Math.floor(Math.random() * 900000) + 100000}`
  saveData(request, { reference })
  return reference
}

export const confirmationController = {
  handler(request, h) {
    const pageContent = niContent.annualReturn.confirmation
    const reference = allocateReference(request)
    const period = getCompliancePeriod(request)

    return h.view('ni/annualReturn/confirmation/view', {
      pageTitle: pageContent.title,
      labels: pageContent,
      reference,
      period,
      persistPayload: {
        ...readData(request),
        period,
        status: 'Submitted'
      },
      dashboardUrl: paths.niDashboard
    })
  }
}
