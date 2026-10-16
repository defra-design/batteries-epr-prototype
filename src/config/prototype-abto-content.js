export const PROTOTYPE_ABTO_SERVICE_NAME = 'Batteries: Treatment Operator'

export const PROTOTYPE_ABTO_OPERATOR_NAME = 'Halton Battery Processing Ltd'

export const prototypeAbtoContent = {
  dashboard: {
    title: 'Incoming waste deliveries',
    heading: 'Incoming waste deliveries',
    caption: PROTOTYPE_ABTO_OPERATOR_NAME,
    subHeading: 'Pending verification',
    intro:
      'Deliveries that schemes have reported handing over to you. Compare each one against your weighbridge records before accepting it.',
    columns: {
      scheme: 'Scheme'
    },
    verifyAction: 'Verify'
  },
  threshold: {
    title: "You've crossed your small operator threshold",
    heading: "You'veee crossed your small operator threshold",
    backLinkText: 'Back',
    banner: {
      title: 'Important',
      heading: 'You must pay a balancing fee for this approval year',
      body: 'Your evidence issued for portable batteries has gone over the small operator threshold. You must pay the balance for this facility within {days} days, by {payBy}.'
    },
    totalsHeading: 'Your running totals this approval year',
    explanation:
      'You were approved as a small operator, which carries a lower fee. Once your evidence issued for portable batteries exceeds {threshold} tonnes in an approval year, you must pay the balance to the standard fee for this facility.',
    balanceDue: 'Balance due: {amount}',
    payAction: 'Pay your balance'
  },
  email: {
    title: 'Action needed: Small operator threshold',
    heading: "Action needed: you've crossed the small operator threshold",
    caption: 'Example email — not part of the service',
    fromLabel: 'From',
    toLabel: 'To',
    dateLabel: 'Sent',
    subjectLabel: 'Subject',
    from: 'Batteries: Treatment Operator <no-reply@batteries.service.gov.uk>',
    greeting: 'Dear {name},',
    body: '{operator} has issued more than {threshold} tonnes of portable battery evidence this approval year ({total} tonnes to date). You were approved as a small operator, so you now need to pay the balance to the standard fee for your facility.',
    signIn:
      'Sign in to your Batteries account to check your running totals and pay the balance.',
    action: 'Review and pay',
    deadline:
      'You must pay the balance within {days} days of crossing the threshold, by {payBy}. If you do not, the regulator can take enforcement action.',
    error:
      'If you believe this was triggered in error, contact your account administrator before the deadline.'
  },
  pay: {
    title: 'Pay your balance',
    heading: 'Pay your balance',
    reasonLabel: 'Reason',
    reason: 'Small operator threshold exceeded — portable batteries',
    amountLabel: 'Amount due',
    payByLabel: 'Pay by',
    methodHeading: 'How do you want to pay?',
    methods: {
      card: 'Debit or credit card',
      bankTransfer: 'Bank transfer'
    },
    errorTitle: 'There is a problem',
    errorMessage: 'Select how you want to pay',
    action: 'Continue to payment'
  },
  cardPayment: {
    title: 'Pay with GOV.UK Pay',
    heading: 'Your payment is handled by GOV.UK Pay',
    intro:
      'In the live service you would now be taken to GOV.UK Pay to enter your card details.',
    amountLabel: 'Amount',
    reasonLabel: 'Reason',
    referenceLabel: 'Payment reference',
    prototypeNotice:
      'This is a prototype. No payment is taken and no card details are collected.',
    success: 'Simulate successful payment',
    cancel: 'Simulate cancelling payment'
  },
  paymentReceived: {
    title: 'Balance payment received',
    heading: 'Balance payment received',
    bannerTitle: 'Success',
    body: 'Your balancing fee for exceeding the small operator threshold has been paid. Your approval remains Small operator status until your next renewal.',
    amountLabel: 'Amount paid',
    methodLabel: 'Payment method',
    referenceLabel: 'Payment reference',
    paidLabel: 'Paid',
    action: 'Back to your waste returns'
  },
  wasteReturns: {
    title: 'Your waste returns',
    heading: 'Your waste returns',
    tabsTitle: 'Waste returns sections',
    tabs: {
      sites: 'Your sites',
      intakeLog: 'Intake log',
      wasteReturns: 'Waste returns',
      queries: 'Queries'
    },
    otherTab: 'This section is not part of this prototype.',
    inset:
      '{quarter} reporting period — {start} to {end}. Deadline: {deadline} ({days} days remaining). If you need to correct a figure in an earlier return, we create a new version and keep the original.',
    returnsHeading: 'Your quarterly waste returns',
    returnsColumns: {
      period: 'Period',
      submitted: 'Submitted',
      tonnes: 'Tonnes accepted',
      status: 'Status',
      action: 'Action'
    },
    viewRecord: 'View record and history',
    startHeading: 'Start your {quarterShort} return',
    startBody:
      'You can enter and save this return. Only the appropriate person, {person}, can make the declaration and submit it.',
    siteLabel: 'Which site is this return for?',
    startAction: 'Start {quarterShort} return'
  },
  totals: {
    columns: {
      category: 'Category',
      threshold: 'Small operator threshold',
      total: 'Your total this year',
      status: 'Status'
    },
    unit: 'tonnes',
    status: {
      exceeded: 'Exceeded',
      within: 'Within threshold'
    }
  }
}
