export const PROTOTYPE_REGISTRATION_SERVICE_NAME =
  'Register as a battery producer'

export const prototypeRegistrationContent = {
  breadcrumbs: [
    { text: 'GOV.UK', href: '#' },
    { text: 'Environment and countryside', href: '#' },
    { text: 'Producer responsibility for waste', href: '#' }
  ],

  start: {
    title: 'Register as a battery producer',
    heading: 'Register as a battery producer',
    intro:
      'You must register your organisation as a battery producer if it places batteries on the UK market. This is a legal requirement under the Waste Batteries and Accumulators Regulations 2009.',
    beforeYouStartHeading: 'Before you start',
    checkIntro: 'Check:',
    checkBullets: [
      'if you need to register as a battery producer',
      'whether your batteries are portable, industrial or automotive'
    ],
    needIntro: "You'll need:",
    needBullets: [
      'a GOV.UK One Login - you can create one when you start',
      "your organisation's Companies House number, or your business details if you're a sole trader or partnership",
      "the estimated weight of batteries you'll place on the UK market this year",
      "contact details for the appropriate person, who's responsible for compliance"
    ],
    applyHeading: 'Apply online',
    startAction: 'Start now',
    helpHeading: 'Help applying',
    helpBody:
      'You can get help with your application by contacting the Environment Agency (England)',
    helpPhone: 'Telephone: 03708 506 506',
    helpEmailLabel: 'Email:',
    helpEmail: 'batteries@environment-agency.gov.uk',
    relatedHeading: 'Related content',
    relatedLinks: [
      'Apply to become a Battery Compliance Scheme',
      'Apply to become a battery treatment facility or exporter',
      'Join a Battery Compliance Scheme',
      'Delegate authority of the Appropriate Person'
    ],
    guidanceHeading: 'Help and guidance',
    guidanceLinks: [
      'Waste batteries: producer responsibility',
      'Regulations: batteries and accumulators',
      'Battery waste: retailer and distributor responsibilities',
      'Waste batteries: treat, recycle and export',
      'Classifying portable and industrial batteries',
      'Waste batteries and accumulators: technical guidance registers and reports'
    ]
  },

  oneLogin: {
    title: 'Create your GOV.UK One Login or sign in',
    heading: 'Create your GOV.UK One Login or sign in',
    body1:
      'You can use your GOV.UK One Login to access some government services.',
    body2:
      "In the future, you'll be able to use it to access all services on GOV.UK.",
    needIntro: "You'll need:",
    needBullets: [
      'an email address',
      'a way to get security codes - this can be a mobile phone number or an authenticator app'
    ],
    body3:
      "You can prove your identity after you've created your GOV.UK One Login. You only need to do this for some services.",
    createAction: 'Create your Gov UK One Login',
    signInAction: 'Sign in',
    servicesLink:
      'Services you can use with Gov UK One Login (Opens in a new tab)'
  },

  signIn: {
    title: 'Sign in with GOV.UK One Login',
    heading: 'Sign in with GOV.UK One Login',
    intro:
      'GOV.UK One Login proves who you are. If you do not have one, you can create it now with your email, a password and multi-factor authentication.',
    emailLabel: 'Email address',
    passwordLabel: 'Password',
    continueAction: 'Continue',
    createLink: 'Create a GOV.UK One Login'
  },

  batteryCategory: {
    title: 'What type of batteries do you place on the market?',
    heading: 'What type of batteries do you place on the market?',
    hint: 'Select all that apply',
    portableLabel: 'Portable batteries',
    industrialLabel: 'Industrial batteries',
    automotiveLabel: 'Automotive batteries',
    sidebarHeading: 'Battery types',
    sidebarLinks: [
      'Portable batteries',
      'Industrial batteries',
      'Automotive batteries'
    ],
    continueAction: 'Continue',
    error: {
      title: 'There is a problem',
      atLeastOne: 'Select the types of batteries you place on the market'
    }
  },

  differentService: {
    title: 'You need to register with a different service',
    heading: 'You need to register with a different service',
    body: 'This service handles registration for portable battery producers with the environment agencies of the devolved nations.',
    whatNextHeading: 'What to do next',
    whatNextBody:
      'You can register as a producer of industrial or automotive batteries with the',
    whatNextLink: 'Department for Business, Energy & Industrial Strategy (BEIS)'
  },

  tonnage: {
    title:
      'How many portable batteries will your organisation place on the UK market each year?',
    heading:
      'How many portable batteries will your organisation place on the UK market each year?',
    hint: '"Placed on the market" means making a battery available for distribution or use in the UK for the first time.',
    upTo1TonneLabel: '1 tonne or less',
    over1TonneLabel: 'More than 1 tonne',
    continueAction: 'Continue',
    error: {
      title: 'There is a problem',
      choice:
        'Select how many portable batteries your organisation will place on the UK market each year'
    }
  },

  organisationType: {
    title: 'Select your organisation type',
    heading: 'Select your organisation type',
    limitedCompanyLabel: 'Limited company',
    llpLabel: 'Limited liability partnership',
    partnershipLabel: 'Partnership',
    soleTraderLabel: 'Sole trader or individual',
    overseasLabel: 'Overseas company',
    continueAction: 'Continue',
    error: {
      title: 'There is a problem',
      choice: 'Select your organisation type'
    }
  },

  organisationTypeLabels: {
    limitedCompany: 'Limited company',
    llp: 'Limited liability partnership',
    partnership: 'Partnership',
    soleTrader: 'Sole trader or individual',
    overseas: 'Overseas company'
  },

  companiesHouse: {
    title: 'Search for your organisation on Companies House',
    heading: 'Search for your organisation on Companies House',
    nameLabel: 'Registered name',
    nameHint: 'This is the name registered at Companies House.',
    numberLabel: 'Company number',
    numberHint: 'Your 8 character company number, for example 01234567.',
    searchAction: 'Search Companies House',
    resultHeading: 'Company found',
    notFound: 'No matching company was found. Check the number and try again.',
    continueAction: 'Continue',
    error: {
      title: 'There is a problem',
      name: 'Enter the registered name of your organisation',
      number: 'Enter your 8 character company number'
    }
  },

  partnershipDetails: {
    title: 'Enter your details',
    heading: 'Enter your details',
    fullNameLabel: 'Full name',
    partnershipNameLabel: 'Partnership name',
    tradingNameLabel: 'Trading name (optional)',
    addressHeading: 'Address',
    postcodeLabel: 'Postcode',
    findAddressAction: 'Find address',
    selectAddressLabel: 'Select an address',
    manualLink: 'Enter address manually',
    addressLine1Label: 'Address line 1',
    addressTownLabel: 'Town or city',
    continueAction: 'Continue',
    error: {
      title: 'There is a problem',
      fullName: 'Enter your full name',
      partnershipName: 'Enter the partnership name',
      postcode: 'Enter a postcode'
    }
  },

  soleTraderDetails: {
    title: 'Enter your details',
    heading: 'Enter your details',
    fullNameLabel: 'Full name',
    tradingNameLabel: 'Trading name (optional)',
    addressHeading: 'Address',
    postcodeLabel: 'Postcode',
    findAddressAction: 'Find address',
    selectAddressLabel: 'Select an address',
    manualLink: 'Enter address manually',
    addressLine1Label: 'Address line 1',
    addressTownLabel: 'Town or city',
    continueAction: 'Continue',
    error: {
      title: 'There is a problem',
      fullName: 'Enter your full name',
      postcode: 'Enter a postcode'
    }
  },

  overseasDetails: {
    title: 'Enter your details',
    heading: 'Enter your details',
    overseasNameLabel: 'Overseas company name',
    overseasAddressLabel: 'Overseas company registered address',
    ukPresenceHeading: 'Address of UK presence',
    postcodeLabel: 'Postcode',
    findAddressAction: 'Find address',
    noUkPresenceLink: 'I do not have a UK presence',
    continueAction: 'Continue',
    error: {
      title: 'There is a problem',
      overseasName: 'Enter the overseas company name',
      overseasAddress: 'Enter the overseas company registered address',
      postcode: 'Enter the postcode of your UK presence'
    }
  },

  overseasExit: {
    title: 'You cannot register as an overseas company',
    heading: 'You cannot register as an overseas company',
    body: "This service is only for producers that have a registered office or principal place of business in the UK. Based on what you've told us, your company is registered overseas and does not have a UK presence, so you cannot register directly through this service.",
    warning:
      'You must have a UK registered office, UK branch, or other UK presence to register as a battery producer. A registered address outside the UK is not accepted on its own.',
    whyHeading: 'Why this is required',
    whyBody:
      'The regulator needs a UK address to send legal notices to, and to establish which UK regulator (Environment Agency, SEPA, NIEA or Natural Resources Wales) has jurisdiction over your registration. Without a UK address, there is no way to allocate your registration to the correct regulator or serve you with formal notices.',
    insteadHeading: 'What you can do instead',
    insteadBullets: [
      'If your company has any UK presence — a UK subsidiary, branch office, warehouse, or appointed UK representative — you can register using that UK address instead.',
      "If you have no UK presence at all, you'll need to appoint a UK-based authorised representative to register and report on your behalf. Your authorised representative takes on the legal responsibility for registration and annual reporting."
    ],
    contactBody:
      'Contact your regulator for guidance on appointing a UK authorised representative, or to confirm whether an existing UK presence is sufficient for registration.',
    contactLink: 'Contact support',
    changeAnswerLink: 'Chosen the wrong option? Go back and change your answer'
  },

  appropriatePersonGuidance: {
    title: 'Choosing the appropriate person for your organisation',
    heading: 'Choosing the appropriate person for your organisation',
    intro:
      'The appropriate person is legally responsible for information and declarations submitted by your organisation under the Waste Batteries and Accumulators Regulations 2009.',
    responsibilitiesHeading: 'Responsibilities of appropriate person',
    responsibilitiesIntro: 'The appropriate person must:',
    responsibilitiesBullets: [
      'make declarations of compliance',
      'make applications for registrations and approvals',
      'confirm battery data submissions are true',
      'report changes to registration details'
    ],
    whoHeading: 'Who can act as an appropriate person',
    whoColumnOrganisation: 'Organisation type',
    whoColumnRole: 'Role of appropriate person',
    whoRows: [
      {
        organisation: 'UK-registered limited company',
        role: 'director or the company secretary'
      },
      { organisation: 'Partnership', role: 'partner' },
      { organisation: 'Sole trader', role: 'the sole trader' }
    ],
    delegateHeading: 'Appointing an approved delegate',
    delegateBody:
      'The appropriate person can request another person or organisation to act on their behalf as an approved delegate. Anything the approved delegate does is treated as an act of the appropriate person. The appropriate person remains legally responsible.',
    continueAction: 'Continue'
  },

  appropriatePerson: {
    title: 'Who is the appropriate person for your organisation?',
    heading: 'Who is the appropriate person for your organisation?',
    fullNameLabel: 'Full name',
    emailLabel: 'Email address',
    emailHint: 'This must be the email address of the appropriate person.',
    roleLabel: 'What is their role?',
    roleHint: 'For example, Director or Company Secretary',
    continueAction: 'Continue',
    error: {
      title: 'There is a problem',
      fullName: 'Enter the full name of the appropriate person',
      email: 'Enter a valid email address for the appropriate person',
      role: 'Enter the role of the appropriate person'
    }
  },

  schemeMembership: {
    title: 'Are you a member of a battery compliance scheme?',
    heading: 'Are you a member of a battery compliance scheme?',
    yesLabel: 'Yes',
    noLabel: 'No',
    intendToJoinLabel: 'No, but I intend to join',
    continueAction: 'Continue',
    error: {
      title: 'There is a problem',
      choice: 'Select whether you are a member of a battery compliance scheme'
    }
  },

  schemeMembershipLabels: {
    yes: 'Yes',
    no: 'No',
    intendToJoin: 'No, but I intend to join'
  },

  schemeSelect: {
    title: 'Select your battery compliance scheme',
    heading: 'Select your battery compliance scheme',
    continueAction: 'Continue',
    error: {
      title: 'There is a problem',
      choice: 'Select your battery compliance scheme'
    }
  },

  schemes: [
    { id: 'batteryback', name: 'Batteryback' },
    {
      id: 'recyclingLives',
      name: 'Recycling Lives Compliance Services Limited'
    },
    { id: 'erpUk', name: 'ERP UK Ltd' },
    { id: 'valpak', name: 'Valpak Ltd' }
  ],

  checkAnswers: {
    title: 'Check your answers',
    heading: 'Check your answers',
    rows: {
      batteryTypes: 'Type of batteries placed on market',
      tonnage: 'Amount of batteries placed on the market each year',
      organisationType: 'Organisation type',
      organisationName: 'Organisation name',
      organisationAddress: 'Organisation address',
      appropriatePersonName: "Appropriate person's name",
      appropriatePersonEmail: "Appropriate person's email address",
      appropriatePersonRole: "Appropriate person's role",
      schemeMembership: 'Compliance scheme membership',
      scheme: 'Compliance scheme'
    },
    changeAction: 'Change',
    continueAction: 'Continue',
    tonnageLabels: {
      upTo1Tonne: 'Less than 1 tonne (1000kg)',
      over1Tonne: 'More than 1 tonne'
    }
  },

  declaration: {
    title: 'Declaration',
    heading: 'Declaration',
    intro: 'By submitting this information, you confirm that:',
    bullets: [
      'the information is correct to the best of your knowledge',
      'the named person meets the legal requirements to act as the appropriate person',
      'you understand that providing false or misleading information may be an offence'
    ],
    warning:
      'It is an offence to deliberately make a statement which is knowingly false or misleading, or to recklessly submit false information as part of this request. If you do this, you may be liable to prosecution.',
    submitAction: 'Accept and send'
  },

  complete: {
    title: 'Registration request received',
    bprnPanelTitle: 'Registration request received',
    bprnPanelBody: 'Your battery producer reference number (BPRN) is',
    submittedPanelTitle: 'Application submitted',
    emailBodyPrefix: "We've sent a confirmation email to",
    whatNextHeading: 'What happens next',
    whatNext1:
      "An environmental regulator will review the information you provided. You'll usually receive a decision within 28 days. They may contact the appropriate person if they need more information.",
    whatNext2:
      "We'll email you when your registration has been approved or if you need to do anything else.",
    whileHeading: 'While you wait',
    whileIntro: 'You can:',
    whileBulletBprn: 'make a note of your BPRN',
    whileBulletProgress:
      'view the progress of your registration request in your account',
    returnAction: 'Return to your account'
  }
}
