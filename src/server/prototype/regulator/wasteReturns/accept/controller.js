import { paths, pathTo } from '../../../../../config/paths.js'
import { prototypeRegulatorWasteReturnsContent } from '../../../../../config/prototype-regulator-waste-returns-content.js'
import { NATIONAL_ROLLING_TOTAL_SEED_TONNES, REVIEW_PERIOD } from '../data.js'
import {
  basePageModel,
  fillTemplate,
  formatLongDateTime,
  formatTonnes,
  loadReturn,
  reconciliationRows,
  returnParams,
  reviewHref,
  siteLabel,
  sumFigures
} from '../shared.js'
import { getSubmissions, updateSubmission } from '../store.js'

const content = prototypeRegulatorWasteReturnsContent

const nationalRollingTotal = () =>
  NATIONAL_ROLLING_TOTAL_SEED_TONNES +
  getSubmissions()
    .filter((submission) => submission.acceptedThisSession)
    .reduce((total, submission) => total + sumFigures(submission.intake), 0)

export const acceptConfirmController = {
  get: {
    handler(request, h) {
      const { abto, site, submission } = loadReturn(request.params)

      // Only a return awaiting review can be accepted.
      if (submission.status !== 'awaitingReview') {
        return h.redirect(reviewHref(request.params))
      }

      const pageContent = content.accept
      const rows = reconciliationRows(submission)
      const mismatched = rows.filter((row) => !row.matches)

      return h.view('prototype/regulator/wasteReturns/accept/confirm', {
        ...basePageModel(pageContent, paths.prototypeRegulatorWasteReturnsHome),
        backLink: reviewHref(request.params),
        action: pathTo(
          paths.prototypeRegulatorWasteReturnsAcceptConfirm,
          returnParams(request.params)
        ),
        cancelHref: reviewHref(request.params),
        siteName: siteLabel(abto, site),
        summaryRows: rows.map((row) => ({
          label: row.label,
          text: `${formatTonnes(row.intakeTonnes)} tonnes — ${
            row.matches ? pageContent.matchConfirmed : pageContent.mismatch
          }`
        })),
        mismatchNote: mismatched.length
          ? fillTemplate(pageContent.mismatchNoteTemplate, {
              category: mismatched.map((row) => row.label).join(', ')
            })
          : null
      })
    }
  },

  post: {
    handler(request, h) {
      const { submission } = loadReturn(request.params)

      if (submission.status !== 'awaitingReview') {
        return h.redirect(reviewHref(request.params))
      }

      const acceptedAt = new Date().toISOString()
      updateSubmission(submission.id, {
        status: 'accepted',
        acceptedAt,
        acceptedThisSession: true,
        timeline: [
          ...submission.timeline,
          { at: acceptedAt, text: 'Accepted by EA caseworker' }
        ]
      })

      return h.redirect(
        pathTo(
          paths.prototypeRegulatorWasteReturnsAccepted,
          returnParams(request.params)
        )
      )
    }
  }
}

export const acceptedController = {
  handler(request, h) {
    const { scheme, abto, site, submission } = loadReturn(request.params)

    if (submission.status !== 'accepted') {
      return h.redirect(reviewHref(request.params))
    }

    const pageContent = content.accepted
    const label = siteLabel(abto, site)

    return h.view('prototype/regulator/wasteReturns/accept/accepted', {
      ...basePageModel(pageContent, paths.prototypeRegulatorWasteReturnsHome),
      bannerHeading: fillTemplate(pageContent.bannerHeadingTemplate, {
        site: label,
        period: REVIEW_PERIOD.label
      }),
      bannerBody: fillTemplate(pageContent.bannerBodyTemplate, {
        abto: abto.name,
        scheme: scheme.name
      }),
      summaryRows: [
        { label: pageContent.labels.operator, text: label },
        { label: pageContent.labels.approvalNumber, text: site.approvalNumber },
        { label: pageContent.labels.scheme, text: scheme.name },
        {
          label: pageContent.labels.determination,
          text: pageContent.determination
        },
        { label: pageContent.labels.decidedBy, text: pageContent.decidedBy },
        {
          label: pageContent.labels.timestamp,
          text: formatLongDateTime(submission.acceptedAt)
        },
        {
          label: pageContent.labels.rollingTotal,
          text: fillTemplate(pageContent.rollingTotalTemplate, {
            tonnes: formatTonnes(nationalRollingTotal())
          })
        }
      ],
      wasteReturnsHref: paths.prototypeRegulatorWasteReturnsHome
    })
  }
}
