import { createRequire } from 'node:module'
import Boom from '@hapi/boom'

import { paths, pathTo } from '../../../../../config/paths.js'
import { prototypeRegulatorContent } from '../../../../../config/prototype-regulator-content.js'
import {
  basePageModel,
  SCHEMES_WITH_DETAIL_SCREENS_BUILT,
  findSubmission,
  formatDateOnly,
  formatDateTime
} from '../shared.js'

const seedData = createRequire(import.meta.url)(
  '../../../../../client/javascripts/storage-seed.json'
)

export const submissionFileController = {
  handler(request, h) {
    const { schemeId, year, quarter, fileId } = request.params

    if (!SCHEMES_WITH_DETAIL_SCREENS_BUILT.has(schemeId)) {
      throw Boom.notFound()
    }

    const submission = findSubmission(schemeId, year, quarter)
    if (!submission) {
      throw Boom.notFound()
    }

    const file = seedData.prototypeRegulatorSubmissionFiles.find(
      (f) => f.id === fileId && f.submissionId === submission.id
    )
    // Only files with warnings have been read from Figma so far — every
    // other file's row is a dead "Open" link until it's built.
    if (!file || file.checkStatus !== 'warnings') {
      throw Boom.notFound()
    }

    const pageContent = prototypeRegulatorContent.submissionFile

    return h.view('prototype/regulator/pomSubmission/submissionFile/view', {
      ...basePageModel(
        { ...pageContent, heading: file.fileName },
        paths.prototypeRegulatorPomSubmissionDashboard
      ),
      backLink: pathTo(paths.prototypeRegulatorPomSubmissionSubmissionFiles, {
        schemeId,
        year,
        quarter
      }),
      file,
      memberLine: `${file.memberName} (${file.memberBprn})`,
      warningsTagText: pageContent.warningsTag.replace(
        '{count}',
        file.warningsCount
      ),
      intro: pageContent.introWithWarningsTemplate
        .replace('{members}', `${file.membersCovered} member`)
        .replace('{rows}', file.rows)
        .replace('{warningsCount}', file.warningsCount),
      uploadedOnLine: formatDateTime(file.uploadedOn),
      checkedByLine: `${file.checkedBy}, ${formatDateOnly(file.checkedOn)}`,
      resultLine: pageContent.resultWithWarningsTemplate.replace(
        '{count}',
        file.warningsCount
      ),
      viewAllRowsText: pageContent.viewAllRowsTemplate.replace(
        '{count}',
        file.rows
      ),
      backToFilesHref: pathTo(
        paths.prototypeRegulatorPomSubmissionSubmissionFiles,
        { schemeId, year, quarter }
      )
    })
  }
}
