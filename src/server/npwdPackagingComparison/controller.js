import {
  npwdPackagingComparison,
  classificationTag
} from '../../config/npwd-packaging-comparison.js'

export const npwdPackagingComparisonController = {
  handler(request, h) {
    return h.view('npwdPackagingComparison/index', {
      pageTitle: npwdPackagingComparison.title,
      heading: npwdPackagingComparison.heading,
      intro: npwdPackagingComparison.intro,
      legend: npwdPackagingComparison.legend,
      services: npwdPackagingComparison.services,
      areas: npwdPackagingComparison.areas,
      fieldGroups: npwdPackagingComparison.fieldGroups,
      summary: npwdPackagingComparison.summary,
      caveats: npwdPackagingComparison.caveats,
      classificationTag
    })
  }
}
