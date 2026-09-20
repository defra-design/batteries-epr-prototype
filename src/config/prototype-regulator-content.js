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
    title: 'Regulator dashboard',
    heading: 'Regulator dashboard',
    tabsLabel: 'Dashboard sections',
    registrationsTab: {
      id: 'registrations',
      text: 'Registrations',
      heading: 'Registration cases',
      intro: 'Registration applications from producers and compliance schemes.',
      allocateAction: 'Allocate case',
      complianceCheckAction: 'Run compliance check',
      columns: {
        name: 'Large producer',
        scheme: 'Scheme',
        type: 'Type',
        status: 'Status',
        dueDate: 'Due date',
        previousYears: 'Previous years'
      },
      statusLabels: {
        submitted: 'In progress',
        paymentIssue: 'Payment issue',
        notSubmitted: 'Not submitted'
      }
    },
    pomSubmissionsTab: {
      id: 'pom-submissions',
      text: 'PoM submissions',
      heading: 'PoM submissions',
      intro: 'Quarterly battery data returns across all compliance schemes.',
      yearLabel: 'Year',
      quarterLabel: 'Quarter',
      columns: {
        scheme: 'Scheme',
        members: 'Members',
        submitted: 'Submitted',
        status: 'Status',
        issuesFound: 'Issues found'
      },
      statusLabels: {
        received: 'Received',
        accepted: 'Accepted',
        queried: 'Queried',
        notYetSubmitted: 'Not yet submitted'
      },
      viewAction: 'View'
    }
  },

  schemeHome: {
    heading: 'Scheme home',
    detailsHeading: 'Scheme details',
    approvalNumberLabel: 'Approval number',
    approvedLabel: 'Approved',
    approvalExpiresLabel: 'Approval expires',
    membersLabel: 'Members',
    seeAllMembersLink: 'See all members',
    authorisedSignatoryLabel: 'Authorised signatory',
    superUserLabel: 'Super User',
    accountManagerLabel: 'Account manager (Agency)',
    quickLinks: {
      record: 'View scheme record',
      members: 'View members',
      submissions: 'View all submissions'
    },
    submissionHeadingPrefix: 'submission',
    statusLabels: {
      received: 'Received',
      accepted: 'Accepted',
      queried: 'Queried',
      rejected: 'Rejected',
      notYetSubmitted: 'Not yet submitted'
    },
    runDataChecksAction: 'Run data checks',
    viewFilesLink: 'View all submission files',
    viewTimelineLink: 'View activity timeline for this quarter'
  },

  schemeRecord: {
    title: 'Scheme record',
    heading: 'Scheme record',
    organisationHeading: 'Organisation',
    registeredNameLabel: 'Registered name',
    companyRegistrationNoLabel: 'Companies House number',
    registeredOfficeLabel: 'Registered office',
    tradingAddressLabel: 'Trading address',
    websiteLabel: 'Website',
    approvalHeading: 'Approval',
    approvalNumberLabel: 'Approval number',
    approvedLabel: 'Approved',
    approvalExpiresLabel: 'Approval expires',
    approvedByLabel: 'Approved by',
    peopleHeading: 'People',
    authorisedSignatoryLabel: 'Authorised signatory',
    superUserLabel: 'Super User',
    accountManagerLabel: 'Account manager (Agency)',
    relatedLinks: {
      members: 'View members',
      submissions: 'View all submissions',
      timeline: 'View activity timeline',
      notes: 'View notes and agency files',
      applications: 'View applications for approval'
    }
  },

  schemeMembers: {
    title: 'Members',
    heading: 'Members',
    columns: {
      member: 'Member',
      bprn: 'BPRN',
      producerSize: 'Producer size',
      joinedScheme: 'Joined scheme'
    },
    statusLabels: {
      queried: 'Queried',
      submitted: 'Submitted'
    },
    viewAction: 'View',
    downloadLink: 'Download member list (.csv)',
    recordLink: 'View scheme record'
  },

  schemeSubmissions: {
    title: 'All submissions',
    heading: 'All submissions',
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
    downloadLink: 'Download submission history (.csv)',
    timelineLink: 'View activity timeline'
  },

  runningDataChecks: {
    title: 'Running data checks',
    heading: 'Running data checks',
    body2: 'This will take a few seconds. Do not close the page.',
    continueLink: 'Continue'
  },

  dataCheckReport: {
    title: 'Data check report',
    heading: 'Data check report',
    findingsHeading: 'Automated findings',
    findingsCaption:
      'Detected automatically by the data checker – no manual review yet.',
    columns: {
      member: 'Member',
      issue: 'Issue',
      type: 'Type'
    },
    typeLabels: {
      swing: 'Swing',
      validation: 'Validation'
    },
    typeColours: {
      swing: 'orange',
      validation: 'red'
    },
    observationsHeading: 'Your observations',
    observationsIntro:
      'Add any notes based on your own review. These will be included if you send a query to the scheme.',
    observationsLabel: 'Your observations',
    continueAction: 'Continue to review flagged members'
  },

  batterySalesDataSubmission: {
    title: 'Battery sales data submission',
    tabsLabel: 'Review sections',
    memberFiguresTab: {
      id: 'member-figures',
      text: 'Member figures'
    },
    compareReturnsTab: {
      id: 'compare-returns',
      text: 'Compare returns'
    },
    indicativeObligationTab: {
      id: 'indicative-obligation',
      text: 'Indicative obligation'
    },
    panelHeading: 'Member figures',
    columns: {
      member: 'Member',
      chemistry: 'Chemistry',
      figure: 'Figure (t)',
      status: 'Status',
      reason: 'Reason',
      action: 'Action'
    },
    statusLabels: {
      queried: 'Queried',
      resubmitted: 'Resubmitted',
      ok: 'OK'
    },
    statusColours: {
      queried: 'orange',
      resubmitted: 'blue',
      ok: 'grey'
    },
    editQueryLink: 'Edit query',
    queryAction: 'Query',
    rejectAction: 'Reject',
    continueAction: 'Continue',
    compareReturns: {
      heading: 'Compare returns',
      intro:
        "The service compares this quarter's figures against previous quarters and flags any swing beyond the alert level you set below. It flags for review — it never auto-rejects a return.",
      alertLevelLabel: 'Swing alert level (%)',
      columns: {
        category: 'Category',
        thisQuarter: 'This quarter (t)',
        lastQuarter: 'Last quarter (t)',
        swing: 'Swing',
        sameQuarterLastYear: 'Same qtr last year (t)',
        action: ''
      },
      viewReasonLink: 'View reason',
      totalLabel: 'Total'
    },
    indicativeObligation: {
      heading: 'Indicative obligation',
      intro:
        "This is the same calculation IronWave Compliance sees as a live estimate throughout the year. The figures and the working are shown in full, so you don't need to redo the sums to trust the number.",
      summaryLabels: {
        placedOnMarket2024: '2024 placed on market',
        placedOnMarket2025: '2025 placed on market',
        placedOnMarket2026SoFar: '2026 placed on market so far',
        rollingAverage: '3-year rolling average',
        obligationRate: 'Obligation rate',
        indicativeObligation: 'Indicative obligation ({year})'
      },
      verifiedTag: 'Calculation verified'
    }
  },

  reviewPomReturn: {
    title: 'Review PoM return',
    statusLabels: {
      received: 'Received',
      accepted: 'Accepted',
      queried: 'Queried',
      rejected: 'Rejected',
      notYetSubmitted: 'Not yet submitted'
    },
    statusColours: {
      received: 'blue',
      accepted: 'green',
      queried: 'orange',
      rejected: 'red',
      notYetSubmitted: 'grey'
    },
    lockWarningColour: 'yellow',
    statusPathHeading: 'Submission status',
    statusSteps: {
      submitted: 'Submitted',
      checksPassed: 'Automated checks passed',
      underReview: 'Under regulator review',
      decision: 'Decision'
    },
    notDecidedYet: '—',
    summaryLabels: {
      totalPlaced: 'Total placed on market',
      membersIncluded: 'Members included',
      swingsFlagged: 'Swings flagged for review',
      submittedBy: 'Submitted by',
      yourReason: 'Your reason for this decision'
    },
    relatedLinks: [
      {
        text: 'View compare returns and swing flags',
        fragment: 'compare-returns'
      },
      { text: 'View target calculation', fragment: 'indicative-obligation' },
      { text: 'View battery sales data submission' },
      { text: 'Compare figures — 3-year view and anomaly flags' },
      { text: 'Review with supporting documents' },
      { text: 'Reconcile with waste and evidence' },
      { text: 'View amendment history' },
      { text: 'Query records by theme' }
    ],
    decisionHeading: 'Make a decision',
    decisionOptions: {
      accept: {
        label: 'Accept the return',
        hintTemplate:
          'Records the {period} return as complete. {scheme} sees the decision straight away.'
      },
      query: {
        label: 'Query one or more figures',
        hint: 'Only the records you query go back to the scheme. The rest of the quarter stands.'
      },
      reject: {
        label: 'Reject the whole return (systemic errors only)',
        hint: "Only for a corrupted, misaligned or out-of-sync file. You'll be asked to confirm and give the type of error. The scheme has 28 days to resubmit."
      }
    },
    reasonLabel: 'Reason for your decision',
    reasonHintTemplate:
      '{scheme} sees this reason in the service. It is recorded against the return — it is not sent by email.',
    continueAction: 'Save and continue',
    error: {
      title: 'There is a problem',
      decision: 'Select whether to accept, query or reject the return',
      reason: 'Enter a reason for your decision'
    }
  },

  reviewPomReturnAccepted: {
    title: 'Acceptance recorded',
    bannerHeading: 'Acceptance recorded',
    bannerBodyTemplate:
      'This decision is recorded in the service and is visible to {scheme} immediately — dated {decidedOn}.',
    introTemplate:
      '{scheme} submitted their {period} return on {submittedOn}. It was accepted on {decidedOn}.',
    lockWarningColour: 'yellow',
    summaryLabels: {
      totalPlaced: 'Total placed on market',
      membersIncluded: 'Members included',
      swingsFlagged: 'Swings flagged for review',
      submittedBy: 'Submitted by',
      yourReason: 'Your reason for this decision'
    }
  },

  reviewPomReturnQueried: {
    title: 'Records queried',
    bannerHeadingTemplate: '{count} records queried',
    bannerBodyTemplate:
      '{scheme} has been told in the service and can download the queried records now. The rest of the {period} return stands.',
    introTemplate:
      '{scheme} submitted their {period} return on {submittedOn}. You queried {count} member records on {decidedOn}. Nothing else in the return moves, and the next quarter is not blocked.',
    summaryLabels: {
      decision: 'Decision',
      decidedBy: 'Decided by',
      decidedOn: 'Decided on',
      schemeNotified: 'Scheme notified',
      respondBy: 'Respond by',
      restOfReturn: 'Rest of return',
      yourReason: 'Your reason for this decision'
    },
    decisionTemplate: 'Queried — {count} of {total} records',
    schemeNotifiedTemplate: 'In the service, {decidedOn} (no email)',
    respondByTemplate: '{respondBy} (28 days)',
    restOfReturnValue: 'Stands — no resubmission needed',
    recordsHeading: 'Records queried',
    columns: {
      member: 'Member',
      chemistry: 'Chemistry',
      figure: 'Figure (t)',
      reason: 'Your reason',
      status: 'Status'
    },
    statusLabel: 'Queried',
    statusColour: 'orange',
    figureStatusLabels: { queried: 'Queried', resubmitted: 'Resubmitted' },
    figureStatusColours: { queried: 'orange', resubmitted: 'blue' },
    whatSchemeSeesHeading: 'What {scheme} sees',
    whatSchemeSeesBody:
      'The scheme sees these records — and only these — in their own service, each with the reason you recorded. They can go back to the member for the right figure and fix it with a form. They do not re-upload the submission, and they cannot edit the file already held as evidence.'
  },

  reviewPomReturnRejectConfirm: {
    title: 'Reject the whole return?',
    headingTemplate: 'Reject the whole {period} return?',
    tagText: 'Systemic only',
    introTemplate:
      "Rejecting sends every record in {scheme}'s {period} return back — including the {recordsWithNoIssues} records with no issues. Use this only when the file itself can't be trusted. For wrong figures, query those records instead and the rest of the return stands.",
    warningTextTemplate:
      "This removes 100% of the scheme's data for {period} until they resubmit. It does not affect any other quarter.",
    errorTypeHeading: 'What type of systemic error is it?',
    errorTypeOptions: {
      corruptedFile: {
        label: 'Corrupted file',
        hint: "The file won't open or rows are unreadable"
      },
      templateMismatch: {
        label: 'Template mismatch',
        hint: 'Columns are missing, renamed or shifted from the BCS member template'
      },
      filesOutOfSync: {
        label: 'Files out of sync',
        hint: "Totals across the uploaded files don't agree with each other"
      },
      otherSystemic: {
        label: 'Other systemic problem',
        hint: 'Explain in the reason below'
      }
    },
    reasonLabel: 'Reason for blanket rejection',
    reasonHintTemplate:
      "Required. {scheme} sees this reason in the service, and it's kept in the audit record.",
    confirmCheckboxLabel:
      "I've checked this can't be handled by querying individual records",
    confirmCheckboxHint:
      'Querying keeps the valid data live for national compilation.',
    rejectAction: 'Reject',
    cancelLink: 'Cancel — query records instead',
    error: {
      title: 'There is a problem',
      errorType: 'Select the type of systemic error',
      reason: 'Enter a reason for the blanket rejection',
      confirmed:
        "Confirm you've checked this can't be handled by querying individual records"
    }
  },
  reviewPomReturnRejected: {
    title: 'Rejection recorded',
    bannerHeading: 'Rejection recorded',
    bannerBodyTemplate:
      'The whole {period} return has been sent back to {scheme} with your reason attached. The scheme has until {resubmitBy} to correct and resubmit.',
    introTemplate:
      'Rejecting a return does not block any other quarter. {nextPeriod} can still be submitted on time and will be decided on its own.',
    summaryLabels: {
      decision: 'Decision',
      reason: 'Reason',
      resubmitBy: 'Resubmit by',
      decidedBy: 'Decided by',
      decidedOn: 'Decided on'
    },
    decisionValue: 'Rejected',
    reasonTemplate: 'Systemic — {errorType}. {reason}',
    errorTypeLabels: {
      'corrupted-file': 'corrupted file',
      'template-mismatch': 'template mismatch',
      'files-out-of-sync': 'files out of sync',
      'other-systemic': 'other systemic problem'
    },
    resubmitByTemplate: '{resubmitBy} (28 days)',
    filesKeptNote:
      'The submitted files are kept as they were. When the scheme resubmits, both versions stay in the record so the change is auditable.',
    links: {
      files: 'View submission files ({count})',
      timeline: 'View activity timeline for this quarter',
      dashboard: 'Back to PoM submissions'
    }
  }
}
