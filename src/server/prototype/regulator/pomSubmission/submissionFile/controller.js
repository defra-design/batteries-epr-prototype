import { createRequire } from 'node:module'
import Boom from '@hapi/boom'

import { paths, pathTo } from '../../../../../config/paths.js'
import { prototypeRegulatorContent } from '../../../../../config/prototype-regulator-content.js'
import {
  basePageModel,
  fill,
  findSubmission,
  formatDateOnly,
  formatDateTime,
  SCHEMES_WITH_DETAIL_SCREENS_BUILT
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
    // Only a file with flagged rows has an Open screen; the rest stay dead
    // links on the files list.
    if (!file || file.checkStatus !== 'warnings' || !file.flaggedRows) {
      throw Boom.notFound()
    }

    const labels = prototypeRegulatorContent.submissionFile
    const count = file.flaggedRows.length
    const filesHref = pathTo(
      paths.prototypeRegulatorPomSubmissionSubmissionFiles,
      { schemeId, year, quarter }
    )
    const row = (key, value) => ({ key: { text: key }, value: { text: value } })

    return h.view('prototype/regulator/pomSubmission/submissionFile/view', {
      ...basePageModel(
        {
          ...labels,
          heading: file.fileName,
          intro: fill(labels.intro, {
            members: `${file.membersCovered}`,
            rows: file.rows,
            count
          })
        },
        {
          backLink: {
            href: paths.prototypeRegulatorPomSubmissionDashboard,
            text: labels.backLink
          },
          headingTag: {
            text: fill(labels.tag.text, { count }),
            colour: labels.tag.colour
          }
        }
      ),
      summaryRows: [
        row(labels.summary.member, `${file.memberName} (${file.memberBprn})`),
        row(labels.summary.rows, String(file.rows)),
        row(labels.summary.uploaded, formatDateTime(file.uploadedOn)),
        row(
          labels.summary.checkedBy,
          `${file.checkedBy}, ${formatDateOnly(file.checkedOn)}`
        ),
        row(labels.summary.result, fill(labels.resultValue, { count }))
      ],
      flaggedRows: file.flaggedRows.map((flagged) => ({
        row: flagged.row,
        chemistry: flagged.chemistry,
        category: flagged.category,
        figure: String(flagged.figureTonnes),
        check: flagged.checkLabel
      })),
      viewAllRowsText: fill(labels.viewAllRows, { count: file.rows }),
      backToFilesHref: filesHref
    })
  }
}
