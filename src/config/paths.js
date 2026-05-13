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
  newAccount: '/new-account',

  onboarding: '/onboarding/{step}',
  onboardingCompanyDetails: '/onboarding/company-details',
  onboardingContactDetails: '/onboarding/contact-details',
  onboardingServiceOfNotice: '/onboarding/service-of-notice',
  onboardingBatteryTypes: '/onboarding/battery-types',
  onboardingBrandNames: '/onboarding/brand-names',
  onboardingProducerRoute: '/onboarding/producer-route',
  onboardingDeclaration: '/onboarding/declaration',
  onboardingConfirmation: '/onboarding/confirmation',

  annualReturn: '/annual-return/{registrationId}/{step}',
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

  devReset: '/dev/reset',
  devTimeTravel: '/dev/time-travel'
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
