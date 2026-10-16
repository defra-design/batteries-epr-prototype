import { paths } from '../../../../../config/paths.js'
import { prototypeAbtoContent } from '../../../../../config/prototype-abto-content.js'
import { formatDate } from '../../../../../config/nunjucks/filters/format-date.js'
import { differenceInCalendarDays, parseISO } from 'date-fns'
import { accountPageModel, fill, longDate } from '../shared.js'
import {
  formatTonnes,
  getThreshold,
  getTotalsRows,
  getWasteReturnsSeed
} from '../store.js'

export const wasteReturnsController = {
  handler(_request, h) {
    const pageContent = prototypeAbtoContent.wasteReturns
    const seed = getWasteReturnsSeed()
    const quarter = {
      quarterShort: seed.quarterShort
    }

    return h.view('prototype/abto/smallOperatorThreshold/wasteReturns/view', {
      ...accountPageModel(pageContent, paths.prototypeAbtoWasteReturns),
      insetText: fill(pageContent.inset, {
        quarter: seed.quarterLabel,
        start: formatDate(seed.periodStart, 'd MMMM'),
        end: longDate(seed.periodEnd),
        deadline: longDate(seed.deadline),
        days: differenceInCalendarDays(
          parseISO(seed.deadline),
          parseISO(seed.referenceDate)
        )
      }),
      returns: seed.returns.map((item) => ({
        period: item.period,
        submitted: formatDate(item.submittedOn, 'd MMM yyyy'),
        tonnes: `${formatTonnes(item.tonnesAccepted)} ${prototypeAbtoContent.totals.unit}`,
        status: item.status
      })),
      totalsColumns: prototypeAbtoContent.totals.columns,
      totalsRows: getTotalsRows(),
      startHeading: fill(pageContent.startHeading, quarter),
      startBody: fill(pageContent.startBody, {
        person: getThreshold().appropriatePerson
      }),
      startAction: fill(pageContent.startAction, quarter),
      sites: seed.sites
    })
  }
}
