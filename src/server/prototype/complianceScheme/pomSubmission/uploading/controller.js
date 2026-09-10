import { paths } from '../../../../../config/paths.js'
import {
  prototypeComplianceSchemeContent,
  PROTOTYPE_COMPLIANCE_SCHEME_NAME
} from '../../../../../config/prototype-compliance-scheme-content.js'
import { taskFlowPageModel } from '../shared.js'

const pathFor = (path, { year, quarter }) =>
  path.replace('{year}', year).replace('{quarter}', quarter)

const filenameFor = (year, quarter) => {
  const token = PROTOTYPE_COMPLIANCE_SCHEME_NAME.split(' ')[0]
  return `${token}_Q${quarter}_${year}.csv`
}

const NEXT_STEP_PATHS = {
  success: 'prototypeComplianceSchemeSubmissionUploadSuccess',
  errors: 'prototypeComplianceSchemeSubmissionErrors'
}

export const uploadingController = {
  handler(request, h) {
    const { year, quarter } = request.params
    const pageContent = prototypeComplianceSchemeContent.uploading
    const nextPathKey =
      NEXT_STEP_PATHS[request.query.next] ?? NEXT_STEP_PATHS.errors
    const nextStep = pathFor(paths[nextPathKey], { year, quarter })
    const filename = filenameFor(year, quarter)
    const checkingBody = pageContent.checkingBodyTemplate.replace(
      '{filename}',
      filename
    )

    return h.view('prototype/complianceScheme/pomSubmission/uploading/view', {
      ...taskFlowPageModel(pageContent),
      caption: `${year} ${pageContent.complianceCaption}`,
      checkingBody,
      nextStep,
      pagePayload: {
        target: 'auto-advance',
        nextStep
      }
    })
  }
}
