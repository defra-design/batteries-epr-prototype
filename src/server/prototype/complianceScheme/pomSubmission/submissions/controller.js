import { createRequire } from 'node:module'

import { paths } from '../../../../../config/paths.js'
import { prototypeComplianceSchemeContent } from '../../../../../config/prototype-compliance-scheme-content.js'
import { basePageModel } from '../shared.js'

const seedData = createRequire(import.meta.url)(
  '../../../../../client/javascripts/storage-seed.json'
)

const STATUS_TAG_COLOUR = {
  submitted: 'grey',
  open: 'green',
  notYetOpen: 'grey'
}

const actionTextFor = (pageContent, quarter) =>
  quarter.status === 'submitted'
    ? pageContent.submittedAction
    : `Start Quarter ${quarter.quarter}`

const actionHrefFor = (quarter) =>
  quarter.status === 'open'
    ? paths.prototypeComplianceSchemeSubmissionBeforeYouStart
        .replace('{year}', quarter.year)
        .replace('{quarter}', quarter.quarter)
    : null

export const submissionsController = {
  handler(_request, h) {
    const pageContent = prototypeComplianceSchemeContent.submissions

    const quarters = seedData.prototypeComplianceSchemeQuarters
      .slice()
      .sort((a, b) => a.quarter - b.quarter)
      .map((quarter) => ({
        label: `Q${quarter.quarter} ${quarter.year}`,
        availableOn: quarter.availableOn,
        dueOn: quarter.dueOn,
        statusLabel: pageContent.statusLabels[quarter.status],
        statusColour: STATUS_TAG_COLOUR[quarter.status],
        actionText: actionTextFor(pageContent, quarter),
        actionHref: actionHrefFor(quarter),
        actionClasses:
          quarter.status === 'open' ? '' : 'govuk-button--secondary',
        actionDisabled: quarter.status === 'notYetOpen',
        note: quarter.note
      }))

    return h.view('prototype/complianceScheme/pomSubmission/submissions/view', {
      ...basePageModel(
        pageContent,
        paths.prototypeComplianceSchemeSubmissionSubmissions
      ),
      quarters
    })
  }
}
