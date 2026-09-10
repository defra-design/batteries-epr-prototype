import { paths } from '../../../../../config/paths.js'
import { prototypeComplianceSchemeContent } from '../../../../../config/prototype-compliance-scheme-content.js'
import { taskFlowPageModel } from '../shared.js'

const pathFor = (path, { year, quarter }) =>
  path.replace('{year}', year).replace('{quarter}', quarter)

const buildViewModel = (
  request,
  pageContent,
  { errorSummary = [], errors = {} } = {}
) => {
  const { year, quarter } = request.params

  return {
    ...taskFlowPageModel(pageContent),
    caption: `${year} ${pageContent.complianceCaption}`,
    backLink: pathFor(
      paths.prototypeComplianceSchemeSubmissionReportingMethod,
      { year, quarter }
    ),
    action: pathFor(paths.prototypeComplianceSchemeSubmissionBulkUpload, {
      year,
      quarter
    }),
    errorTitle: pageContent.error.title,
    errorSummary,
    errors
  }
}

const hasFile = (file) => Boolean(file?.hapi?.filename)

export const bulkUploadController = {
  get: {
    handler(request, h) {
      const pageContent = prototypeComplianceSchemeContent.bulkUpload

      return h.view(
        'prototype/complianceScheme/pomSubmission/bulkUpload/view',
        buildViewModel(request, pageContent)
      )
    }
  },

  post: {
    options: {
      payload: {
        output: 'stream',
        parse: true,
        multipart: true,
        allow: 'multipart/form-data',
        maxBytes: 10 * 1024 * 1024
      }
    },
    handler(request, h) {
      const pageContent = prototypeComplianceSchemeContent.bulkUpload

      if (!hasFile(request.payload?.batteryDataFile)) {
        const errorList = [
          { text: pageContent.error.message, href: '#batteryDataFile' }
        ]

        return h.view(
          'prototype/complianceScheme/pomSubmission/bulkUpload/view',
          buildViewModel(request, pageContent, {
            errorSummary: errorList,
            errors: { batteryDataFile: pageContent.error.message }
          })
        )
      }

      const { year, quarter } = request.params
      return h.redirect(
        pathFor(paths.prototypeComplianceSchemeSubmissionUploading, {
          year,
          quarter
        })
      )
    }
  }
}
