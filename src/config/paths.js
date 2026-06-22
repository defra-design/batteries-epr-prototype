/* v8 ignore start */
export const paths = {
  home: '/',
  about: '/about',
  cookies: '/cookies',
  terms: '/terms',
  privacyNotice: '/privacy-notice',
  accessibility: '/accessibility-statement',

  health: '/health',

  signIn: '/sign-in',
  signinOidc: '/signin-oidc',
  signOut: '/sign-out',
  signedOut: '/signed-out',

  publicRegisterSearch: '/register/search',
  publicRegisterDetail: '/register/{bprn}',

  dashboard: '/dashboard',
  account: '/account',
  accountScheme: '/account/scheme',
  leaveSchemeReason: '/leave-scheme/reason',
  leaveSchemeDeclaration: '/leave-scheme/declaration',
  leaveSchemeConfirmation: '/leave-scheme/confirmation',
  newAccount: '/new-account',

  niSignIn: '/ni/sign-in',
  niDashboard: '/ni/dashboard',
  niOnboarding: '/ni/onboarding/{step}',
  niOnboardingCompanyDetails: '/ni/onboarding/company-details',
  niOnboardingContactDetails: '/ni/onboarding/contact-details',
  niOnboardingBatteryCategories: '/ni/onboarding/battery-categories',
  niOnboardingBrandNames: '/ni/onboarding/brand-names',
  niOnboardingProducerRoute: '/ni/onboarding/producer-route',
  niOnboardingCarbonFootprint: '/ni/onboarding/carbon-footprint',
  niOnboardingBatteryPassport: '/ni/onboarding/battery-passport',
  niOnboardingDueDiligence: '/ni/onboarding/due-diligence',
  niOnboardingDeclaration: '/ni/onboarding/declaration',
  niOnboardingConfirmation: '/ni/onboarding/confirmation',
  niAnnualReturnCategories: '/ni/annual-return/categories',
  niAnnualReturnPlaced: '/ni/annual-return/placed-on-market',
  niAnnualReturnCollection: '/ni/annual-return/collection',
  niAnnualReturnRecycling: '/ni/annual-return/recycling-efficiency',
  niAnnualReturnDeclaration: '/ni/annual-return/declaration',
  niAnnualReturnConfirmation: '/ni/annual-return/confirmation',

  onboarding: '/onboarding/{step}',
  onboardingCompanyDetails: '/onboarding/company-details',
  onboardingContactDetails: '/onboarding/contact-details',
  onboardingServiceOfNotice: '/onboarding/service-of-notice',
  onboardingBatteryTypes: '/onboarding/battery-types',
  onboardingBrandNames: '/onboarding/brand-names',
  onboardingProducerRoute: '/onboarding/producer-route',
  onboardingSchemeSelect: '/onboarding/scheme-select',
  onboardingSchemeConfirm: '/onboarding/scheme-confirm',
  onboardingDeclaration: '/onboarding/declaration',
  onboardingConfirmation: '/onboarding/confirmation',

  annualReturn: '/annual-return/{registrationId}/{step}',
  annualReturnSchemeRepresented:
    '/annual-return/{registrationId}/scheme-represented',
  annualReturnSmallTonnages:
    '/annual-return/{registrationId}/small-producer/tonnages',
  annualReturnSmallDeclaration:
    '/annual-return/{registrationId}/small-producer/declaration',
  annualReturnSmallConfirmation:
    '/annual-return/{registrationId}/small-producer/confirmation',
  annualReturnIaCategories: '/annual-return/{registrationId}/ia/categories',
  annualReturnIaTonnages: '/annual-return/{registrationId}/ia/tonnages',
  annualReturnIaDeclaration: '/annual-return/{registrationId}/ia/declaration',
  annualReturnIaConfirmation: '/annual-return/{registrationId}/ia/confirmation',

  serviceCharge: '/service-charge',
  reviewPayment: '/review-payment',
  initiatePayment: '/initiate-payment',
  paymentDetails: '/payment-details',

  nextAction: '/next-action',

  complianceSchemeDashboard: '/compliance-scheme',
  complianceSchemeSignIn: '/compliance-scheme/sign-in',
  complianceSchemeApplication: '/compliance-scheme/application/{step}',
  complianceSchemeMembers: '/compliance-scheme/members',
  complianceSchemeMembersAdd: '/compliance-scheme/members/add',
  complianceSchemeMemberRemove: '/compliance-scheme/members/{memberId}/remove',
  complianceSchemeQuarterly: '/compliance-scheme/quarterly/{quarter}/{step}',
  complianceSchemeQuarterlyMember:
    '/compliance-scheme/quarterly/{quarter}/member/{memberId}/{dataType}',
  complianceSchemeIa: '/compliance-scheme/industrial-automotive/{step}',
  complianceSchemeIaMember:
    '/compliance-scheme/industrial-automotive/member/{memberId}/{step}',
  complianceSchemeEvidence: '/compliance-scheme/evidence',
  complianceSchemeEvidenceIssue: '/compliance-scheme/evidence/issue/{step}',
  complianceSchemeEvidenceDetail: '/compliance-scheme/evidence/{evidenceId}',
  complianceSchemeEvidenceTransfer:
    '/compliance-scheme/evidence/{evidenceId}/transfer',
  complianceSchemeEvidenceAvailability:
    '/compliance-scheme/evidence/availability',
  complianceSchemeObligation: '/compliance-scheme/obligation',

  operatorDashboard: '/operator',
  operatorSignIn: '/operator/sign-in',
  operatorApplication: '/operator/application/{step}',
  operatorEvidence: '/operator/evidence',
  operatorEvidenceIssue: '/operator/evidence/issue/{step}',
  operatorEvidenceDetail: '/operator/evidence/{evidenceId}',
  operatorQuarterly: '/operator/quarterly/{quarter}/{step}',
  operatorAnnualReturn: '/operator/annual-return/{step}',

  regulatorDashboard: '/regulator',
  regulatorSignIn: '/regulator/sign-in',
  regulatorSchemes: '/regulator/schemes',
  regulatorSchemeDetail: '/regulator/schemes/{schemeId}',
  regulatorOperators: '/regulator/operators',
  regulatorOperatorDetail: '/regulator/operators/{operatorId}',
  regulatorProducers: '/regulator/producers',
  regulatorProducerDetail: '/regulator/producers/{producerId}',
  regulatorEvidence: '/regulator/evidence',
  regulatorEvidenceDetail: '/regulator/evidence/{evidenceId}',
  regulatorSubmissions: '/regulator/submissions',
  regulatorSchemeWithdraw: '/regulator/schemes/{schemeId}/withdraw',
  regulatorOperatorWithdraw: '/regulator/operators/{operatorId}/withdraw',

  devReset: '/dev/reset',
  devTimeTravel: '/dev/time-travel',
  devSchemes: '/dev/schemes'
}
/* v8 ignore stop */

export const pathTo = (route, params) => {
  const routeParams = route.match(/\{\w+\*?\}/g)
  for (const r of routeParams) {
    const parts = r.match(/\{(\w+)\*?\}/)
    const src = params[parts[1]]
    const dst = parts[0]
    const key = parts[1]

    if (src) {
      route = route.replace(dst, src)
    } else {
      throw new Error(
        `Missing key ${key} in route ${route}. Data provided: ${JSON.stringify(params)}`
      )
    }
  }
  return route
}
