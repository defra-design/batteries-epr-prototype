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

// The scheme's own service ran checks and passed all rows before upload, so
// there is no per-file "Open" destination unless Figma showed us the file's
// content — only IronWave_Q2_2026_member_5.csv (the one with warnings) has
// been read. The other 3 files' Open links stay dead until those are built.
const OPEN_LINK_BUILT = new Set(['eeeeaaaa-0001-4000-a000-000000000003'])

const QUARTER_MONTH_RANGES = {
  Q1: '1 Jan – 31 Mar',
  Q2: '1 Apr – 30 Jun',
  Q3: '1 Jul – 30 Sep',
  Q4: '1 Oct – 31 Dec'
}

export const submissionFilesController = {
  handler(request, h) {
    const { schemeId, year, quarter } = request.params

    if (!SCHEMES_WITH_DETAIL_SCREENS_BUILT.has(schemeId)) {
      throw Boom.notFound()
    }

    const submission = findSubmission(schemeId, year, quarter)
    if (!submission) {
      throw Boom.notFound()
    }

    const pageContent = prototypeRegulatorContent.submissionFiles
    const scheme = seedData.prototypeRegulatorSchemes.find(
      (s) => s.id === schemeId
    )
    const membersTotalCount = seedData.prototypeRegulatorSchemeMembers.filter(
      (m) => m.schemeId === schemeId
    ).length

    const files = seedData.prototypeRegulatorSubmissionFiles
      .filter((f) => f.submissionId === submission.id)
      .map((file) => ({
        fileName: file.fileName,
        membersCovered: file.membersCovered ?? '–',
        rows: file.rows,
        uploadedOn: formatDateOnly(file.uploadedOn),
        checkStatusLabel:
          file.checkStatus === 'warnings'
            ? pageContent.checkStatusLabels.warningsTemplate.replace(
                '{count}',
                file.warningsCount
              )
            : pageContent.checkStatusLabels.passed,
        checkStatusColour: pageContent.checkStatusColours[file.checkStatus],
        openHref: OPEN_LINK_BUILT.has(file.id)
          ? pathTo(paths.prototypeRegulatorPomSubmissionSubmissionFile, {
              schemeId,
              year,
              quarter,
              fileId: file.id
            })
          : '#'
      }))

    return h.view('prototype/regulator/pomSubmission/submissionFiles/view', {
      ...basePageModel(
        {
          ...pageContent,
          heading: pageContent.headingTemplate.replace(
            '{period}',
            submission.periodLabel
          )
        },
        paths.prototypeRegulatorPomSubmissionDashboard
      ),
      backLink: pathTo(paths.prototypeRegulatorPomSubmissionSchemeHome, {
        schemeId
      }),
      scheme,
      submission,
      intro: pageContent.introTemplate
        .replace('{scheme}', scheme.name)
        .replace('{count}', files.length)
        .replace('{period}', submission.periodLabel),
      periodLine: `${submission.periodLabel} (${QUARTER_MONTH_RANGES[quarter]})`,
      membersCoveredLine: `${submission.membersCount} of ${membersTotalCount}`,
      totalPlacedOnMarketLine: `${submission.totalPlacedOnMarketTonnes.toLocaleString('en-GB')} tonnes`,
      submittedByLine: `${scheme.superUser.name}, ${formatDateTime(submission.submittedOn)}`,
      files,
      downloadAllText: pageContent.downloadAllTemplate.replace(
        '{count}',
        files.length
      ),
      continueHref: pathTo(
        paths.prototypeRegulatorPomSubmissionReviewPomReturn,
        { schemeId, year, quarter }
      )
    })
  }
}
