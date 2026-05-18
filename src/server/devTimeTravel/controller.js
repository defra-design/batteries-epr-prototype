import { content } from '../../config/content.js'
import { getCurrentYear } from '../../config/compliance-period.js'

export const devTimeTravelController = {
  handler(request, h) {
    const pageContent = content.devTimeTravel(request)

    return h.view('devTimeTravel/index', {
      pageTitle: pageContent.title,
      heading: pageContent.heading,
      body: pageContent.body,
      yearLabel: pageContent.yearLabel,
      yearHint: pageContent.yearHint,
      confirmAction: pageContent.confirmAction,
      defaultYear: getCurrentYear(request)
    })
  }
}
