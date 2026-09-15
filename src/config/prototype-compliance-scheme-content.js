export const PROTOTYPE_COMPLIANCE_SCHEME_SERVICE_NAME =
  'Batteries: Compliance Scheme'

export const PROTOTYPE_COMPLIANCE_SCHEME_NAME = 'IronWave Compliance'

export const prototypeComplianceSchemeContent = {
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
    title: 'My scheme',
    heading: 'My scheme',
    obligationHeading: 'Indicative obligation 2026',
    obligationIntro:
      'Calculated from your accepted PoM data. Updates automatically as new evidence is accepted.',
    obligationTargetLabel: 'target obligation',
    obligationTargetValue: '148.2t',
    obligationAcceptedLabel: 'evidence accepted (65%)',
    obligationAcceptedValue: '96.4t',
    obligationOutstandingLabel: 'outstanding',
    obligationOutstandingValue: '51.8t',
    obligationEvidenceLink: 'View full evidence list',
    intro:
      'This page shows the registration details and current compliance status for your scheme. You must keep this information accurate and tell the Environment Agency promptly if anything changes.',
    summaryRows: [
      { key: 'Scheme name', value: 'IronWave Compliance' },
      { key: 'Scheme registration number', value: 'BCS-2024-00871' },
      {
        key: 'Compliance category',
        value: 'Portable batteries (large producer)'
      },
      {
        key: 'Registered office',
        value: '14 Foundry Court, Wakefield, WF1 2QJ'
      },
      { key: 'Compliance status', value: 'Registered — up to date' },
      {
        key: 'Current reporting period',
        value: 'Q3 2026 (1 Jul to 30 Sep 2026)'
      },
      { key: 'Number of members', value: '42 producers' }
    ],
    updateAction: 'Update scheme details',
    certificateLink: 'Download scheme registration certificate'
  },

  members: {
    title: 'Members',
    heading: 'Members',
    intro:
      'These are the producers registered as members of your compliance scheme. You must keep this list up to date and tell the Environment Agency of any changes within 28 days.',
    columns: {
      memberName: 'Member name',
      companyRegistrationNo: 'Company registration number',
      memberSince: 'Member since',
      status: 'Status'
    },
    statusLabels: {
      active: 'Active',
      pendingReview: 'Pending review'
    },
    addAction: 'Add a new member',
    downloadLink: 'Download member list (CSV)'
  },

  submissions: {
    title: 'Your quarterly submissions',
    heading: 'Your quarterly submissions',
    intro:
      'Report portable batteries placed on market and waste portable batteries collected, by member and chemistry, for IronWave Compliance.',
    memberDetailLink: 'View or upload a Member Detail Submission',
    membersReportLink: 'View your scheme members report',
    evidenceHeading: 'Evidence availability',
    evidenceStatusLabel: 'Your status',
    evidenceStatusValue: 'Not set',
    editStatusLink: 'Edit status',
    viewGeneralAvailabilityLink: 'View general availability',
    dataSubmissionHeading: 'Data submission',
    yearLabel: 'Year',
    yearValue: '2026',
    dataSubmissionIntro:
      'Submit your quarterly returns by the due date for each quarter. Your data should be as accurate as possible – you can update a return with more accurate data later if needed.',
    availableLabel: 'Available',
    dueLabel: 'Due',
    statusLabel: 'Status',
    statusLabels: {
      submitted: 'Submitted',
      open: 'Begin',
      notYetOpen: 'Not yet open'
    },
    submittedAction: 'View submission'
  },

  beforeYouStart: {
    complianceCaption: 'batteries compliance',
    optionalCheckHeading: 'Optional check',
    optionalCheckBody:
      "This does not need to be completed before you submit — it's a quick reference check only.",
    checkSchemeLink: 'Check your scheme and member details',
    beginAction: 'Begin submission'
  },

  reportingMethod: {
    title: 'How do you want to report your battery data?',
    heading: 'How do you want to report your battery data?',
    complianceCaption: 'batteries compliance: quarterly data',
    guidanceIntro: 'Find out',
    guidanceLink: 'how to report battery data',
    singleMemberLabel: 'A single scheme member',
    singleMemberHint:
      "You'll need to answer questions once for each chemistry category you handle",
    bulkUploadLabel: 'Multiple scheme members (bulk upload)',
    bulkUploadHint: 'This must be a CSV file',
    continueAction: 'Continue',
    error: {
      title: 'There is a problem',
      message: 'Select how you want to report your battery data'
    }
  },

  bulkUpload: {
    title: 'Upload battery data',
    heading: 'Upload battery data',
    complianceCaption: 'batteries compliance: quarterly data',
    templateIntro: 'The file you upload must',
    templateLink: 'use the correct CSV template',
    tonnesWarning:
      'All tonnage figures must be entered in tonnes (t), not kilograms.',
    wasteCollectionNote:
      'This template also includes a Waste collection data tab — battery collections from schools, hospitals and shops, and ABTO deliveries, in one submission.',
    apiNote:
      'Bulk CSV or XML accepted. High-volume schemes can register a machine-to-machine API token in Manage account to push data directly.',
    fileLabel: 'Choose battery data file',
    uploadAction: 'Upload',
    supportingHeading: 'Optional: add supporting information',
    supportingBody:
      'You do not need to complete this to submit. Attach a Word or Excel file to explain a nil return, a liquidation, or a sharp change in your data.',
    supportingFileLabel: 'Choose supporting file (Word or Excel)',
    error: {
      title: 'There is a problem',
      message: 'Select a battery data file to upload'
    }
  },

  uploading: {
    title: 'Uploading battery data',
    heading: 'Uploading battery data',
    complianceCaption: 'batteries compliance: quarterly data',
    checkingBodyTemplate:
      'Checking {filename} against the CSV template, and comparing figures against previous quarters.',
    body1: 'This will take a few seconds.',
    body2: 'Do not close the page and do not refresh it yourself.',
    continueLink: 'Continue'
  },

  errors: {
    title: 'Check your battery data',
    heading: 'Check your battery data',
    complianceCaption: 'batteries compliance: quarterly data',
    columns: {
      error: 'Error',
      row: 'Row',
      column: 'Column',
      howToFix: 'How to fix'
    },
    downloadAction: 'Download error file',
    fixHeading: 'Fix the errors and upload again',
    fixBody: 'The file you upload must use the same CSV template.',
    fileLabel: 'Select battery data file',
    uploadAction: 'Upload'
  },

  uploadSuccess: {
    title: 'Battery data uploaded successfully',
    heading: 'Battery data uploaded successfully',
    complianceCaption: 'batteries compliance: quarterly data',
    referenceTemplate: 'Submission reference: {reference}',
    rowsProcessedLabel: 'Rows processed',
    rowsProcessedValue: '127',
    acceptedLabel: 'Accepted',
    acceptedValue: '124',
    heldLabel: 'Held for review',
    heldValue: '3 (see Resolution Hub)',
    submittedLabel: 'Submitted',
    submittedValue: '5 Sep 2026, 14:32',
    nextHeading: 'What happens next',
    nextBody:
      "Your 124 accepted rows are already live for national reporting. The regulator typically reviews held rows within 10 working days — you'll be notified if any need your input.",
    downloadReceiptLink: 'Download receipt (PDF)',
    viewHistoryLink: 'View your submission history',
    evidenceNote:
      "Based on the data you've uploaded, you should provide additional evidence or notes for 2 chemistry categories.",
    continueAction: 'Continue'
  },

  membersList: {
    start: {
      title: 'Send your regulator your members list',
      heading: 'Send your regulator your members list',
      intro:
        'Use this service to tell your regulator which battery producers are registered as members of your compliance scheme.',
      insetText:
        "You must send an up-to-date members list within 28 days of any change to your scheme's membership.",
      beforeYouStartHeading: 'Before you start',
      checkIntro: 'You can send your list in 2 ways:',
      checkBullets: [
        'upload a CSV file containing all of your members',
        'add members one at a time using an online form'
      ],
      needIntro: "You'll need:",
      needBullets: [
        "your member producers' organisation names and Companies House numbers, if they're registered",
        'the compliance period this list applies to',
        'a CSV file of your members, if you plan to upload one'
      ],
      applyHeading: 'Send your list',
      startAction: 'Start now',
      helpHeading: 'Help sending your list',
      helpBody:
        'You can get help by contacting the Environment Agency (England)',
      helpPhone: 'Telephone: 03708 506 506',
      helpEmailLabel: 'Email:',
      helpEmail: 'batteries@environment-agency.gov.uk',
      relatedHeading: 'Related content',
      relatedLinks: [
        'Manage your compliance scheme account',
        'Add or remove a scheme member',
        'Delegate authority of the Appropriate Person'
      ],
      guidanceHeading: 'Help and guidance',
      guidanceLinks: [
        'Waste batteries: producer responsibility',
        'Regulations: batteries and accumulators',
        'Classifying portable and industrial batteries'
      ]
    },

    howToSend: {
      title: 'How do you want to send your members list?',
      heading: 'How do you want to send your members list?',
      onlineFormLabel: 'Add members using an online form',
      onlineFormHint:
        'Add one producer member at a time by completing an online form.',
      csvLabel: 'Upload a CSV file',
      csvHint:
        'Upload a CSV file containing your member details. The file can include one member or multiple members.',
      continueAction: 'Continue',
      error: {
        title: 'There is a problem',
        message: 'Select how you want to send your members list'
      }
    },

    uploadCsv: {
      title: 'Upload a CSV file',
      heading: 'Upload a CSV file',
      intro:
        'Upload a CSV file containing your battery producer scheme member details. The file can include one member or multiple members.',
      fileLabel: 'Upload a file',
      uploadAction: 'Continue',
      error: {
        title: 'There is a problem',
        message: 'Select a CSV file to upload'
      }
    },

    reviewUpload: {
      title: 'Review your member upload',
      heading: 'Review your member upload',
      intro:
        'We checked each row as your file uploaded. Fix any rows marked "Needs attention" below, then submit. You do not need to re-upload the whole file.',
      addOneMemberLink: 'Add one member',
      bulkUploadAction: 'Bulk upload',
      columns: {
        member: 'Member',
        status: 'Status',
        action: 'Action'
      },
      validStatus: 'Valid',
      needsAttentionStatus: 'Needs attention',
      fixLink: 'Fix',
      fixedAction: '–',
      submitAction: 'Submit'
    },

    fix: {
      title: 'Fix this member',
      heading: 'Fix this member',
      captionTemplate: 'Fixing: {companyName}',
      companyRegistrationNoLabel: 'Companies House number',
      companyRegistrationNoHint: 'For example, 01234567',
      saveAction: 'Save and continue',
      error: {
        title: 'There is a problem',
        message: "Enter this member's Companies House number"
      }
    },

    submitted: {
      title: 'Members list submitted',
      heading: 'Members list submitted',
      panelBody:
        'Your compliance scheme members list has been sent to the regulator.',
      filenameLabel: 'File sent:',
      nextHeading: 'What happens next',
      nextBody:
        'The regulator will review your members list. You do not need to do anything else unless they contact you.',
      backToPrototypeLink: 'Back to prototype journeys'
    },

    addMember: {
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
        notFound:
          'No matching company was found. Check the number and try again.',
        continueAction: 'Continue',
        error: {
          title: 'There is a problem',
          name: "Enter the member's registered name",
          number: "Enter the member's 8 character company number"
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
        postcodeHint: 'For example, AA3 1AB',
        findAddressAction: 'Find address',
        selectAddressLabel: 'Select an address',
        manualLink: 'Enter address manually',
        addressLine1Label: 'Address line 1',
        addressTownLabel: 'Town or city',
        continueAction: 'Continue',
        error: {
          title: 'There is a problem',
          fullName: "Enter the member's full name",
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
        postcodeHint: 'For example, AA3 1AB',
        findAddressAction: 'Find address',
        selectAddressLabel: 'Select an address',
        manualLink: 'Enter address manually',
        addressLine1Label: 'Address line 1',
        addressTownLabel: 'Town or city',
        continueAction: 'Continue',
        error: {
          title: 'There is a problem',
          fullName: "Enter the member's full name",
          postcode: 'Enter a postcode'
        }
      },

      ukBusinessPresence: {
        title: 'Do you have a UK business presence?',
        heading: 'Do you have a UK business presence?',
        yesLabel: 'Yes',
        noLabel: 'No',
        detailsSummary: 'What is a UK business presence?',
        detailsBody:
          'A UK business presence is a registered office, branch, warehouse or appointed UK representative located in the UK.',
        continueAction: 'Continue',
        error: {
          title: 'There is a problem',
          choice: 'Select yes if the member has a UK business presence'
        }
      },

      overseasDetails: {
        title: 'Enter your details',
        heading: 'Enter your details',
        overseasNameLabel: 'Overseas company name',
        overseasAddressLabel: 'Overseas company registered address',
        ukPresenceHeading: 'Address of UK presence',
        postcodeLabel: 'Postcode',
        postcodeHint: 'For example, AA3 1AB',
        findAddressAction: 'Find address',
        selectAddressLabel: 'Select an address',
        manualLink: 'Enter address manually',
        addressLine1Label: 'Address line 1',
        addressTownLabel: 'Town or city',
        continueAction: 'Continue',
        error: {
          title: 'There is a problem',
          overseasName: 'Enter the overseas company name',
          overseasAddress: 'Enter the overseas company registered address',
          postcode: 'Enter the postcode of the UK presence'
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
        contactLink: 'Contact NPWD support',
        changeAnswerLink:
          'Chosen the wrong option? Go back and change your answer'
      },

      legalNoticesAddress: {
        title: 'Where should we send legal notices?',
        heading: 'Where should we send legal notices?',
        postcodeLabel: 'Postcode',
        postcodeHint: 'For example, AA3 1AB',
        buildingLabel: 'Building number or name',
        buildingHint: 'For example, 15 or Prospect Cottage',
        continueAction: 'Continue',
        error: {
          title: 'There is a problem',
          postcode: 'Enter a postcode',
          building: 'Enter a building number or name'
        }
      },

      appropriatePerson: {
        title: 'Who is the appropriate person for the producer?',
        heading: 'Who is the appropriate person for the producer?',
        intro:
          'Enter the details of the person with legal responsibility for this producer.',
        detailsSummary: 'Who can act as an appropriate person',
        detailsIntro:
          'The appropriate person is legally responsible for information and declarations submitted under the Waste Batteries and Accumulators Regulations 2009.',
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
        fullNameLabel: 'Full name',
        emailLabel: 'Email address',
        continueAction: 'Continue',
        error: {
          title: 'There is a problem',
          fullName: "Enter the appropriate person's full name",
          email: "Enter the appropriate person's email address"
        }
      },

      batteryCategory: {
        title: 'What type of batteries does the producer place on the market?',
        heading:
          'What type of batteries does the producer place on the market?',
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
          atLeastOne:
            'Select the types of batteries the producer places on the market'
        }
      },

      tonnage: {
        title:
          'How many portable batteries will the producer place on the UK market each year?',
        heading:
          'How many portable batteries will the producer place on the UK market each year?',
        hint: '"Placed on the market" means making a battery available for distribution or use in the UK for the first time.',
        upTo1TonneLabel: '1 tonne or less',
        over1TonneLabel: 'More than 1 tonne',
        continueAction: 'Continue',
        error: {
          title: 'There is a problem',
          choice:
            'Select how many portable batteries the producer will place on the UK market each year'
        }
      },

      dateJoined: {
        title: 'When did the producer join your compliance scheme?',
        heading: 'When did the producer join your compliance scheme?',
        hint: 'You must tell us about membership within 28 days of a producer joining your scheme.',
        continueAction: 'Continue',
        error: {
          title: 'There is a problem',
          required: 'Enter the date the producer joined your scheme',
          invalid: 'Enter a real date',
          future: 'The date the producer joined must be today or in the past'
        }
      },

      checkAnswers: {
        title: 'Check your answers',
        heading: 'Check your answers',
        rows: {
          organisationType: 'Organisation type',
          organisationName: 'Organisation name',
          organisationAddress: 'Organisation address',
          legalNoticesAddress: 'Address for legal notices',
          appropriatePersonName: "Appropriate person's name",
          appropriatePersonEmail: "Appropriate person's email address",
          batteryTypes: 'Type of batteries placed on market',
          tonnage: 'Amount of batteries placed on the market each year',
          dateJoined: 'Date joined scheme'
        },
        changeAction: 'Change',
        continueAction: 'Continue',
        tonnageLabels: {
          upTo1Tonne: 'Less than 1 tonne (1000kg)',
          over1Tonne: 'More than 1 tonne'
        }
      }
    }
  }
}
