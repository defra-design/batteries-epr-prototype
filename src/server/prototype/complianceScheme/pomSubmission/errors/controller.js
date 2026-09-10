import { createRequire } from 'node:module'

import { paths } from '../../../../../config/paths.js'
import { prototypeComplianceSchemeContent } from '../../../../../config/prototype-compliance-scheme-content.js'
import { taskFlowPageModel } from '../shared.js'

const seedData = createRequire(import.meta.url)(
  '../../../../../client/javascripts/storage-seed.json'
)

const pathFor = (path, { year, quarter }) =>
  path.replace('{year}', year).replace('{quarter}', quarter)

const filenameFor = (year, quarter) => {
  const [member] = seedData.prototypeComplianceSchemeMembers
  const token = member.companyName.split(' ')[0]
  return `${token}_Q${quarter}_${year}.csv`
}

export const errorsController = {
  get: {
    handler(request, h) {
      const { year, quarter } = request.params
      const pageContent = prototypeComplianceSchemeContent.errors
      const filename = filenameFor(year, quarter)
      const errors = seedData.prototypeComplianceSchemeUploadErrors

      const errorRows = errors.map((error) => [
        { text: error.error },
        { text: String(error.row) },
        { text: error.column },
        { text: error.howToFix }
      ])

      return h.view('prototype/complianceScheme/pomSubmission/errors/view', {
        ...taskFlowPageModel(pageContent),
        caption: `${year} ${pageContent.complianceCaption}`,
        backLink: pathFor(paths.prototypeComplianceSchemeSubmissionBulkUpload, {
          year,
          quarter
        }),
        errorSummaryTitle: `${errors.length} errors found in ${filename}`,
        errorRows,
        action: pathFor(paths.prototypeComplianceSchemeSubmissionErrors, {
          year,
          quarter
        })
      })
    }
  },

  post: {
    handler(request, h) {
      const { year, quarter } = request.params

      const uploadingUrl = pathFor(
        paths.prototypeComplianceSchemeSubmissionUploading,
        { year, quarter }
      )

      return h.redirect(`${uploadingUrl}?next=success`)
    }
  }
}
