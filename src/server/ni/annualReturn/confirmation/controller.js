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

    return h.view('ni/annualReturn/confirmation/view', {
      pageTitle: pageContent.title,
      labels: pageContent,
      reference: allocateReference(request),
      period: getCompliancePeriod(request),
      dashboardUrl: paths.niDashboard
    })
  }
}
