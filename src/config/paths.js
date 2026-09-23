/* v8 ignore start */
export const paths = {
  home: '/',
  playground: '/playground',
  prototype: '/prototype',
  about: '/about',
  cookies: '/cookies',
  terms: '/terms',
  privacyNotice: '/privacy-notice',
  accessibility: '/accessibility-statement',
  npwdPackagingComparison: '/npwd-vs-packaging',
  bcsRegistrationWalkthrough: '/bcs-registration-walkthrough',

  prototypeRegistrationStart: '/prototype/small-producer/registration',
  prototypeRegistrationOneLogin:
    '/prototype/small-producer/registration/one-login',
  prototypeRegistrationSignIn: '/prototype/small-producer/registration/sign-in',
  prototypeRegistrationBatteryCategory:
    '/prototype/small-producer/registration/battery-category',
  prototypeRegistrationDifferentService:
    '/prototype/small-producer/registration/different-service',
  prototypeRegistrationTonnage:
    '/prototype/small-producer/registration/tonnage',
  prototypeRegistrationOrganisationType:
    '/prototype/small-producer/registration/organisation-type',
  prototypeRegistrationCompaniesHouse:
    '/prototype/small-producer/registration/companies-house-search',
  prototypeRegistrationPartnershipDetails:
    '/prototype/small-producer/registration/partnership-details',
  prototypeRegistrationSoleTraderDetails:
    '/prototype/small-producer/registration/sole-trader-details',
  prototypeRegistrationOverseasDetails:
    '/prototype/small-producer/registration/overseas-details',
  prototypeRegistrationOverseasExit:
    '/prototype/small-producer/registration/overseas-cannot-register',
  prototypeRegistrationAppropriatePersonGuidance:
    '/prototype/small-producer/registration/choosing-the-appropriate-person',
  prototypeRegistrationAppropriatePerson:
    '/prototype/small-producer/registration/appropriate-person',
  prototypeRegistrationSchemeMembership:
    '/prototype/small-producer/registration/scheme-membership',
  prototypeRegistrationSchemeSelect:
    '/prototype/small-producer/registration/scheme-select',
  prototypeRegistrationCheckAnswers:
    '/prototype/small-producer/registration/check-answers',
  prototypeRegistrationDeclaration:
    '/prototype/small-producer/registration/declaration',
  prototypeRegistrationComplete:
    '/prototype/small-producer/registration/complete',

  prototypeSubmissionSignIn: '/prototype/small-producer/submission/sign-in',
  prototypeSubmissionTerms: '/prototype/small-producer/submission/terms',
  prototypeSubmissionAccount: '/prototype/small-producer/submission/account',
  prototypeSubmissionTasks:
    '/prototype/small-producer/submission/account/tasks',
  prototypeSubmissionTaskStart:
    '/prototype/small-producer/submission/reconfirm',
  prototypeSubmissionBatteryCategory:
    '/prototype/small-producer/submission/battery-category',
  prototypeSubmissionTonnage: '/prototype/small-producer/submission/tonnage',
  prototypeSubmissionCheckRegistration:
    '/prototype/small-producer/submission/check-registration-details',
  prototypeSubmissionBrandQuestion:
    '/prototype/small-producer/submission/brand-names',
  prototypeSubmissionBrandAdd:
    '/prototype/small-producer/submission/brand-names/add',
  prototypeSubmissionBrandConfirm:
    '/prototype/small-producer/submission/brand-names/confirm',
  prototypeSubmissionData: '/prototype/small-producer/submission/battery-data',
  prototypeSubmissionCheckData:
    '/prototype/small-producer/submission/check-battery-data',
  prototypeSubmissionPayFee:
    '/prototype/small-producer/submission/pay-your-fee',
  prototypeSubmissionPayment: '/prototype/small-producer/submission/payment',
  prototypeSubmissionPaymentConfirmed:
    '/prototype/small-producer/submission/payment-confirmed',

  prototypeComplianceSchemeSubmissionSignIn:
    '/prototype/compliance-scheme/pom-submission/sign-in',
  prototypeComplianceSchemeSubmissionDashboard:
    '/prototype/compliance-scheme/pom-submission/dashboard',
  prototypeComplianceSchemeSubmissionMembers:
    '/prototype/compliance-scheme/pom-submission/members',
  prototypeComplianceSchemeSubmissionSubmissions:
    '/prototype/compliance-scheme/pom-submission/submissions',
  prototypeComplianceSchemeSubmissionBeforeYouStart:
    '/prototype/compliance-scheme/pom-submission/{year}/{quarter}/before-you-start',
  prototypeComplianceSchemeSubmissionReportingMethod:
    '/prototype/compliance-scheme/pom-submission/{year}/{quarter}/reporting-method',
  prototypeComplianceSchemeSubmissionBulkUpload:
    '/prototype/compliance-scheme/pom-submission/{year}/{quarter}/bulk-upload',
  prototypeComplianceSchemeSubmissionUploading:
    '/prototype/compliance-scheme/pom-submission/{year}/{quarter}/uploading',
  prototypeComplianceSchemeSubmissionErrors:
    '/prototype/compliance-scheme/pom-submission/{year}/{quarter}/errors',
  prototypeComplianceSchemeSubmissionUploadSuccess:
    '/prototype/compliance-scheme/pom-submission/{year}/{quarter}/upload-success',

  prototypeComplianceSchemeQueryResponseSignIn:
    '/prototype/compliance-scheme/query-response/sign-in',
  prototypeComplianceSchemeQueryResponseReturnQueried:
    '/prototype/compliance-scheme/query-response/{year}/{quarter}',
  prototypeComplianceSchemeQueryResponseReviewFigure:
    '/prototype/compliance-scheme/query-response/{year}/{quarter}/records/{recordId}',
  prototypeComplianceSchemeQueryResponseCorrectFigure:
    '/prototype/compliance-scheme/query-response/{year}/{quarter}/records/{recordId}/correct',
  prototypeComplianceSchemeQueryResponseFigureResent:
    '/prototype/compliance-scheme/query-response/{year}/{quarter}/records/{recordId}/resent',

  prototypeAbtoIncomingWasteDashboard: '/prototype/abto/incoming-waste',
  prototypeAbtoIncomingWasteCompare:
    '/prototype/abto/incoming-waste/{deliveryId}',
  prototypeAbtoIncomingWasteAccept:
    '/prototype/abto/incoming-waste/{deliveryId}/accept',
  prototypeAbtoIncomingWasteAccepted:
    '/prototype/abto/incoming-waste/{deliveryId}/accepted',
  prototypeAbtoIncomingWasteQuery:
    '/prototype/abto/incoming-waste/{deliveryId}/query',
  prototypeAbtoIncomingWasteQuerySent:
    '/prototype/abto/incoming-waste/{deliveryId}/query-sent',

  prototypeRegulatorPomSubmissionSignIn:
    '/prototype/regulator/pom-submission/sign-in',
  prototypeRegulatorPomSubmissionDashboard:
    '/prototype/regulator/pom-submission/dashboard',
  prototypeRegulatorPomSubmissionSchemeHome:
    '/prototype/regulator/pom-submission/schemes/{schemeId}',
  prototypeRegulatorPomSubmissionSchemeRecord:
    '/prototype/regulator/pom-submission/schemes/{schemeId}/record',
  prototypeRegulatorPomSubmissionSchemeMembers:
    '/prototype/regulator/pom-submission/schemes/{schemeId}/members',
  prototypeRegulatorPomSubmissionSchemeSubmissions:
    '/prototype/regulator/pom-submission/schemes/{schemeId}/submissions',
  prototypeRegulatorPomSubmissionRunningDataChecks:
    '/prototype/regulator/pom-submission/schemes/{schemeId}/running-data-checks',
  prototypeRegulatorPomSubmissionDataCheckReport:
    '/prototype/regulator/pom-submission/schemes/{schemeId}/data-check-report',
  prototypeRegulatorPomSubmissionBatterySalesDataSubmission:
    '/prototype/regulator/pom-submission/schemes/{schemeId}/battery-sales-data-submission',
  prototypeRegulatorPomSubmissionReviewPomReturn:
    '/prototype/regulator/pom-submission/schemes/{schemeId}/submissions/{year}/{quarter}/review',
  prototypeRegulatorPomSubmissionReviewPomReturnAccepted:
    '/prototype/regulator/pom-submission/schemes/{schemeId}/submissions/{year}/{quarter}/accepted',
  prototypeRegulatorPomSubmissionReviewPomReturnQueried:
    '/prototype/regulator/pom-submission/schemes/{schemeId}/submissions/{year}/{quarter}/queried',
  prototypeRegulatorPomSubmissionReviewPomReturnRejectConfirm:
    '/prototype/regulator/pom-submission/schemes/{schemeId}/submissions/{year}/{quarter}/reject-confirm',
  prototypeRegulatorPomSubmissionReviewPomReturnRejected:
    '/prototype/regulator/pom-submission/schemes/{schemeId}/submissions/{year}/{quarter}/rejected',
  prototypeRegulatorPomSubmissionSubmissionFiles:
    '/prototype/regulator/pom-submission/schemes/{schemeId}/submissions/{year}/{quarter}/files',
  prototypeRegulatorPomSubmissionSubmissionFile:
    '/prototype/regulator/pom-submission/schemes/{schemeId}/submissions/{year}/{quarter}/files/{fileId}',

  prototypeMembersListStart: '/prototype/compliance-scheme/members-list',
  prototypeMembersListHowToSend:
    '/prototype/compliance-scheme/members-list/how-to-send',
  prototypeMembersListUploadCsv:
    '/prototype/compliance-scheme/members-list/upload-csv',
  prototypeMembersListReviewUpload:
    '/prototype/compliance-scheme/members-list/review-upload',
  prototypeMembersListReviewUploadFix:
    '/prototype/compliance-scheme/members-list/review-upload/{memberId}/fix',
  prototypeMembersListSubmitted:
    '/prototype/compliance-scheme/members-list/submitted',

  // Online-form branch: add one producer member at a time.
  prototypeMembersListAddMemberOrganisationType:
    '/prototype/compliance-scheme/members-list/add-member/organisation-type',
  prototypeMembersListAddMemberCompaniesHouse:
    '/prototype/compliance-scheme/members-list/add-member/companies-house',
  prototypeMembersListAddMemberPartnershipDetails:
    '/prototype/compliance-scheme/members-list/add-member/partnership-details',
  prototypeMembersListAddMemberSoleTraderDetails:
    '/prototype/compliance-scheme/members-list/add-member/sole-trader-details',
  prototypeMembersListAddMemberUkBusinessPresence:
    '/prototype/compliance-scheme/members-list/add-member/uk-business-presence',
  prototypeMembersListAddMemberOverseasDetails:
    '/prototype/compliance-scheme/members-list/add-member/overseas-details',
  prototypeMembersListAddMemberOverseasCannotRegister:
    '/prototype/compliance-scheme/members-list/add-member/overseas-cannot-register',
  prototypeMembersListAddMemberLegalNoticesAddress:
    '/prototype/compliance-scheme/members-list/add-member/legal-notices-address',
  prototypeMembersListAddMemberAppropriatePerson:
    '/prototype/compliance-scheme/members-list/add-member/appropriate-person',
  prototypeMembersListAddMemberBatteryCategory:
    '/prototype/compliance-scheme/members-list/add-member/battery-category',
  prototypeMembersListAddMemberTonnage:
    '/prototype/compliance-scheme/members-list/add-member/tonnage',
  prototypeMembersListAddMemberDateJoined:
    '/prototype/compliance-scheme/members-list/add-member/date-joined',
  prototypeMembersListAddMemberCheckAnswers:
    '/prototype/compliance-scheme/members-list/add-member/check-answers',

  prototypeWasteDataAccountHome: '/prototype/compliance-scheme/waste-data',
  prototypeWasteDataStart: '/prototype/compliance-scheme/waste-data/start',
  prototypeWasteDataUploadUnavailable:
    '/prototype/compliance-scheme/waste-data/upload-unavailable',
  prototypeWasteDataEnter: '/prototype/compliance-scheme/waste-data/enter',
  prototypeWasteDataCheck: '/prototype/compliance-scheme/waste-data/check',
  prototypeWasteDataDeclaration:
    '/prototype/compliance-scheme/waste-data/declaration',
  prototypeWasteDataSubmitted:
    '/prototype/compliance-scheme/waste-data/submitted',

  health: '/health',

  password: '/password',
  robots: '/robots.txt',
  googleSiteVerification: '/google0297e4bffe761ccd.html',

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
  niObligation: '/ni/obligation',
  niProductRequirements: '/ni/product-requirements',

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
  complianceSchemeRegister: '/compliance-scheme/register',
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
  complianceSchemeOperators: '/compliance-scheme/operators',

  operatorDashboard: '/operator',
  operatorSignIn: '/operator/sign-in',
  operatorRegister: '/operator/register',
  operatorApplication: '/operator/application/{step}',
  operatorEvidence: '/operator/evidence',
  operatorEvidenceIssue: '/operator/evidence/issue/{step}',
  operatorEvidenceDetail: '/operator/evidence/{evidenceId}',
  operatorQuarterly: '/operator/quarterly/{quarter}/{step}',
  operatorAnnualReturn: '/operator/annual-return/{step}',

  regulatorDashboard: '/regulator',
  regulatorSignIn: '/regulator/sign-in',
  regulatorTargets: '/regulator/targets',
  regulatorCategories: '/regulator/categories',
  regulatorAuditTrail: '/regulator/audit-trail',
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
  devSchemes: '/dev/schemes',
  devData: '/dev/data'
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
