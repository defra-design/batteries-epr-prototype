export const prototypeRegulatorWasteReturnsContent = {
  tabs: {
    wasteReturns: 'Waste returns',
    abtos: 'ABTOs',
    schemes: 'Schemes',
    reports: 'Reports',
    flags: 'Flags'
  },

  statusLabels: {
    awaitingReview: 'Awaiting review',
    accepted: 'Accepted',
    querySent: 'Query sent',
    overdue: 'Overdue'
  },
  statusColours: {
    awaitingReview: 'yellow',
    accepted: 'green',
    querySent: 'blue',
    overdue: 'yellow'
  },

  home: {
    title: 'Waste returns',
    heading: 'Waste returns',
    intro:
      'Quarterly waste returns from approved battery treatment operators (ABTOs) and approved battery schemes (ABSs). Start by choosing the compliance scheme the waste was handed over by.',
    columns: {
      scheme: 'Compliance scheme',
      operators: 'Operators',
      awaitingReview: 'Awaiting review'
    },
    noReturns: 'No waste returns',
    viewAction: 'View operators'
  },

  schemeAbtos: {
    title: 'Waste returns',
    intro:
      'Quarterly waste returns from operators that treated batteries handed over by {scheme}.',
    statusLabel: 'Status',
    periodLabel: 'Period',
    operatorTypeLabel: 'Operator type',
    allStatuses: 'All statuses',
    allOperatorTypes: 'ABTOs and ABSs',
    columns: {
      operator: 'Operator',
      approval: 'Approval number',
      type: 'Type',
      submitted: 'Submitted',
      status: 'Status'
    },
    notSubmitted: 'Not submitted',
    sitesTemplate: '{count} approved sites'
  },

  abtoSites: {
    title: 'Which site’s waste return do you want to review?',
    heading: 'Which site’s waste return do you want to review?',
    introTemplate:
      '{abto} has {count} approved sites that treated batteries handed over by {scheme}. Each site submits its own waste return.',
    legend: 'Select a site',
    continueAction: 'Continue',
    error: {
      title: 'There is a problem',
      site: 'Select a site'
    }
  },

  review: {
    title: 'Review waste return',
    factsLabels: {
      approvalNumber: 'Approval number',
      reviewPeriod: 'Active review period',
      deadline: 'Statutory determination deadline',
      regulator: 'Regulator',
      scheme: 'Compliance scheme'
    },
    regulatorName: 'Environment Agency',
    reconciliationHeadingTemplate: 'Reconciliation against BENs — {period}',
    reconciliationColumns: {
      category: 'Category',
      intake: 'ABTO intake log',
      bens: 'BEN evidence issued'
    },
    reconciliationStatusRow: 'Status',
    matchConfirmed: 'Match confirmed',
    mismatchFound: 'Mismatch found',
    unissuedStockpile: 'Unissued stockpile',
    bensHeadingTemplate: 'Battery evidence notes (BENs) — {period}',
    bensSummaryTemplate:
      '{abto} has issued {count} BENs totalling {tonnes} tonnes for {period}.',
    bensNote:
      'BENs are often issued after the quarter ends, so recent notes may not show yet.',
    viewBensTemplate: 'View all BENs for {abto}',
    checksHeading: 'Automated data checks',
    noChecks: 'No automated checks raised an issue for this return.',
    actionsHeading: 'Caseworking actions',
    acceptAction: 'Accept submission',
    acceptHint: 'Locks the record and generates the national rolling total.',
    queryAction: 'Query specific row',
    queryHint:
      'Select individual lines and send them back to the ABTO without returning the whole submission.',
    closedNoticeAccepted:
      'This return has been accepted and locked. No further decisions can be made.',
    closedNoticeQuerySent:
      'A query has been sent to the ABTO. The submission stays open for review until they respond.',
    notSubmittedNotice:
      'This site has not submitted a waste return for this period yet.',
    timelineHeading: 'Activity timeline',
    currentView: '(current view)',
    statusPrefix: 'Status'
  },

  accept: {
    title: 'Are you sure you want to accept this submission?',
    heading: 'Are you sure you want to accept this submission?',
    warning:
      'Accepting locks this record permanently. It will be added to the national rolling total and no further online edits can be made.',
    mismatchNoteTemplate:
      'The {category} row still does not match BENs issued. Consider querying this row instead of accepting if you have not already resolved it.',
    matchConfirmed: 'match confirmed',
    mismatch: 'data mismatch, not yet resolved',
    confirmAction: 'Yes, accept this submission',
    cancelAction: 'Cancel and go back'
  },

  accepted: {
    title: 'Submission accepted',
    bannerTitle: 'Submission accepted',
    bannerHeadingTemplate: '{site} — {period} return accepted',
    bannerBodyTemplate:
      'This record is now locked and has been added to the national rolling total. {abto} and {scheme} have been notified.',
    labels: {
      operator: 'Operator',
      approvalNumber: 'Approval number',
      scheme: 'Compliance scheme',
      determination: 'Determination',
      decidedBy: 'Decided by',
      timestamp: 'Timestamp',
      rollingTotal: 'National rolling total'
    },
    determination: 'Accepted, no further action required',
    decidedBy: 'EA caseworker',
    rollingTotalTemplate: '{tonnes} tonnes (updated)',
    wasteReturnsAction: 'Go to waste returns',
    letterLink: 'View determination letter'
  },

  queryCategories: {
    title: 'Which categories do you want to query?',
    heading: 'Which categories do you want to query?',
    hint: 'Select all categories to query for this approval number. The other sites and categories stay unchanged.',
    continueAction: 'Continue',
    cancelAction: 'Cancel',
    error: {
      title: 'There is a problem',
      categories: 'Select at least one category to query'
    }
  },

  queryDetails: {
    title: 'Send your query',
    heading: 'Send your query',
    recipientsHeading: 'Who should receive this query?',
    recipientsHint:
      'Queries go to the ABTO only. Select all authorised contacts who should receive it.',
    reasonLabel: 'Explain the query',
    reasonHint:
      'For example, NiCd tonnage in the return does not match BENs issued.',
    sendAction: 'Send query',
    cancelAction: 'Cancel',
    error: {
      title: 'There is a problem',
      recipients: 'Select at least one contact to receive the query',
      reason: 'Explain the query'
    }
  },

  querySent: {
    title: 'Query sent',
    bannerTitle: 'Success',
    bannerHeading: 'Query sent',
    bannerBodyTemplate:
      'Your query about {site} ({approval}) has been sent to {abto}. The submission stays open for review until they respond.',
    labels: {
      siteAndCategories: 'Site and categories queried',
      routedTo: 'Routed to',
      reason: 'Reason given',
      status: 'Status',
      sent: 'Sent'
    },
    routedToTemplate: '{abto} (the ABTO)',
    statusValue: 'Query sent',
    nextHeading: 'What happens next',
    nextBodyTemplate:
      '{abto} has 10 working days to respond about {site} ({approval}) – {categories}. The other sites and categories in the return are not affected.',
    backToReturnTemplate: 'Back to {abto} return',
    wasteReturnsAction: 'Go to waste returns'
  },

  flags: {
    title: 'Threshold flags',
    heading: 'Threshold flags',
    intro:
      'These ABTOs have issued over 15 tonnes of battery evidence notes (BENs) this approval year and may need reclassifying from a small to a large operator.',
    empty: 'No ABTOs are over the small-operator threshold.',
    columns: {
      operator: 'Operator',
      approval: 'Approval number',
      classification: 'Classification',
      bens: 'BEN issued (CTD)',
      status: 'Status'
    },
    exceeded: 'Exceeded',
    reviewAction: 'Review classification'
  },

  abtoAccount: {
    title: 'ABTO account',
    factsLabels: {
      approvalNumber: 'Approval number',
      classification: 'Current classification',
      bens: 'BENs issued this approval year',
      thresholdStatus: 'Threshold status'
    },
    tabs: {
      overview: 'Overview',
      submissions: 'Submissions',
      evidenceNotes: 'Evidence notes',
      complianceHistory: 'Compliance history'
    },
    summaryHeading: 'Account summary',
    summaryLabels: {
      tradingName: 'Trading name',
      siteAddress: 'Site address',
      operatorType: 'Operator type',
      approvedSince: 'Approved since',
      schemesServed: 'Compliance schemes served'
    },
    operatorTypes: {
      ABTO: 'Approved battery treatment operator (ABTO)',
      ABS: 'Approved battery scheme (ABS)'
    },
    classifications: { small: 'Small ABTO', large: 'Large ABTO' },
    thresholdStatuses: { exceeded: 'Exceeded', reclassified: 'Reclassified' },
    thresholdWarningHeading:
      'This ABTO has crossed the small-operator threshold',
    thresholdWarningTemplate:
      '{abto} has issued {tonnes} tonnes of BENs this approval year, over the 15.000 tonne small-operator threshold. Review their classification to update this account and record the increased fee.',
    reviewAction: 'Review operator classification'
  },

  classification: {
    title: 'Review operator classification',
    thresholdHeading: 'Small to large operator threshold',
    thresholdBody:
      'An ABTO becomes a large operator once it issues more than 15 tonnes of battery evidence notes (BENs) in an approval year. Large operators pay an increased annual fee. This is not yet calculated automatically — if you reclassify this ABTO, record the fee taken outside the system as a note on their account.',
    bensLineTemplate: 'BENs issued this approval year: {tonnes} tonnes',
    thresholdLine: 'Small operator threshold: 15.000 tonnes',
    overLineTemplate: 'Amount over threshold: {tonnes} tonnes',
    questionHeading: 'What do you want to do?',
    options: {
      reclassify: 'Reclassify as a large ABTO',
      keep: 'Keep as a small ABTO for now'
    },
    continueAction: 'Continue',
    error: {
      title: 'There is a problem',
      decision: 'Select what you want to do'
    }
  },

  classificationConfirm: {
    titleTemplate: 'Confirm reclassification: {abto}',
    intro: 'Check the details below before you update this ABTO’s account.',
    labels: {
      operator: 'Operator',
      approvalNumber: 'Approval number',
      currentClassification: 'Current classification',
      newClassification: 'New classification',
      effectiveFrom: 'Effective from'
    },
    effectiveFrom: '1 Oct 2026 (start of next quarter)',
    feeLabel: 'Fee payment reference or note',
    feeHint:
      'The increased annual fee is taken outside this system. Record the payment reference or a short note here.',
    confirmAction: 'Confirm reclassification',
    cancelAction: 'Cancel',
    error: {
      title: 'There is a problem',
      fee: 'Enter a fee payment reference or note'
    }
  },

  reclassified: {
    titleTemplate: 'ABTO reclassified: {abto}',
    bannerTitle: 'Success',
    bannerHeading: 'ABTO reclassified',
    bannerBodyTemplate:
      '{abto} has been updated from a small to a large ABTO. This account change is now saved.',
    labels: {
      newClassification: 'New classification',
      effectiveFrom: 'Effective from',
      feeReference: 'Fee payment reference',
      updatedBy: 'Updated by',
      updated: 'Updated'
    },
    updatedBy: 'Tom Hughes, EA caseworker',
    nextHeading: 'What happens next',
    nextBodyTemplate:
      '{abto} will be notified of the reclassification. The increased annual fee applies from their next invoice. This ABTO no longer appears in your threshold flags queue.',
    backToFlags: 'Back to threshold flags',
    viewAccountTemplate: 'View {abto}’s account'
  }
}
