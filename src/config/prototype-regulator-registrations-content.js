// Content for the regulator "BCS registration — regulator sends
// pre-registration link" journey. `layout` feeds the shared regulator layout
// (layouts/regulator.njk) that every regulator screen in this styling uses.
export const PROTOTYPE_REGULATOR_SERVICE_NAME = 'pEPR: Regulator'

export const prototypeRegulatorRegistrationsContent = {
  layout: {
    logoAlt: 'Department for Environment Food & Rural Affairs',
    navigationLabel: 'Service navigation',
    navigation: {
      registrations: 'Registrations',
      pomSubmissions: 'PoM submissions',
      complianceSchemes: 'Compliance schemes',
      manageAccount: 'Manage account'
    },
    resetData: 'Reset data'
  },

  signIn: {
    title: 'Sign in',
    heading: 'Sign in'
  },

  home: {
    title: 'Dashboard',
    heading: 'Dashboard',
    intro: 'Environment Agency – batteries regulation',
    quickLinks: {
      label: 'Quick links',
      links: {
        registrations: 'Registrations',
        pomSubmissions: 'PoM submissions',
        complianceSchemes: 'Compliance schemes',
        manageAccount: 'Manage account'
      }
    },
    tasks: {
      heading: 'Tasks',
      cards: [
        {
          key: 'registrations',
          title: 'Registrations',
          tag: { text: '1 awaiting decision', colour: 'blue' },
          description:
            'Decide on compliance scheme applications for approval and member registrations.',
          link: 'View registrations'
        },
        {
          key: 'pom-submissions',
          title: 'PoM submissions',
          tag: { text: '3 awaiting review', colour: 'blue' },
          description:
            'Check quarterly placed on the market data from compliance schemes, then accept, query or reject each return.',
          link: 'View PoM submissions'
        },
        {
          key: 'scheme-waste-data',
          title: 'Compliance scheme waste data',
          tag: { text: '2 awaiting review', colour: 'blue' },
          description:
            'Review the waste each scheme reports collecting and delivering to treatment operators.',
          link: 'View scheme waste returns'
        },
        {
          key: 'abto-waste-submissions',
          title: 'ABTO waste submissions',
          tag: { text: '4 awaiting review', colour: 'blue' },
          description:
            'Assess quarterly waste returns from approved battery treatment operators and reconcile them against scheme data.',
          link: 'View ABTO waste returns'
        },
        {
          key: 'abto-evidence-notes',
          title: 'ABTO evidence notes',
          tag: { text: '1 cancellation request', colour: 'orange' },
          description:
            'Monitor batteries evidence notes (BENs) issued to schemes and decide on cancellation requests.',
          link: 'View evidence notes'
        }
      ]
    },
    moreLinks: {
      heading: 'Organisations, reports and reference data',
      groups: [
        {
          key: 'organisations',
          title: 'Organisations',
          links: [
            'Withdrawn schemes',
            'Treatment operators and exporters',
            'Direct registrants',
            'Large producers',
            'Orphaned producers'
          ]
        },
        {
          key: 'approvals-and-returns',
          title: 'Approvals and returns',
          links: [
            'Operator applications for approval',
            'Further applications',
            'Extensions of approval',
            'Member detail submissions',
            'Industrial and automotive annual returns',
            'Direct registrant annual returns'
          ]
        },
        {
          key: 'reports',
          title: 'Reports',
          links: ['Scheme members', 'Organisation counts', 'Other reports']
        },
        {
          key: 'evidence',
          title: 'Evidence',
          links: ['Evidence transfers', 'NPWD code requests']
        },
        {
          key: 'reference-data',
          title: 'Reference data',
          links: [
            'Battery chemistries and sub-categories',
            'Obligation calculation lockdown dates'
          ]
        },
        {
          key: 'public-registers',
          title: 'Public registers',
          links: ['Batteries public register']
        }
      ]
    }
  },
  registrations: {
    title: 'Registrations',
    heading: 'Registrations',
    quickLinks: {
      label: 'Quick links',
      links: {
        preRegistrationLink: 'Send a pre-registration link',
        schemeMembersReport: 'Scheme members report',
        organisationCountsReport: 'Organisation counts report',
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
    tasks: {
      heading: 'Tasks',
      cards: [
        {
          key: 'direct-registrants',
          label: 'Direct registrants',
          count: 5,
          link: 'Review registration submissions'
        },
        {
          key: 'applications-for-approval',
          label: 'Compliance schemes',
          count: 1,
          link: 'Review applications for approval'
        },
        {
          key: 'scheme-registrations',
          label: 'Compliance schemes',
          count: 1,
          link: 'Review scheme registrations'
        },
        {
          key: 'scheme-member-lists',
          label: 'Compliance schemes',
          count: 5,
          link: 'Review scheme member lists'
        }
      ]
    },
    cases: {
      heading: 'Registration cases',
      allTab: 'All',
      columns: {
        producer: 'Large producer',
        scheme: 'Scheme',
        type: 'Type',
        status: 'Status',
        dueDate: 'Due date',
        previousYears: 'Previous years',
        case: 'Case'
      },
      viewLink: 'View',
      statuses: {
        submitted: { label: 'Submitted', colour: 'green' },
        paymentIssue: { label: 'Payment issue', colour: 'orange' },
        notSubmitted: { label: 'Not submitted', colour: 'grey' },
        preReg: { label: 'Pre reg', colour: 'yellow' },
        registrations: { label: 'Registrations', colour: 'yellow' }
      }
    }
  },

  preRegistrationLink: {
    title: 'Pre-registration link',
    heading: 'Pre-registration link',
    intro:
      "Enter the name and email address of the person who enquired about registering a new batteries compliance scheme. We'll email them a link to start registration.",
    nameLabel: 'Full name',
    emailLabel: 'Email address',
    submitAction: 'Send link',
    errorTitle: 'There is a problem',
    errors: {
      nameRequired: 'Enter their full name',
      nameInvalid:
        'Full name must only include letters, spaces, hyphens, apostrophes and full stops',
      nameTooLong: 'Full name must be 100 characters or fewer',
      emailRequired: 'Enter their email address',
      emailInvalid:
        'Enter an email address in the correct format, like name@example.com'
    }
  },

  preRegistrationLinkSent: {
    title: 'Pre-registration link sent',
    heading: 'Pre-registration link',
    bannerTitle: 'Success',
    bannerHeading: 'Pre-registration link sent',
    bannerBody:
      'An email with a link to start registration has been sent. The link expires in 7 days.',
    summary: {
      status: 'Status',
      statusValue: 'Invited',
      contact: 'Contact',
      linkSent: 'Link sent'
    },
    resendLink: 'Resend the pre-registration link',
    backLink: 'Back to Registrations'
  },

  application: {
    title: 'Application for approval',
    headingPrefix: 'Application for approval — ',
    intro:
      '{schemeName} submitted its application on {submittedOn}. We have checked all 10 steps automatically. Check the results of each step and add a note if you need to, then make a decision.',
    breadcrumbSchemes: 'Compliance schemes',
    checks: {
      heading: 'Automated checks',
      progress: 'You have checked {checked} of {total} steps.',
      columns: {
        step: 'Step',
        result: 'Automated result',
        check: 'Your check',
        notes: 'Notes'
      },
      checked: 'Checked',
      notChecked: 'Not checked'
    },
    results: {
      passed: { label: 'Passed', colour: 'green' },
      manualCheck: { label: 'Manual check', colour: 'yellow' },
      toCheck: { label: '1 to check', colour: 'red' },
      checkNeeded: { label: 'Check needed', colour: 'red' },
      notApplicable: { label: 'Not applicable', colour: 'grey' }
    },
    decision: {
      heading: 'Make a decision',
      intro:
        'Approving this application sets up the scheme, creates the Super User account, issues an approval number and sends the conditions of approval. Rejecting it sends your reason to {schemeName}. Your checks and notes are saved with your decision.',
      reasonLabel: 'Reason for your decision',
      reasonHint:
        "Required if you're rejecting this application. {schemeName} will see this reason.",
      confirmLabel:
        'I confirm I have checked all {total} steps and am authorised to make this decision',
      reject: 'Reject application',
      approve: 'Approve application',
      reviewLink: 'Review the registration details',
      errorTitle: 'There is a problem',
      errors: {
        stepsUnchecked: 'Check all {total} steps before you make a decision',
        reasonRequired: 'Enter a reason for rejecting this application',
        reasonTooLong: 'Reason must be 1000 characters or fewer',
        confirmRequired:
          'Confirm you have checked the application and are authorised to make this decision'
      }
    }
  },

  review: {
    title: 'Review registration',
    statusTag: 'Registration submitted',
    intro:
      '{schemeName} submitted their registration on {submittedOn}. Review the details below, then approve or reject the registration.',
    organisationHeading: 'Organisation details',
    organisationRows: {
      operatorType: 'Operator type',
      name: 'Organisation name',
      companiesHouseNumber: 'Companies House number',
      address: 'Address',
      postcode: 'Postcode',
      telephone: 'Telephone number',
      email: 'Correspondence email'
    },
    signatoryHeading: 'Authorised signatory',
    signatoryRows: {
      name: 'Full name',
      position: 'Position',
      email: 'Email address'
    },
    superUserHeading: 'Super User',
    superUserRows: {
      name: 'Full name',
      jobTitle: 'Job title',
      telephone: 'Telephone number',
      email: 'Email address'
    },
    checksHeading: 'Checks',
    checks: [
      'Companies House check – organisation name and number match',
      'Authorised signatory details verified',
      'Super User details verified'
    ],
    passed: 'Passed',
    decisionHeading: 'Make a decision',
    decisionIntro:
      'Check the organisation, signatory and Super User details above, and confirm the automatic checks have passed before you decide.',
    reasonLabel: 'Reason for your decision',
    reasonHint:
      "Required if you're rejecting this registration. The applicant will see this reason.",
    confirmLabel:
      'I confirm I have reviewed this registration and am authorised to make this decision',
    reject: 'Reject registration',
    approve: 'Approve registration',
    errorTitle: 'There is a problem',
    errors: {
      reasonRequired: 'Enter a reason for rejecting this registration',
      reasonTooLong: 'Reason must be 1000 characters or fewer',
      confirmRequired:
        'Confirm you have reviewed this registration and are authorised to make this decision'
    }
  },

  accepted: {
    title: 'Registration accepted',
    bannerTitle: 'Success',
    bannerHeading: 'Registration accepted',
    bannerBody:
      '{schemeName} is now an approved batteries compliance scheme. The account and confirmation steps below have been actioned automatically.',
    actionsHeading: 'Actions completed automatically',
    done: 'Done',
    actions: {
      schemeSetUp: 'Scheme set up on the system — ',
      schemeRecordLink: 'view scheme record',
      superUser:
        'Super User account created and username emailed to {superUser}',
      signatory: 'Authorised signatory confirmation link sent to {signatory}',
      approvalNumber: 'Approval number auto-issued: {approvalNumber}',
      conditions:
        'Copy of conditions of approval generated and emailed to {signatory} and {superUser}'
    },
    summary: {
      status: 'Status',
      statusValue: 'Approved',
      decisionDate: 'Decision date',
      superUser: 'Super User',
      approvalNumber: 'Approval number'
    },
    conditionsButton: 'View conditions of approval'
  },

  conditions: {
    title: 'Conditions of approval',
    intro:
      '{schemeName} — approval number {approvalNumber}. These conditions apply for as long as the scheme is approved.',
    summary: {
      approvalNumber: 'Approval number',
      approvedFrom: 'Approved from',
      compliancePeriod: 'Compliance period',
      reviewDate: 'Review date'
    },
    conditionsHeading: 'Conditions',
    conditions: [
      'Submit quarterly Producer of Market (PoM) data on behalf of all members by the statutory deadlines',
      'Keep member details, including Companies House records, up to date on NPWD',
      'Notify the regulator of any change to your authorised signatory or Super User within 28 days'
    ],
    downloadAction: 'Download copy (PDF)'
  },

  rejected: {
    title: 'Registration rejected',
    bannerTitle: 'Important',
    bannerHeading: 'Registration rejected',
    bannerBody:
      '{schemeName} has been sent a message in their NPWD account with your reason. The notes are visible to their authorised signatory and Super User nominee, and they can update their registration and resubmit.',
    summary: {
      status: 'Status',
      statusValue: 'Rejected',
      decisionDate: 'Decision date',
      reason: 'Reason recorded'
    },
    backLink: 'Back to Compliance schemes'
  },

  schemeRecord: {
    title: 'Scheme record',
    organisationHeading: 'Organisation details',
    organisationRows: {
      approvalNumber: 'Approval number',
      name: 'Organisation name',
      companiesHouseNumber: 'Companies House number',
      email: 'Correspondence email'
    },
    officeHeading: 'Registered office',
    officeRows: {
      address: 'Address',
      town: 'Town/City',
      postcode: 'Postcode',
      telephone: 'Telephone number',
      approvedFrom: 'Approved from',
      compliancePeriod: 'Compliance period'
    },
    statusHeading: 'Approval status',
    statuses: {
      approved: { label: 'Approved', colour: 'green' },
      rejected: { label: 'Rejected', colour: 'red' },
      pending: { label: 'Awaiting decision', colour: 'grey' }
    },
    manageHeading: 'Manage this scheme',
    notes: {
      heading: 'Notes',
      body: 'There are no notes for this scheme yet.',
      link: 'Add a note'
    },
    files: {
      heading: 'Agency files',
      body: 'No files have been uploaded.',
      link: 'Upload a file'
    },
    users: {
      heading: 'Users',
      body: 'This compliance scheme has 0 users.',
      link: 'Add a user'
    },
    signatoryHeading: 'Authorised signatory',
    signatoryAction: 'View'
  },

  schemeDashboard: {
    title: 'Compliance scheme',
    statusTag: { text: 'Registered scheme', colour: 'blue' },
    summary: {
      npwdCode: 'NPWD code',
      approved: 'Approved',
      members: 'Members'
    },
    membersValue: '{registered} registered, {awaiting} awaiting decision',
    noTasks: 'You have no tasks to complete for this scheme.',
    todoHeading: 'To do',
    memberListTask: {
      title: 'Member list to review',
      tag: { text: 'Action needed', colour: 'orange' },
      description:
        '{schemeName} has submitted a member list of {count} producers. Check the list, then accept or reject it.',
      received: 'Received {receivedOn}',
      action: 'Review member list'
    },
    nextHeading: 'What would you like to do?',
    links: {
      applications: 'Applications for approval ({count})',
      members: 'Compliance scheme members ({count})',
      pomReturns: 'Quarterly PoM returns ({count})',
      history: 'Enquiry and correspondence history'
    }
  },

  memberListReview: {
    title: 'Member list',
    heading: 'Member list — {schemeName}',
    intro:
      '{schemeName} submitted its member list on {submittedOn}. Each member has already been checked against Companies House. Review the list, then accept or reject it.',
    columns: {
      member: 'Member',
      check: 'Companies House check',
      type: 'Type',
      status: 'Status'
    },
    check: { text: 'Match', colour: 'green' },
    status: { text: 'Ready to register', colour: 'blue' },
    decisionHeading: 'Make a decision',
    decisionIntro:
      'Accepting this list issues a registration number for each member. Rejecting it sends a notification to {schemeName} with your reason.',
    decisionLegend: 'Your decision',
    options: {
      accept: {
        text: 'Accept the member list',
        hint: 'Each member is registered and given a registration number.'
      },
      reject: {
        text: 'Reject the member list',
        hint: 'The list is returned to {schemeName} to amend and resubmit.'
      }
    },
    reasonLabel: 'Reason for your decision',
    reasonHint:
      "Required if you're rejecting this list. {schemeName} will see this reason.",
    confirmLabel:
      'I confirm I have reviewed this member list and am authorised to make this decision',
    continue: 'Continue',
    errorTitle: 'There is a problem',
    errors: {
      decisionRequired: 'Select whether to accept or reject the member list',
      reasonRequired: 'Enter a reason for rejecting this member list',
      reasonTooLong: 'Reason must be 1000 characters or fewer',
      confirmRequired:
        'Confirm you have reviewed this member list and are authorised to make this decision'
    }
  },

  memberListAccepted: {
    title: 'Member list accepted',
    heading: 'Member list — {schemeName}',
    intro: 'You accepted this member list on {decidedOn}.',
    panelTitle: 'Member list accepted',
    panelBody: '{count} members are now registered',
    automaticHeading: 'What happened automatically',
    actions: [
      'Registration numbers {first} to {last} issued to the {count} members'
    ],
    membersHeading: 'Registered members',
    columns: { member: 'Member', number: 'Registration number' },
    returnLink: 'Return to {schemeName}'
  },

  memberListRejected: {
    title: 'Member list rejected',
    heading: 'Member list rejected',
    intro: "You rejected {schemeName}'s member list on {decidedOn}.",
    automaticHeading: 'What happened automatically',
    actions: [
      '{schemeName} has been sent a notification with your reason',
      'The member list has been returned to {schemeName} to amend and resubmit'
    ],
    notDone: 'No registration numbers were issued',
    reasonHeading: 'Reason you gave',
    returnLink: 'Return to {schemeName}'
  },

  applicationStep: {
    stepHeading: 'Step {number}: {title}',
    intro:
      'We checked this step automatically when {schemeName} submitted its application on {submittedOn}.',
    detailsHeading: 'Submitted details',
    checksHeading: 'Automated checks',
    confirmHeading: 'Confirm this step',
    confirmIntro:
      'Check the automated results and complete any manual checks. Add a note if anything needs following up.',
    confirmLabel: 'I have checked the results of this step',
    notesHeading: 'Notes for this step',
    notesIntro:
      'Add a note to record what you checked or anything you need to follow up. Notes are saved to the application record and shared with other regulators. They are not sent to {schemeName}.',
    noNotes: 'There are no notes for this step yet.',
    noteLabel: 'Add a note',
    addNote: 'Add note',
    saveAndContinue: 'Save and continue',
    backToChecks: 'Back to all checks',
    errorTitle: 'There is a problem',
    errors: {
      noteRequired: 'Enter a note',
      noteTooLong: 'Note must be 500 characters or fewer'
    }
  }
}
