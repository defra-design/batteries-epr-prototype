export const PROTOTYPE_SUBMISSION_SERVICE_NAME = 'Service name'

export const prototypeSubmissionContent = {
  breadcrumbs: [
    { text: 'GOV.UK', href: '#' },
    { text: 'Environment and countryside', href: '#' },
    { text: 'Producer responsibility for waste', href: '#' }
  ],

  signIn: {
    title: 'Sign in',
    heading: 'Sign in',
    warning:
      'Do not share your username, password or PIN with colleagues. Each person who needs access should apply for their own login.',
    usernameLabel: 'Username',
    passwordLabel: 'Password',
    forgotUsernameLink: 'Forgotten your username?',
    forgotPasswordLink: 'Forgotten your password or PIN?',
    loginAction: 'Log in'
  },

  terms: {
    title: 'Terms and conditions',
    heading: 'Terms and conditions',
    intro:
      'Before you continue, you need to agree to the terms and conditions for using this service. The full terms cover your responsibilities as a registered user, data accuracy, and liability.',
    summaryLabel: 'Summary of the terms and conditions',
    summaryBullets: [
      'keep your registration details accurate and up to date',
      'submit true and complete battery data on time',
      'pay the charges you owe under the regulations',
      'keep your login details secure'
    ],
    fullTermsLink: 'Read the full terms and conditions',
    important:
      'Important: you must not share your login details or contact information with other people in your organisation. Each person who needs access must register for their own login.',
    checkboxLabel: 'I have read and agree to the terms and conditions',
    continueAction: 'Continue',
    error: {
      title: 'There is a problem',
      agree: 'You must agree to the terms and conditions to continue'
    }
  },

  account: {
    title: 'Welcome',
    bannerTitle: 'Important',
    bannerHeading: 'Your annual data submission is due',
    bannerBody:
      'You need to reconfirm your details and submit data by 31 January 2027.',
    bannerLink: 'Start your submission',
    tabHome: 'Home',
    tabTasks: 'Tasks(1)',
    tabMessages: 'Messages',
    tabManageAccount: 'Manage account',
    defaultCompanyName: "Bab's Batteries Limited",
    activityDateColumn: 'Date',
    activityColumn: 'Activity',
    activityRows: [
      { date: '30 July 2026', activity: 'Users added' },
      { date: '30 July 2026', activity: 'Registration confirmed' },
      {
        date: '29 July 2026',
        activity: 'Application for registration received'
      }
    ],
    taskColumn: 'Task',
    taskDueColumn: 'Date due',
    taskStatusColumn: 'Status',
    taskName: 'Reconfirm your details and submit battery data',
    taskDue: '31 March 2027',
    taskStatus: 'Not started'
  },

  taskStart: {
    title: 'Reconfirm your details and submit your battery data',
    heading: 'Reconfirm your details and submit your battery data',
    intro:
      'You must complete this task each year if your organisation is registered as a small portable battery producer.',
    willIntro: 'You will need to:',
    willBullets: [
      'check your organisation and battery registration details',
      'report the weight of portable batteries you placed on the UK market during 2026',
      'pay the annual submission fee of £30'
    ],
    deadline: 'You must submit your return by 31 January 2027.',
    beforeHeading: 'Before you start',
    beforeIntro:
      'You will need the weight of portable batteries divided by chemistry:',
    chemistryBullets: ['lead-acid', 'nickel-cadmium', 'other'],
    continueAction: 'Continue'
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

  checkRegistration: {
    title: 'Check your answers',
    heading: 'Check your answers',
    continueAction: 'Continue'
  },

  brandQuestion: {
    title: 'Does your organisation supply batteries under a brand name?',
    heading: 'Does your organisation supply batteries under a brand name?',
    yesLabel: 'Yes',
    noLabel: 'No',
    continueAction: 'Continue',
    saveLink: 'Save and come back later',
    exitLink: 'Exit without saving',
    error: {
      title: 'There is a problem',
      choice:
        'Select yes if your organisation supplies batteries under a brand name'
    }
  },

  brandAdd: {
    title: 'What is the name of your battery brand?',
    heading: 'What is the name of your battery brand?',
    brandLabel: 'Brand name',
    addAnotherLink: 'Add another brand name',
    continueAction: 'Continue',
    saveLink: 'Save and come back later',
    exitLink: 'Exit without saving',
    error: {
      title: 'There is a problem',
      brand: 'Enter a brand name'
    }
  },

  brandConfirm: {
    title: 'Confirm your battery brand names',
    heading: 'Confirm your battery brand names',
    intro:
      'You need to confirm the brand names of the batteries you placed on the market in 2026. We save these details and link them to your account.',
    checkBody: 'Make sure they are correct before you continue.',
    emptyBody: 'Make sure you add all your brands before you continue.',
    addLink: 'Add battery brand name',
    removeAction: 'Remove',
    continueAction: 'Continue',
    saveLink: 'Save and come back later',
    exitLink: 'Exit without saving'
  },

  data: {
    title:
      'How much of each type of battery did you place on the UK market in 2026?',
    heading:
      'How much of each type of battery did you place on the UK market in 2026?',
    hint: 'Enter the total weight for each battery type. Include batteries supplied separately and batteries contained in products.',
    unitLegend: 'Which unit do you want to use?',
    kilogramsLabel: 'kilograms',
    tonnesLabel: 'tonnes',
    leadAcidLabel: 'Lead-acid',
    nickelCadmiumLabel: 'Nickel-cadmium',
    otherLabel: 'Other',
    totalPrefix: 'Total:',
    backAction: 'Back',
    continueAction: 'Continue',
    saveLink: 'Save and come back later',
    error: {
      title: 'There is a problem',
      unit: 'Select which unit you want to use',
      weight: 'Enter each weight in numbers only'
    }
  },

  checkData: {
    title: 'Check your battery data',
    heading: 'Check your battery data',
    intro: 'Check your answers are correct before making your submission.',
    rows: {
      batteryTypes: 'Type of batteries placed on market',
      brandNames: 'Battery brand names',
      weightsHeading: 'Weight of battery chemicals placed on market',
      leadAcid: 'Lead acid',
      nickelCadmium: 'Nickel-cadmium',
      other: 'Other',
      total: 'Total'
    },
    changeAction: 'Change',
    declarationHeading: 'Declaration',
    declarationIntro:
      'This submission must be made by the appropriate person for your organisation, or a delegated authority that has been approved by the Environment Agency.',
    firstNameLabel: 'First name',
    lastNameLabel: 'Last name',
    roleLabel: 'Role',
    acknowledgeLabel:
      'I acknowledge the information is correct to the best of my knowledge and belief.',
    warning:
      'It is an offence to deliberately make a statement which is knowingly false or misleading, or to recklessly submit false information as part of your application to register. If you do this, you may be liable to prosecution.',
    submitAction: 'Confirm and submit',
    error: {
      title: 'There is a problem',
      firstName: 'Enter your first name',
      lastName: 'Enter your last name',
      role: 'Enter your role',
      acknowledge: 'You must acknowledge the information is correct'
    }
  },

  payFee: {
    title: 'Pay your submission fee',
    heading: 'Pay your submission fee',
    body1:
      'You need to pay a £30 submission fee before you can submit your battery data.',
    body2:
      'Your answers have been saved. Your battery data will not be submitted until your payment is complete.',
    continueAction: 'Continue to payment'
  },

  payment: {
    title: 'Pay for your submission',
    heading: 'Pay for your submission',
    orderHeading: 'Order summary',
    referenceLabel: 'Reference',
    descriptionLabel: 'Description',
    description: 'Payment for Batteries Small Producer Submission 2025',
    amountLabel: 'Amount',
    amount: '£30.00',
    paymentDetailsHeading: 'Payment details',
    acceptNote: 'We accept Visa, Mastercard and American Express.',
    cardNumberLabel: 'Card number',
    cardholderLabel: "Cardholder's name",
    expiryLegend: 'Expiry date',
    expiryMonthLabel: 'MM',
    expiryYearLabel: 'YYYY',
    securityLabel: 'Security code',
    securityHint:
      '3 digits on the back of your card, or 4 digits on the front for American Express.',
    cancelAction: 'Cancel',
    payAction: 'Make payment',
    privacyNote:
      'When you submit your payment for processing, you confirm your acceptance of our privacy policy.',
    termsLink: 'Terms and conditions of payment'
  },

  paymentConfirmed: {
    title: 'Payment received',
    panelTitle: 'Payment received',
    panelBodyPrefix: 'Your payment reference',
    receivedBody:
      "We've received your payment of £30.00 for your Batteries Small Producer Submission 2025.",
    whatNextHeading: 'What happens next',
    whatNextBody:
      "Your annual data submission is now complete. We've emailed you a confirmation and a receipt for this payment. You can view your submission at any time from your dashboard.",
    returnLink: 'Return to your dashboard',
    feedbackNote:
      'This is a new service — your feedback will help us improve it.'
  }
}
