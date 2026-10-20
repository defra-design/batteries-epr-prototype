import { createRequire } from 'node:module'
import Boom from '@hapi/boom'

import { paths, pathTo } from '../../../../../config/paths.js'
import { prototypeRegulatorContent } from '../../../../../config/prototype-regulator-content.js'
import {
  basePageModel,
  fill,
  flagCountFor,
  findSubmission,
  formatDateTime,
  formatTonnes3,
  SCHEMES_WITH_DETAIL_SCREENS_BUILT
} from '../shared.js'
import { getFailedUploads } from '../store.js'

const seedData = createRequire(import.meta.url)(
  '../../../../../client/javascripts/storage-seed.json'
)

// Only the file with flags (member_5) has an Open screen built; the other
// files' Open links stay dead until those screens exist.
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

    const labels = prototypeRegulatorContent.submissionFiles
    const scheme = seedData.prototypeRegulatorSchemes.find(
      (s) => s.id === schemeId
    )
    const membersTotal = seedData.prototypeRegulatorSchemeMembers.filter(
      (member) => member.schemeId === schemeId
    ).length
    const evidence = seedData.prototypeRegulatorSupportingEvidence.filter(
      (entry) => entry.submissionId === submission.id
    )
    const memberFiles = seedData.prototypeRegulatorSubmissionFiles.filter(
      (file) => file.submissionId === submission.id
    )

    const files = memberFiles.map((file) => ({
      id: file.id,
      fileName: file.fileName,
      members: file.membersCovered ?? 'All',
      records: file.rows.toLocaleString('en-GB'),
      total: file.totalTonnes == null ? '–' : formatTonnes3(file.totalTonnes),
      uploadedShort: new Date(file.uploadedOn).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        timeZone: 'UTC'
      }),
      check:
        file.checkStatus === 'warnings'
          ? {
              ...labels.checkStatus.flags,
              text: fill(labels.checkStatus.flags.text, {
                count: file.warningsCount
              })
            }
          : labels.checkStatus.passed,
      openHref: OPEN_LINK_BUILT.has(file.id)
        ? pathTo(paths.prototypeRegulatorPomSubmissionSubmissionFile, {
            schemeId,
            year,
            quarter,
            fileId: file.id
          })
        : '#'
    }))

    const records = memberFiles.reduce((sum, file) => sum + file.rows, 0)
    const dataRecords = memberFiles
      .filter((file) => file.membersCovered)
      .reduce((sum, file) => sum + file.rows, 0)
    const total = memberFiles.reduce(
      (sum, file) => sum + (file.totalTonnes ?? 0),
      0
    )
    const failed = getFailedUploads().filter(
      (upload) =>
        upload.schemeId === schemeId && upload.compliancePeriodYear === year
    )
    const values = {
      scheme: scheme.name,
      period: submission.periodLabel,
      range: QUARTER_MONTH_RANGES[quarter]
    }
    const summaryRow = (key, value, action) => ({
      key: { text: key },
      value: { text: value },
      actions: action ? { items: [action] } : undefined
    })

    return h.view('prototype/regulator/pomSubmission/submissionFiles/view', {
      ...basePageModel(
        { ...labels, heading: labels.title },
        {
          backLink: {
            href: pathTo(paths.prototypeRegulatorPomSubmissionSchemeHome, {
              schemeId
            }),
            text: fill(labels.backLink, values)
          }
        }
      ),
      tag: {
        text: fill(labels.tag.text, {
          count: memberFiles.length + evidence.length
        }),
        colour: labels.tag.colour
      },
      subtitle: fill(labels.subtitle, values),
      intro: fill(labels.intro, {
        dataFiles: memberFiles.length,
        evidence: evidence.length
      }),
      summaryRows: [
        summaryRow(
          labels.summary.records,
          fill(labels.recordsValue, {
            records: dataRecords.toLocaleString('en-GB'),
            included: submission.membersCount,
            total: membersTotal
          })
        ),
        summaryRow(
          labels.summary.total,
          fill(labels.totalValue, { amount: formatTonnes3(total) })
        ),
        summaryRow(
          labels.summary.checks,
          fill(labels.checksValue, { flags: flagCountFor(submission) }),
          {
            href: pathTo(paths.prototypeRegulatorPomSubmissionDataCheckReport, {
              schemeId
            }),
            text: labels.viewFlagged
          }
        ),
        summaryRow(
          labels.summary.submittedBy,
          `${submission.submittedBy}, ${formatDateTime(submission.submittedOn)}`
        ),
        failed.length > 0 &&
          summaryRow(
            fill(labels.summary.failed, { year }),
            fill(labels.failedValue, { count: failed.length }),
            { href: '#', text: labels.viewAll }
          )
      ].filter(Boolean),
      recordsTotal: records,
      files,
      evidence: evidence.map((entry) => ({
        fileName: entry.fileName,
        covers: entry.covers,
        uploadedShort: new Date(entry.uploadedOn).toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          timeZone: 'UTC'
        })
      })),
      reviewHref: pathTo(paths.prototypeRegulatorPomSubmissionReviewPomReturn, {
        schemeId,
        year,
        quarter
      })
    })
  }
}
