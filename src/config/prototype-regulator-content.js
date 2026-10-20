export const PROTOTYPE_REGULATOR_SERVICE_NAME = 'Batteries: Regulator'

export const prototypeRegulatorContent = {
  signIn: {
    title: 'Sign in to your GOV.UK One Login',
    heading: 'Sign in to your GOV.UK One Login',
    emailLabel: 'Email address',
    passwordLabel: 'Password',
    forgotEmailLink: 'Forgot your email address?',
    forgotPasswordLink: 'Forgot your password?',
    signInAction: 'Sign in',
    createLink: 'Create a GOV.UK One Login'
  },

  dashboard: {
    title: 'PoM submissions',
    heading: 'PoM submissions',
    quickLinks: {
      label: 'Quick links',
      links: {
        overdue: 'Overdue submissions',
        openQueries: 'Open queries',
        failedValidation: 'Failed validation uploads',
        otherReports: 'Other reports'
      }
    },
    year: {
      heading: 'Submissions year',
      hint: 'View submission counts for a different year (2010 to 2026)',
      label: 'Submissions year',
      action: 'View year',
      first: 2010,
      last: 2026
    },
    tasksHeading: 'Q{quarter} {year} tasks',
    tasks: {
      toReview: { label: 'To review', link: 'Review {scheme} return' },
      overdue: { label: 'Overdue', link: 'View overdue submissions' },
      newResponses: { label: 'New responses', link: 'Review answered record' },
      openQueries: { label: 'Open queries', link: 'View open queries' }
    },
    returnsHeading: 'Q{quarter} {year} returns',
    returnsIntro:
      'Quarterly battery data returns across all compliance schemes. Newest first — select a column heading to sort by submitted date or status.',
    noReturns: 'There are no returns for Q{quarter} {year}.',
    allTab: 'All',
    columns: {
      scheme: 'Scheme',
      members: 'Members',
      submitted: 'Submitted',
      status: 'Status',
      flags: 'Flags'
    },
    statusLabels: {
      received: 'Received',
      accepted: 'Accepted',
      queried: 'Queried',
      rejected: 'Rejected',
      notYetSubmitted: 'Not yet submitted',
      overdue: 'Overdue'
    },
    viewAction: 'View'
  },

  schemeHome: {
    title: 'Scheme home',
    backLink: 'Back to submissions',
    detailsHeading: 'Scheme details',
    approvalNumberLabel: 'Approval number',
    approvedLabel: 'Approved',
    membersLabel: 'Members',
    seeAllMembers: 'See all members',
    authorisedSignatoryLabel: 'Authorised signatory',
    superUserLabel: 'Super User',
    quickLinks: {
      record: 'View scheme record',
      members: 'View members',
      submissions: 'View all submissions'
    },
    submissionHeading: '{period} submission',
    statusLabels: {
      received: 'Received',
      accepted: 'Accepted',
      queried: 'Queried',
      rejected: 'Rejected',
      notYetSubmitted: 'Not yet submitted'
    },
    intro: {
      received:
        'Received on {submittedOn} as {filesCount} CSV data files and {evidenceCount} supporting evidence document. Files that failed validation were rejected at upload, so everything below is ready to review.',
      accepted: '{scheme} return was accepted on {decidedOn}.',
      rejected: '{scheme} return was rejected on {decidedOn}.',
      queried:
        'You queried {queried} records in this return on {queriedOn}. {scheme} can see the query and the reason in their account — nothing was sent by email. The other {others} records in the quarter are unaffected and stand as submitted.',
      notYetSubmitted: '{scheme} has not yet submitted a return for {period}.'
    },
    deadline:
      'Due {deadline} — received {daysLate} days late. After {lockOn}, any changes to {quarter} figures must be made in the {nextPeriod} submission.',
    deadlineOnTime:
      'Due {deadline}. After {lockOn}, any changes to {quarter} figures must be made in the {nextPeriod} submission.',
    statusHeading: 'Submission status',
    tasks: {
      submitted: { title: 'Submitted by the scheme', status: 'Done' },
      checks: { title: 'Automated data checks', status: 'Passed' },
      review: { title: 'Regulator review', status: 'Not started' },
      decision: { title: 'Decision', status: 'Cannot start yet' }
    },
    summary: {
      scheme: 'Scheme',
      period: 'Period',
      files: 'Files',
      validation: 'Validation',
      failedValidation: 'Failed validation ({year})',
      submittedBy: 'Submitted by',
      submitted: 'Submitted',
      recordsQueried: 'Records queried',
      responseDue: 'Response due',
      decided: 'Decided'
    },
    filesValue:
      '{filesCount} CSV files ({members} producers) + {evidenceCount} supporting evidence document',
    filesValueSimple: '{filesCount}',
    validationValue: 'Passed — {flags} figures flagged for review',
    failedValidationValue:
      '{count} uploads rejected — {byQuarter}. Used in the scheme risk (RAG) rating.',
    viewAll: 'View all',
    statusLabel: 'Status:',
    viewFilesLink: 'View submission files and supporting evidence ({count})',
    viewFilesLinkSimple: 'View submission files ({count})',
    viewQueriedLink: 'View queried records ({count})',
    viewHistoryLink: 'View history for this quarter',
    reviewAction: 'Review this return',
    reviewAnsweredAction: 'Review answered records'
  },

  schemeRecord: {
    title: 'Scheme record',
    backLink: 'Back to submissions',
    status: { text: 'Approved', colour: 'green' },
    intro:
      'The full record the regulator holds for this scheme. Nothing here can be edited by the regulator — changes are made by the scheme and confirmed on review.',
    organisationHeading: 'Organisation details',
    organisation: {
      legalName: 'Legal name',
      tradingName: 'Trading name',
      companiesHouseNumber: 'Companies House number',
      registeredOffice: 'Registered office',
      nation: 'Nation'
    },
    nation: 'England',
    approvalHeading: 'Approval',
    approval: {
      number: 'Approval number',
      approvedOn: 'Approved on',
      expires: 'Approval expires',
      status: 'Approval status',
      conditions: 'Conditions of approval'
    },
    approvalStatus: 'Approved',
    conditionsValue: 'Issued {approvedOn}',
    peopleHeading: 'People',
    people: {
      authorisedSignatory: 'Authorised signatory',
      superUser: 'Super User',
      accountManager: 'Regulator account manager'
    },
    documentsHeading: 'Documents and history',
    documents: {
      conditions: 'View conditions of approval',
      files: 'View agency files',
      notes: 'View notes on this scheme',
      history: 'View scheme history'
    },
    backToScheme: 'Back to {scheme}'
  },

  schemeMembers: {
    title: 'Scheme members',
    backLink: 'Back to submissions',
    intro:
      '{count} producers are registered through this scheme for {year}. Members are added by the scheme; the regulator confirms them and issues the BPRN. A member with no figures in the quarter still appears here, so a gap is visible rather than silent.',
    columns: {
      member: 'Member',
      bprn: 'BPRN',
      joined: 'Joined',
      returnStatus: '{period} return'
    },
    statusLabels: {
      included: { text: 'Included', colour: 'green' },
      queried: { text: 'Queried', colour: 'orange' },
      noFigures: { text: 'No figures', colour: 'grey' }
    },
    viewAction: 'View',
    downloadLink: 'Download member list (CSV)',
    submissionsLink: 'View all submissions',
    backToScheme: 'Back to {scheme}'
  },

  schemeSubmissions: {
    title: 'All submissions',
    backLink: 'Back to submissions',
    intro:
      'Every quarter is decided on its own. A queried or rejected quarter does not block the ones after it.',
    columns: {
      quarter: 'Quarter',
      submitted: 'Submitted',
      files: 'Files',
      decision: 'Decision',
      decided: 'Decided'
    },
    statusLabels: {
      received: 'Received',
      accepted: 'Accepted',
      queried: 'Queried',
      rejected: 'Rejected',
      notYetSubmitted: 'Not yet submitted'
    },
    awaitingDecision: 'Awaiting decision',
    viewAction: 'View',
    windows: {
      heading: 'Submission windows',
      hint: 'Q1–Q3 figures lock 2 months after the deadline. Q4 stays open for historical adjustments for 3 years.',
      locksOn: 'Locks {date}',
      lockedOn: 'Locked {date}',
      openUntil: 'Open for adjustments until {date}',
      open: { text: 'Open · locks in {days} days', colour: 'yellow' },
      locked: { text: 'Locked', colour: 'grey' },
      extended: { text: 'Extended window · 3 years', colour: 'blue' }
    },
    downloadLink: 'Download submission history (.csv)',
    historyLink: 'View scheme history',
    backToScheme: 'Back to {scheme}'
  },

  runningDataChecks: {
    title: 'Running data checks',
    heading: 'Running data checks',
    intro:
      'Comparing each producer’s figures with the previous quarter and the same quarter last year.',
    wait: 'This will take a few seconds. Do not close the page.',
    continueLink: 'Continue'
  },

  dataCheckReport: {
    title: 'Figures flagged for review',
    heading: 'Figures flagged for review',
    backLink: 'Back to submissions',
    intro:
      '{count} figures flagged across {producers} producers in {scheme}’s {period} return. Each producer is compared with the previous quarter and the same quarter last year, by tonnes as well as percentage. Check the scheme’s supporting evidence before raising a query.',
    flagsHeading: 'Flags',
    flagsHint:
      'Flagged by the service. These are prompts to look, not errors — you decide what to query.',
    columns: {
      producer: 'Producer',
      flagged: 'What was flagged',
      flag: 'Flag'
    },
    // Colours by meaning: all of these are prompts to look rather than errors,
    // so none is red; yellow is a plain heads-up and purple marks estimates.
    types: {
      variance: { text: 'Variance', colour: 'orange' },
      chemistryChange: { text: 'Chemistry change', colour: 'orange' },
      repeatedFigure: { text: 'Repeated figure', colour: 'yellow' },
      estimated: { text: 'Estimated', colour: 'purple' }
    },
    notesHeading: 'Your notes',
    notesIntro:
      'Private to the regulator. Notes are not sent to the scheme — you raise queries against individual producers on the next screen.',
    notesLabel: 'Your notes',
    notesMax: 1000,
    continueAction: 'Review producer figures',
    errorTitle: 'There is a problem',
    errors: { notesTooLong: 'Notes must be 1000 characters or fewer' }
  },

  batterySalesDataSubmission: {
    title: 'Battery sales data submission',
    heading: '{scheme} — {period} return',
    backLink: 'Back to submissions',
    tabsLabel: 'Review sections',
    producerFiguresTab: { id: 'producer-figures', text: 'Producer figures' },
    compareReturnsTab: { id: 'compare-returns', text: 'Compare returns' },
    indicativeObligationTab: {
      id: 'indicative-obligation',
      text: 'Indicative obligation'
    },
    producerFigures: {
      heading: 'Producer figures',
      intro:
        'Every producer in the return is listed. Raise your own query against any figure, or remove a flag if the supporting evidence explains it. Queries are saved as drafts — nothing is sent to {scheme} until you confirm your decision.',
      showLabel: 'Show:',
      filters: {
        all: 'All ({count})',
        flagged: 'Flagged ({count})',
        drafts: 'Draft queries ({count})'
      },
      searchLabel: 'Search producer',
      searchAction: 'Search',
      columns: {
        producer: 'Producer',
        chemistry: 'Chemistry',
        figure: 'Figure (t)',
        change: 'Change on Q1',
        draftQuery: 'Draft query',
        action: 'Action'
      },
      none: 'None',
      chemistry: 'Chemistry',
      edit: 'Edit',
      remove: 'Remove',
      raise: 'Raise query',
      empty: 'No producers match.'
    },
    compareReturns: {
      heading: 'Compare producer returns',
      intro:
        'Each producer is compared with the previous quarter and the same quarter last year. A figure is flagged if it changes by more than the percentage OR the tonnage you set, or if the chemistry changes with the same tonnage. Select a producer to see their full history.',
      thresholdHeading: 'Flag changes over',
      threshold: '{percent}% or {tonnes} t',
      columns: {
        producer: 'Producer',
        thisQuarter: 'This quarter (t)',
        lastQuarter: 'Last quarter (t)',
        change: 'Change',
        lastYear: 'Same qtr last year (t)'
      },
      total: 'Total',
      viewExplanation: 'View explanation'
    },
    indicativeObligation: {
      heading: 'Indicative obligation',
      intro:
        'The same calculation {scheme} sees as a live estimate during the year, updated with this return once it is accepted.',
      rows: {
        2024: '2024 placed on market',
        2025: '2025 placed on market',
        2026: '2026 placed on market so far',
        average: '3-year average',
        evidence: 'Evidence acquired so far',
        obligation: 'Indicative obligation ({year}, at {rate}%)',
        remaining: 'Still to acquire'
      },
      tonnes: '{amount} tonnes',
      annualised: '{amount} tonnes (annualised: {annualised} tonnes)',
      partYear: '{amount} tonnes ({year} is a part year so far)',
      remaining: '{amount} tonnes ({percent}% of the obligation)'
    },
    continueAction: 'Continue to decision'
  },

  reviewPomReturn: {
    title: 'Review PoM return',
    heading: '{scheme} — {period} return',
    backLink: 'Back to submissions',
    statusLabels: {
      received: 'Received',
      accepted: 'Accepted',
      queried: 'Queried',
      rejected: 'Rejected',
      notYetSubmitted: 'Not yet submitted'
    },
    // Colours by meaning, shared with the compliance scheme's query response
    // journey so "Queried" is the same word and colour on both sides.
    statusColours: {
      received: 'blue',
      accepted: 'green',
      queried: 'orange',
      rejected: 'red',
      notYetSubmitted: 'grey'
    },
    intro: {
      received:
        'Submitted on {submittedOn} — {daysLate} days after the {deadline} deadline.',
      receivedOnTime:
        'Submitted on {submittedOn}, before the {deadline} deadline.',
      accepted:
        'Submitted {submittedOn} ({daysLate} days late). Accepted on {decidedOn}. The scheme’s obligation has been updated with these figures.',
      acceptedOnTime:
        'Submitted {submittedOn}. Accepted on {decidedOn}. The scheme’s obligation has been updated with these figures.',
      queried:
        '{count} producer records queried. The rest of the {period} return is not changed while the scheme responds, and {nextPeriod} is not blocked.',
      rejected:
        'Rejecting this return does not block any other quarter. {nextPeriod} can still be submitted on time and is assessed on its own.'
    },
    late: { text: 'Submitted late', colour: 'red' },
    lockNote:
      'After {lockOn}, any changes to {quarter} figures must be made in the {nextPeriod} submission.',
    summary: {
      totalPlaced: 'Total placed on market',
      producers: 'Producers included',
      queries: 'Queries raised',
      waste: 'Waste data',
      submittedBy: 'Submitted by',
      obligation: 'Indicative obligation ({year})',
      evidence: 'Evidence acquired so far',
      remaining: 'Still to acquire',
      decision: 'Decision',
      restOfReturn: 'Rest of return',
      assessedBy: 'Assessed by',
      respondBy: 'Respond by',
      reason: 'Reason',
      details: 'Details',
      resubmitBy: 'Resubmit by'
    },
    producersValue: '{included} of {total}',
    tonnesValue: '{amount} tonnes',
    draftQueriesValue: '{count} draft queries — {producers} (not sent yet)',
    noDraftQueries: 'No draft queries',
    wasteValue: '{period} waste return received — review before accepting',
    obligationValue: '{amount} tonnes — updated with {period}',
    remainingValue: '{amount} tonnes ({percent}% of the obligation)',
    decisionValue: {
      queried: 'Queried — {count} producer records',
      rejected: 'Rejected — whole return'
    },
    restOfReturnValue:
      'Not changed — no resubmission needed unless a figure is corrected',
    assessedByValue: 'Environment Agency ({name}), {date}',
    links: {
      documents: 'Review with supporting documents ({file})',
      figures: 'View producer figures and draft queries',
      compare: 'Compare producer returns',
      waste: 'View {period} waste data',
      obligation: 'View indicative obligation',
      reconcile: 'Reconcile with waste and evidence',
      amendments: 'View amendment history',
      threeYear: 'Compare figures — 3-year view'
    },
    decisionHeading: 'Confirm your decision',
    decisionIntro:
      'This quarter is assessed on its own — it does not block later quarters. The outcome is recorded against the return, and {scheme} sees it when they sign in.',
    decisionLegend: 'What do you want to do?',
    options: {
      accept: {
        text: 'Accept the return',
        hint: 'No reason needed. The return is accepted by the Environment Agency and the scheme’s obligation is updated.'
      },
      query: {
        text: 'Send queries to the scheme',
        hint: 'Sends the {count} draft queries from the producer figures screen, each against its own producer. The rest of the return is not changed while the scheme responds. You can add more queries before sending.'
      },
      reject: {
        text: 'Reject the whole return',
        hint: 'For example, data was changed for a producer without being declared as a resubmission, or the scheme has asked for the return to be rejected. The scheme corrects and resubmits by a date you set.'
      }
    },
    reasonLabel: 'Reason (only needed to query or reject)',
    reasonHint: '{scheme} sees this in the service when they sign in.',
    respondByLabel: 'Respond or resubmit by (only needed to query or reject)',
    respondByHint:
      'Set a date and time. Short deadlines are fine for quick answers — for example, 12pm on 21 August 2026.',
    timeLabel: 'Time',
    timeHint: 'For example, 12pm',
    confirmAction: 'Confirm decision',
    banner: {
      accepted: {
        title: 'Success',
        type: 'success',
        heading: 'Return accepted',
        body: 'Accepted by the Environment Agency on {decidedOn}. {scheme} sees this when they sign in.'
      },
      queried: {
        title: 'Important',
        type: 'information',
        heading: 'Queries sent to {scheme}',
        body: 'They see each query when they sign in.'
      },
      rejected: {
        title: 'Important',
        type: 'information',
        heading: 'Return rejected',
        body: '{scheme} sees the reason when they sign in.'
      }
    },
    queries: {
      heading: 'Queries',
      columns: {
        producer: 'Producer',
        chemistry: 'Chemistry',
        figure: 'Figure (t)',
        query: 'Query',
        status: 'Status'
      },
      sent: { text: 'Sent', colour: 'orange' },
      resubmitted: { text: 'Resubmitted', colour: 'blue' }
    },
    sees: {
      heading: 'What {scheme} sees',
      body: 'They see each query against the producer it relates to. For each one they can either reply with an explanation (for example, extra stock bought in for Christmas) or correct the figure by resending just that producer’s record. You then review each response and accept it or query again.'
    },
    downloads: {
      queried: 'Download queried records ({file}, 4KB)',
      full: 'Download the full submission as uploaded (.zip, 2.1MB)'
    },
    rejectedNote:
      'The submitted files are kept as they were. When the scheme resubmits, both versions stay in the record so the change is auditable.',
    footerLinks: {
      obligationFull: 'View obligation and evidence in full',
      files: 'View submission files ({count})',
      history: 'View history for this quarter',
      figures: 'View producer figures',
      obligation: 'View indicative obligation',
      back: 'Back to PoM submissions'
    },
    errorTitle: 'There is a problem',
    errors: {
      decisionRequired: 'Select what you want to do with the return',
      reasonRequired: 'Enter a reason',
      reasonTooLong: 'Reason must be 1000 characters or fewer',
      respondByRequired: 'Enter a date and time to respond or resubmit by',
      respondByDate: 'Enter a real date, like 21 8 2026',
      respondByTime: 'Enter a time, like 12pm or 9:30am',
      noDraftQueries:
        'There are no draft queries to send. Raise a query against a producer first'
    }
  },

  // How a single queried record is labelled and coloured; also read by the
  // compliance scheme's query response journey.
  reviewPomReturnQueried: {
    figureStatusLabels: { queried: 'Queried', resubmitted: 'Resubmitted' },
    figureStatusColours: { queried: 'orange', resubmitted: 'blue' }
  },

  rejectConfirm: {
    title: 'Reject the whole return?',
    heading: 'Reject the whole {period} return?',
    tag: { text: 'Whole return', colour: 'red' },
    backLink: 'Back to submissions',
    intro:
      'The whole return goes back to {scheme} to correct and resubmit. If only a few figures are wrong, you can send queries instead.',
    warning:
      '{scheme}’s {period} data won’t be used for national compilation until they resubmit. Other quarters are not affected.',
    typeLegend: 'Why are you rejecting the return?',
    types: {
      undeclaredChange: {
        text: 'Data changed without being declared as a resubmission',
        hint: 'Figures for one or more producers differ from the earlier return, but the return was not marked as a resubmission'
      },
      schemeRequested: {
        text: 'The scheme asked for it to be rejected',
        hint: 'For example, the scheme found an error after submitting'
      },
      tooManyErrors: {
        text: 'Errors across too many records to query',
        hint: 'For example, a decimal point in the wrong place throughout a file'
      },
      other: { text: 'Other', hint: 'Explain in the details below' }
    },
    detailsLabel: 'Details',
    detailsHint: 'Required. {scheme} sees this in the service.',
    resubmitLabel: 'Resubmit by',
    resubmitHint: 'Set a date and time. For example, 12pm on 28 August 2026.',
    timeLabel: 'Time',
    timeHint: 'For example, 12pm',
    rejectAction: 'Reject return',
    cancelLink: 'Cancel',
    errorTitle: 'There is a problem',
    errors: {
      typeRequired: 'Select why you are rejecting the return',
      detailsRequired: 'Enter the details',
      detailsTooLong: 'Details must be 1000 characters or fewer',
      respondByRequired: 'Enter a date and time to resubmit by',
      respondByDate: 'Enter a real date, like 28 8 2026',
      respondByTime: 'Enter a time, like 12pm or 9:30am'
    }
  },

  submissionFiles: {
    title: 'Submission files and supporting evidence',
    backLink: 'Back to {scheme}',
    tag: { text: '{count} files', colour: 'blue' },
    subtitle: '{scheme} · {period} ({range})',
    intro:
      'Everything the scheme uploaded for this quarter: {dataFiles} data files and {evidence} supporting evidence document. Files are read only — if a figure is wrong, the record goes back to the scheme to correct.',
    summary: {
      records: 'Records',
      total: 'Total placed on market',
      checks: 'Automated checks',
      submittedBy: 'Submitted by',
      failed: 'Failed validation ({year})'
    },
    recordsValue: '{records} across {included} of {total} producers',
    totalValue: '{amount} tonnes',
    checksValue: 'Passed — {flags} figures flagged for review',
    failedValue: '{count} uploads rejected before submission',
    viewFlagged: 'View flagged figures',
    viewAll: 'View all',
    dataFilesHeading: 'Data files',
    columns: {
      file: 'File',
      members: 'Members',
      records: 'Records',
      total: 'Total (t)',
      uploaded: 'Uploaded',
      checks: 'Checks',
      action: 'Action'
    },
    checkStatus: {
      passed: { text: 'Passed', colour: 'green' },
      flags: { text: '{count} flags', colour: 'orange' }
    },
    open: 'Open',
    download: 'Download',
    evidenceHeading: 'Supporting evidence',
    evidenceColumns: {
      document: 'Document',
      covers: 'Covers',
      uploaded: 'Uploaded',
      action: 'Action'
    },
    openBeside: 'Open beside the data',
    inset:
      'Flags don’t stop a submission — they point to figures worth checking. Uploads that fail the scheme’s validation never reach this page; they’re listed under failed validation.',
    historyLink: 'View history for this quarter',
    reviewLink: 'Review this return'
  },

  submissionFile: {
    title: 'File',
    tag: { text: '{count} flags', colour: 'orange' },
    intro:
      'This file covers {members} member and {rows} rows. The scheme’s automated checks flagged {count} rows before submission. You can query or reject an individual record — you cannot edit what the scheme submitted.',
    summary: {
      member: 'Member',
      rows: 'Rows in file',
      uploaded: 'Uploaded',
      checkedBy: 'Checks run by',
      result: 'Result'
    },
    resultValue: 'Passed with {count} flags',
    flaggedHeading: 'Rows flagged by automated checks',
    columns: {
      row: 'Row',
      chemistry: 'Chemistry',
      category: 'Category',
      figure: 'Figure (t)',
      check: 'Check',
      action: 'Action'
    },
    query: 'Query',
    reject: 'Reject',
    viewAllRows: 'View all {count} rows in this file',
    download: 'Download this file (.csv)',
    backToFiles: 'Back to files',
    backLink: 'Back to submissions'
  }
}
