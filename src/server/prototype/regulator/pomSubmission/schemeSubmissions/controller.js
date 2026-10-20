import { createRequire } from 'node:module'
import Boom from '@hapi/boom'
import {
  addMonths,
  addYears,
  differenceInCalendarDays,
  endOfMonth,
  format,
  parseISO
} from 'date-fns'

import { paths, pathTo } from '../../../../../config/paths.js'
import { prototypeRegulatorContent } from '../../../../../config/prototype-regulator-content.js'
import {
  basePageModel,
  fill,
  SCHEMES_WITH_DETAIL_SCREENS_BUILT,
  submissionsFor
} from '../shared.js'

const seedData = createRequire(import.meta.url)(
  '../../../../../client/javascripts/storage-seed.json'
)

// Tags take Design System colours by meaning: blue is waiting on the
// regulator, green is done, red is a problem.
const STATUS_TAG_COLOUR = {
  received: 'blue',
  accepted: 'green',
  queried: 'orange',
  rejected: 'red',
  notYetSubmitted: 'grey'
}

const longDate = (date) => format(date, 'd MMMM yyyy')

const decidedText = (labels, submission) => {
  if (!submission.decidedOn) {
    return labels.awaitingDecision
  }
  return `${longDate(parseISO(submission.decidedOn))}, ${submission.decidedBy}`
}

const groupByYear = (labels, submissions) => {
  const years = [...new Set(submissions.map((s) => s.compliancePeriodYear))]
    .sort()
    .reverse()

  return years.map((year) => ({
    year,
    submissions: submissions
      .filter((s) => s.compliancePeriodYear === year)
      .sort((a, b) => {
        if (a.quarter !== b.quarter) {
          return b.quarter.localeCompare(a.quarter)
        }
        return b.submittedOn.localeCompare(a.submittedOn)
      })
      .map((submission) => ({
        id: submission.id,
        periodLabel: submission.periodLabel,
        submittedOn: submission.submittedOn,
        filesCount: submission.filesCount,
        statusLabel: labels.statusLabels[submission.status],
        statusColour: STATUS_TAG_COLOUR[submission.status],
        decided: decidedText(labels, submission)
      }))
  }))
}

// Q1–Q3 lock two months after the quarter's deadline; Q4 stays open for
// adjustments for three years.
const deadlineFor = (quarter, year) => {
  const number = Number(quarter.slice(1))
  const deadlineYear = number === 4 ? Number(year) + 1 : Number(year)
  const monthIndex = { 1: 3, 2: 6, 3: 9, 4: 0 }[number]
  return endOfMonth(new Date(deadlineYear, monthIndex, 1))
}

const buildWindows = (labels, submissions, now) => {
  const quarters = new Map()
  for (const submission of submissions) {
    quarters.set(submission.periodLabel, submission)
  }

  return [...quarters.values()]
    .sort((a, b) =>
      `${b.compliancePeriodYear}${b.quarter}`.localeCompare(
        `${a.compliancePeriodYear}${a.quarter}`
      )
    )
    .slice(0, 4)
    .map((submission) => {
      const deadline = deadlineFor(
        submission.quarter,
        submission.compliancePeriodYear
      )
      const copy = labels.windows

      if (submission.quarter === 'Q4') {
        const openUntil = addYears(deadline, 3)
        return {
          period: submission.periodLabel,
          description: fill(copy.openUntil, { date: longDate(openUntil) }),
          tag: now < openUntil ? copy.extended : copy.locked
        }
      }

      const lockOn = endOfMonth(addMonths(deadline, 2))
      const daysLeft = differenceInCalendarDays(lockOn, now)
      return daysLeft > 0
        ? {
            period: submission.periodLabel,
            description: fill(copy.locksOn, { date: longDate(lockOn) }),
            tag: {
              ...copy.open,
              text: fill(copy.open.text, { days: daysLeft })
            }
          }
        : {
            period: submission.periodLabel,
            description: fill(copy.lockedOn, { date: longDate(lockOn) }),
            tag: copy.locked
          }
    })
}

export const schemeSubmissionsController = {
  handler(request, h) {
    const { schemeId } = request.params

    if (!SCHEMES_WITH_DETAIL_SCREENS_BUILT.has(schemeId)) {
      throw Boom.notFound()
    }

    const labels = prototypeRegulatorContent.schemeSubmissions
    const scheme = seedData.prototypeRegulatorSchemes.find(
      (s) => s.id === schemeId
    )
    const submissions = submissionsFor(schemeId)

    return h.view('prototype/regulator/pomSubmission/schemeSubmissions/view', {
      ...basePageModel(
        {
          ...labels,
          heading: labels.title,
          intro: `${scheme.name} · ${scheme.npwdRef}`
        },
        {
          backLink: {
            href: paths.prototypeRegulatorPomSubmissionDashboard,
            text: labels.backLink
          }
        }
      ),
      summary: labels.intro,
      years: groupByYear(labels, submissions),
      windows: buildWindows(labels, submissions, new Date()),
      homeLink: {
        text: fill(labels.backToScheme, { scheme: scheme.name }),
        href: pathTo(paths.prototypeRegulatorPomSubmissionSchemeHome, {
          schemeId
        })
      }
    })
  }
}
