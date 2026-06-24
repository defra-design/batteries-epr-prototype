import { niContent } from '../../../config/ni-content.js'
import { paths } from '../../../config/paths.js'

export const niDashboardController = {
  handler(request, h) {
    const pageContent = niContent.dashboard

    return h.view('ni/dashboard/index', {
      pageTitle: pageContent.title,
      heading: pageContent.heading,
      intro: pageContent.intro,
      cards: pageContent.cards,
      startUrl: paths.niOnboardingCompanyDetails,
      cardLinks: {
        registration: {
          href: paths.niOnboardingCompanyDetails,
          text: 'Start registration'
        },
        carbonFootprint: {
          href: paths.niOnboardingCarbonFootprint,
          text: 'Declare carbon footprint'
        },
        batteryPassport: {
          href: paths.niOnboardingBatteryPassport,
          text: 'Battery passport and labelling'
        },
        dueDiligence: {
          href: paths.niOnboardingDueDiligence,
          text: 'Complete due diligence'
        },
        reporting: {
          href: paths.niAnnualReturnCategories,
          text: 'Start annual return'
        },
        collectionTargets: {
          href: paths.niObligation,
          text: 'View your obligation'
        },
        recycledContent: {
          href: paths.niProductRequirements,
          text: 'View product requirements'
        }
      }
    })
  }
}
