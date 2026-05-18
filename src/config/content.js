const heading = (text, caption, organisationName) => ({
  text,
  caption,
  organisationName
})

const getContentForLanguage = (request, data) => {
  const lang = request?.headers?.['x-language'] === 'cy' ? 'cy' : 'en'
  return data[lang]
}

export const content = {
  home: (request) =>
    getContentForLanguage(request, {
      en: {
        title: 'Home',
        heading: 'Register as a battery producer',
        intro:
          'Use this service to register as a UK battery producer, declare the batteries you place on the market, and submit annual compliance returns.',
        whoCanUse: 'Who can use this service',
        smallProducer:
          'Small producers — UK businesses placing fewer than 1 tonne of portable batteries on the market each year.',
        directRegistrant:
          'Direct registrants — UK businesses placing industrial or automotive batteries on the market, or more than 1 tonne of portable batteries.',
        publicRegisterCta: 'Search the public register',
        signInCta: 'Sign in to register'
      },
      cy: {
        title: 'Home',
        heading: 'Register as a battery producer',
        intro: 'TODO welsh'
      }
    }),
  about: (request) =>
    getContentForLanguage(request, {
      en: {
        title: 'About',
        heading: heading('About this prototype', null, null),
        body: 'This is a prototype Defra service. Data you enter is stored only in your browser and is not shared with anyone else.'
      },
      cy: {
        title: 'About',
        heading: heading('TODO welsh', null, null),
        body: 'TODO welsh'
      }
    }),
  cookies: (request) =>
    getContentForLanguage(request, {
      en: {
        title: 'Cookies',
        heading: 'Cookies on this service',
        introParagraph:
          'This is a prototype service. The only persistent storage we use is your browser local storage. We use one essential cookie to keep you signed in during your session.',
        essentialCookiesHeading: 'Essential cookies',
        essentialCookiesDescription:
          'We use one essential cookie. You cannot turn it off because the service will not work without it.',
        cookieTable: {
          firstCellIsHeader: true,
          head: [{ text: 'Name' }, { text: 'Purpose' }, { text: 'Expires' }],
          rows: [
            [
              { text: 'session' },
              { text: 'Stores transient form errors between requests' },
              { text: '4 hours' }
            ]
          ]
        }
      },
      cy: {
        title: 'Cookies',
        heading: 'TODO welsh',
        introParagraph: 'TODO welsh',
        essentialCookiesHeading: 'TODO welsh',
        essentialCookiesDescription: 'TODO welsh',
        cookieTable: { head: [], rows: [] }
      }
    }),
  terms: (request) =>
    getContentForLanguage(request, {
      en: {
        title: 'Terms',
        heading: 'Terms and conditions',
        leadParagraph:
          'These terms and conditions apply to your use of this prototype service.',
        conditions: [
          'This is a prototype. Do not enter sensitive personal data.',
          'Data is stored only in your browser and may be cleared at any time.',
          'You agree not to use this service for any unlawful purpose.'
        ],
        relatedContent: {
          heading: 'Related content',
          links: [
            { text: 'Privacy notice', href: '/privacy-notice' },
            { text: 'Cookies', href: '/cookies' }
          ]
        }
      },
      cy: {
        title: 'Terms',
        heading: 'TODO welsh',
        leadParagraph: 'TODO welsh',
        conditions: [],
        relatedContent: { heading: 'TODO welsh', links: [] }
      }
    }),
  privacyNotice: (request) =>
    getContentForLanguage(request, {
      en: {
        title: 'Privacy notice',
        heading: 'Privacy notice',
        introParagraph:
          'This is a prototype Defra service. We do not collect or process any personal data on a server. All data you enter is stored only in your browser.',
        sections: [
          {
            heading: 'Who collects your personal data',
            body: 'No personal data is collected by Defra through this prototype. The data you enter stays in your browser local storage.'
          },
          {
            heading: 'How long data is kept',
            body: 'Data persists in your browser until you clear your browser data, or you use the reset button on your account page.'
          }
        ]
      },
      cy: {
        title: 'Privacy notice',
        heading: 'TODO welsh',
        introParagraph: 'TODO welsh',
        sections: []
      }
    }),
  accessibility: (request) =>
    getContentForLanguage(request, {
      en: {
        title: 'Accessibility statement',
        heading: 'Accessibility statement',
        introParagraph:
          'This service is being designed to meet WCAG 2.2 AA. As a prototype, accessibility issues may exist; please report them via the feedback link.'
      },
      cy: {
        title: 'Accessibility statement',
        heading: 'TODO welsh',
        introParagraph: 'TODO welsh'
      }
    }),
  signIn: (request) =>
    getContentForLanguage(request, {
      en: {
        title: 'Sign in',
        heading: 'Sign in',
        intro:
          'Enter the email address you would like to register with. This prototype does not require a password.',
        emailLabel: 'Email address',
        continueAction: 'Continue',
        error: {
          title: 'There is a problem',
          message: 'Enter a valid email address'
        }
      },
      cy: {
        title: 'Sign in',
        heading: 'TODO welsh',
        intro: 'TODO welsh',
        emailLabel: 'TODO welsh',
        continueAction: 'TODO welsh',
        error: { title: 'TODO welsh', message: 'TODO welsh' }
      }
    }),
  signOut: (request) =>
    getContentForLanguage(request, {
      en: {
        title: 'Signing out',
        heading: 'You are being signed out',
        fallbackLink: 'Continue'
      },
      cy: {
        title: 'Signing out',
        heading: 'TODO welsh',
        fallbackLink: 'TODO welsh'
      }
    }),
  signedOut: (request) =>
    getContentForLanguage(request, {
      en: {
        title: 'Signed out',
        heading: 'You have been signed out',
        signInButton: 'Sign in'
      },
      cy: {
        title: 'Signed out',
        heading: 'TODO welsh',
        signInButton: 'TODO welsh'
      }
    }),
  publicRegisterSearch: (request) =>
    getContentForLanguage(request, {
      en: {
        title: 'Public register',
        heading: 'Search the public register of battery producers',
        intro:
          'Search for approved producers by company name, BPRN, or postcode.',
        searchLabel: 'Search',
        searchHint: 'Enter a company name, BPRN, or postcode',
        searchAction: 'Search'
      },
      cy: {
        title: 'Public register',
        heading: 'TODO welsh',
        intro: 'TODO welsh',
        searchLabel: 'TODO welsh',
        searchHint: 'TODO welsh',
        searchAction: 'TODO welsh'
      }
    }),
  publicRegisterDetail: (request) =>
    getContentForLanguage(request, {
      en: {
        title: 'Producer details',
        heading: 'Producer details'
      },
      cy: {
        title: 'Producer details',
        heading: 'TODO welsh'
      }
    }),
  devReset: (request) =>
    getContentForLanguage(request, {
      en: {
        title: 'Reset prototype data',
        heading: 'Reset prototype data',
        body: 'Clearing prototype data removes everything stored in your browser for this service and reloads the demo seed records.',
        confirmAction: 'Reset and reload'
      },
      cy: {
        title: 'Reset prototype data',
        heading: 'TODO welsh',
        body: 'TODO welsh',
        confirmAction: 'TODO welsh'
      }
    }),
  devTimeTravel: (request) =>
    getContentForLanguage(request, {
      en: {
        title: 'Time travel',
        heading: 'Time travel',
        body: 'Set the year the prototype should pretend it is. The dashboard, compliance period and any new records you create will be tagged with this year, and the activity log will date events accordingly. Existing records keep the period they were submitted under. Clear to return to real time.',
        yearLabel: 'Target year',
        yearHint: 'Enter a four-digit year (for example, 2027).',
        confirmAction: 'Travel'
      },
      cy: {
        title: 'TODO welsh',
        heading: 'TODO welsh',
        body: 'TODO welsh',
        yearLabel: 'TODO welsh',
        yearHint: 'TODO welsh',
        confirmAction: 'TODO welsh'
      }
    }),
  onboardingCompanyDetails: (request) =>
    getContentForLanguage(request, {
      en: {
        title: 'Company details',
        heading: 'Company details',
        intro:
          'Tell us about the business that places batteries on the UK market.',
        companyRegistrationNoLabel: 'Companies House number (8 digits)',
        companyRegistrationNoHint:
          'Look up your registered company at find-and-update.company-information.service.gov.uk.',
        lookupAction: 'Look up company',
        companyNameLabel: 'Registered company name',
        tradingNameLabel: 'Trading name (if different)',
        webAddressLabel: 'Website (optional)',
        sicCodeLabel: 'SIC code',
        registeredAddressHeading: 'Registered office address',
        line1Label: 'Address line 1',
        line2Label: 'Address line 2 (optional)',
        townLabel: 'Town or city',
        postcodeLabel: 'Postcode',
        continueAction: 'Continue',
        error: {
          title: 'There is a problem',
          companyName: 'Enter your registered company name',
          companyRegistrationNo: 'Enter your 8-digit Companies House number',
          line1: 'Enter the first line of the registered address',
          town: 'Enter the town or city',
          postcode: 'Enter a UK postcode'
        }
      },
      cy: {
        title: 'Company details',
        heading: 'TODO welsh',
        intro: 'TODO welsh',
        companyRegistrationNoLabel: 'TODO welsh',
        companyRegistrationNoHint: 'TODO welsh',
        lookupAction: 'TODO welsh',
        companyNameLabel: 'TODO welsh',
        tradingNameLabel: 'TODO welsh',
        webAddressLabel: 'TODO welsh',
        sicCodeLabel: 'TODO welsh',
        registeredAddressHeading: 'TODO welsh',
        line1Label: 'TODO welsh',
        line2Label: 'TODO welsh',
        townLabel: 'TODO welsh',
        postcodeLabel: 'TODO welsh',
        continueAction: 'TODO welsh',
        error: {
          title: 'TODO welsh',
          companyName: 'TODO welsh',
          companyRegistrationNo: 'TODO welsh',
          line1: 'TODO welsh',
          town: 'TODO welsh',
          postcode: 'TODO welsh'
        }
      }
    }),
  onboardingContactDetails: (request) =>
    getContentForLanguage(request, {
      en: {
        title: 'Contact details',
        heading: 'Primary contact details',
        intro: 'Provide a person we can contact about this registration.',
        firstNameLabel: 'First name',
        lastNameLabel: 'Last name',
        positionLabel: 'Position in the business',
        phoneLabel: 'Phone number',
        emailLabel: 'Email address',
        continueAction: 'Continue',
        error: {
          title: 'There is a problem',
          firstName: 'Enter the contact first name',
          lastName: 'Enter the contact last name',
          position: 'Enter the position in the business',
          phone: 'Enter a UK phone number',
          email: 'Enter a valid email address'
        }
      },
      cy: {
        title: 'Contact details',
        heading: 'TODO welsh',
        intro: 'TODO welsh',
        firstNameLabel: 'TODO welsh',
        lastNameLabel: 'TODO welsh',
        positionLabel: 'TODO welsh',
        phoneLabel: 'TODO welsh',
        emailLabel: 'TODO welsh',
        continueAction: 'TODO welsh',
        error: {
          title: 'TODO welsh',
          firstName: 'TODO welsh',
          lastName: 'TODO welsh',
          position: 'TODO welsh',
          phone: 'TODO welsh',
          email: 'TODO welsh'
        }
      }
    }),
  onboardingServiceOfNotice: (request) =>
    getContentForLanguage(request, {
      en: {
        title: 'Service of notice address',
        heading: 'Service of notice address',
        intro:
          'This is the address we will send formal notices to. It can be the same as your registered office.',
        sameAsRegistered: 'Same as registered office',
        differentAddress: 'A different address',
        line1Label: 'Address line 1',
        line2Label: 'Address line 2 (optional)',
        townLabel: 'Town or city',
        postcodeLabel: 'Postcode',
        continueAction: 'Continue',
        error: {
          title: 'There is a problem',
          choice: 'Choose whether to use a different address',
          line1: 'Enter the first line of the address',
          town: 'Enter the town or city',
          postcode: 'Enter a UK postcode'
        }
      },
      cy: {
        title: 'Service of notice address',
        heading: 'TODO welsh',
        intro: 'TODO welsh',
        sameAsRegistered: 'TODO welsh',
        differentAddress: 'TODO welsh',
        line1Label: 'TODO welsh',
        line2Label: 'TODO welsh',
        townLabel: 'TODO welsh',
        postcodeLabel: 'TODO welsh',
        continueAction: 'TODO welsh',
        error: {
          title: 'TODO welsh',
          choice: 'TODO welsh',
          line1: 'TODO welsh',
          town: 'TODO welsh',
          postcode: 'TODO welsh'
        }
      }
    }),
  onboardingBatteryTypes: (request) =>
    getContentForLanguage(request, {
      en: {
        title: 'Battery types',
        heading: 'What types of batteries do you place on the market?',
        intro: 'Select all that apply. You must choose at least one.',
        portableLabel: 'Portable batteries',
        portableHint:
          'For example, button cells, AA/AAA, mobile and laptop batteries, light means of transport.',
        industrialLabel: 'Industrial batteries',
        industrialHint:
          'Industrial use including UPS, traction, telecoms and energy storage.',
        automotiveLabel: 'Automotive batteries',
        automotiveHint: 'Lead-acid SLI batteries and EV propulsion batteries.',
        continueAction: 'Continue',
        error: {
          title: 'There is a problem',
          atLeastOne: 'Select at least one battery type'
        }
      },
      cy: {
        title: 'Battery types',
        heading: 'TODO welsh',
        intro: 'TODO welsh',
        portableLabel: 'TODO welsh',
        portableHint: 'TODO welsh',
        industrialLabel: 'TODO welsh',
        industrialHint: 'TODO welsh',
        automotiveLabel: 'TODO welsh',
        automotiveHint: 'TODO welsh',
        continueAction: 'TODO welsh',
        error: {
          title: 'TODO welsh',
          atLeastOne: 'TODO welsh'
        }
      }
    }),
  onboardingBrandNames: (request) =>
    getContentForLanguage(request, {
      en: {
        title: 'Brand names',
        heading: 'Brand names',
        intro: 'List the brand names of the batteries you place on the market.',
        textareaLabel: 'Brand names',
        textareaHint:
          'Enter one brand name per line. Blank lines and duplicates will be removed.',
        continueAction: 'Continue',
        error: {
          title: 'There is a problem',
          atLeastOne: 'Enter at least one brand name'
        }
      },
      cy: {
        title: 'Brand names',
        heading: 'TODO welsh',
        intro: 'TODO welsh',
        textareaLabel: 'TODO welsh',
        textareaHint: 'TODO welsh',
        continueAction: 'TODO welsh',
        error: {
          title: 'TODO welsh',
          atLeastOne: 'TODO welsh'
        }
      }
    }),
  onboardingProducerRoute: (request) =>
    getContentForLanguage(request, {
      en: {
        title: 'Producer route',
        heading: 'Choose your producer route',
        intro:
          'Small producers place fewer than 1 tonne of portable batteries on the market each year and can register directly. All other producers must register as a direct registrant.',
        smallProducerLabel: 'Small producer',
        smallProducerHint:
          'I place fewer than 1 tonne of portable batteries on the UK market each year.',
        directRegistrantLabel: 'Direct registrant',
        directRegistrantHint:
          'I place 1 tonne or more of portable batteries, or any industrial or automotive batteries.',
        continueAction: 'Continue',
        forcedHeading: 'You must register as a direct registrant',
        forcedBody:
          'Because you place industrial or automotive batteries on the market, the small producer route is not available to you.',
        error: {
          title: 'There is a problem',
          choice: 'Select your producer route'
        }
      },
      cy: {
        title: 'Producer route',
        heading: 'TODO welsh',
        intro: 'TODO welsh',
        smallProducerLabel: 'TODO welsh',
        smallProducerHint: 'TODO welsh',
        directRegistrantLabel: 'TODO welsh',
        directRegistrantHint: 'TODO welsh',
        continueAction: 'TODO welsh',
        forcedHeading: 'TODO welsh',
        forcedBody: 'TODO welsh',
        error: {
          title: 'TODO welsh',
          choice: 'TODO welsh'
        }
      }
    }),
  onboardingDeclaration: (request) =>
    getContentForLanguage(request, {
      en: {
        title: 'Declaration',
        heading: 'Declaration',
        intro:
          'Confirm the information you have provided is correct. We will allocate your BPRN and submit your registration for the compliance period.',
        firstNameLabel: 'First name',
        lastNameLabel: 'Last name',
        positionLabel: 'Position in the business',
        confirmLabel:
          'I confirm I am authorised to register this business and the details are correct.',
        continueAction: 'Submit registration',
        error: {
          title: 'There is a problem',
          firstName: 'Enter your first name',
          lastName: 'Enter your last name',
          position: 'Enter your position in the business',
          confirm: 'You must confirm before submitting'
        }
      },
      cy: {
        title: 'Declaration',
        heading: 'TODO welsh',
        intro: 'TODO welsh',
        firstNameLabel: 'TODO welsh',
        lastNameLabel: 'TODO welsh',
        positionLabel: 'TODO welsh',
        confirmLabel: 'TODO welsh',
        continueAction: 'TODO welsh',
        error: {
          title: 'TODO welsh',
          firstName: 'TODO welsh',
          lastName: 'TODO welsh',
          position: 'TODO welsh',
          confirm: 'TODO welsh'
        }
      }
    }),
  onboardingConfirmation: (request) =>
    getContentForLanguage(request, {
      en: {
        title: 'Registration submitted',
        heading: 'We have started your registration',
        intro:
          'Thanks for completing onboarding. Here is the BPRN we have allocated for the compliance period.',
        bprnLabel: 'Your BPRN',
        statusLabel: 'Status',
        periodLabel: 'Compliance period',
        emailNoticeHeading: 'What happens next',
        emailNoticeBody:
          'In a real service we would email you a confirmation. For this prototype we have simply recorded the submission in your browser.',
        continueAction: 'Continue to your dashboard'
      },
      cy: {
        title: 'Registration submitted',
        heading: 'TODO welsh',
        intro: 'TODO welsh',
        bprnLabel: 'TODO welsh',
        statusLabel: 'TODO welsh',
        periodLabel: 'TODO welsh',
        emailNoticeHeading: 'TODO welsh',
        emailNoticeBody: 'TODO welsh',
        continueAction: 'TODO welsh'
      }
    }),
  dashboard: (request) =>
    getContentForLanguage(request, {
      en: {
        title: 'Dashboard',
        heading: 'Your battery producer dashboard',
        loadingMessage: 'Loading your dashboard…',
        signOutLink: 'Sign out',
        accountLink: 'Manage your account',
        cards: {
          registration: {
            title: 'Registration',
            description:
              'Your producer registration for the compliance period.',
            statusStarted: 'In progress',
            statusSubmitted: 'Submitted',
            statusApproved: 'Approved',
            bprnLabel: 'BPRN:',
            bprnPending: 'Pending allocation',
            inProgressBody:
              'You have started your registration. Continue where you left off.',
            inProgressLink: 'Continue your registration',
            submittedBody:
              'Your registration is submitted. Pay the service charge to complete approval.',
            approvedBody:
              'Your registration is approved for the {compliancePeriod} compliance period.'
          },
          fee: {
            title: 'Service charge',
            description: 'Pay the annual service charge to complete approval.',
            statusNotApplicable: 'Not yet due',
            statusDue: 'Payment due',
            statusPaid: 'Paid',
            payNow: 'Pay now',
            paidBody:
              'Your service charge has been paid for the {compliancePeriod} compliance period.',
            notApplicableBody:
              'You will be asked to pay once you submit your registration.'
          },
          annualReturn: {
            title: 'Annual return',
            description: 'Submit your annual placed-on-market return.',
            statusNotStarted: 'Not started',
            statusInProgress: 'In progress',
            statusSubmitted: 'Submitted',
            deadlineLabel: 'Deadline:',
            deadlineValue: '31 December {compliancePeriod}',
            startLink: 'Start your annual return',
            blockedBody:
              'Submit and pay for your registration before you can file an annual return.'
          },
          activity: {
            title: 'Recent activity',
            description: 'A timeline of changes to your producer record.',
            empty: 'No activity yet.'
          }
        }
      },
      cy: {
        title: 'Dashboard',
        heading: 'TODO welsh',
        loadingMessage: 'TODO welsh',
        signOutLink: 'TODO welsh',
        accountLink: 'TODO welsh',
        cards: {
          registration: { title: 'TODO welsh' },
          fee: { title: 'TODO welsh' },
          annualReturn: { title: 'TODO welsh' },
          activity: { title: 'TODO welsh' }
        }
      }
    }),
  annualReturnSmallTonnages: (request) =>
    getContentForLanguage(request, {
      en: {
        title: 'Annual return — placed on market',
        heading:
          'How many tonnes of portable batteries did you place on the market?',
        intro:
          'Enter your placed-on-market tonnage for the compliance period. You can switch between simple and detailed entry at any time.',
        modeLegend: 'How would you like to enter your tonnages?',
        modeSimple: 'Simple — three chemistry totals',
        modeSimpleHint:
          'Use this if you only have totals by chemistry (lead-acid, nickel-cadmium, other).',
        modeDetailed: 'Detailed — chemistry × sub-category grid',
        modeDetailedHint:
          'Use this if you have figures broken down by sub-category (button cells, coin cells, general use, light means of transport, other).',
        chemistries: {
          leadAcid: 'Lead-acid',
          nickelCadmium: 'Nickel-cadmium',
          other: 'Other'
        },
        subCategories: {
          buttonCells: 'Button cells',
          coinCells: 'Coin cells',
          generalUse: 'General use',
          lightMeansOfTransport: 'Light means of transport',
          other: 'Other'
        },
        tonnesLabel: 'Tonnes',
        totalsHeading: 'Totals (placed on market)',
        grandTotalLabel: 'Total placed',
        continueAction: 'Continue',
        error: {
          title: 'There is a problem',
          mode: 'Choose how you want to enter tonnages',
          tonnes: 'Enter a positive number with up to 3 decimal places'
        }
      },
      cy: {
        title: 'Annual return — placed on market',
        heading: 'TODO welsh',
        intro: 'TODO welsh',
        modeLegend: 'TODO welsh',
        modeSimple: 'TODO welsh',
        modeSimpleHint: 'TODO welsh',
        modeDetailed: 'TODO welsh',
        modeDetailedHint: 'TODO welsh',
        chemistries: { leadAcid: 'TODO', nickelCadmium: 'TODO', other: 'TODO' },
        subCategories: {
          buttonCells: 'TODO',
          coinCells: 'TODO',
          generalUse: 'TODO',
          lightMeansOfTransport: 'TODO',
          other: 'TODO'
        },
        tonnesLabel: 'TODO welsh',
        totalsHeading: 'TODO welsh',
        grandTotalLabel: 'TODO welsh',
        continueAction: 'TODO welsh',
        error: { title: 'TODO welsh', mode: 'TODO welsh', tonnes: 'TODO welsh' }
      }
    }),
  annualReturnSmallDeclaration: (request) =>
    getContentForLanguage(request, {
      en: {
        title: 'Annual return — declaration',
        heading: 'Declaration',
        intro:
          'Confirm the figures you have entered are correct. Submitting will record your annual return for the compliance period.',
        firstNameLabel: 'First name',
        lastNameLabel: 'Last name',
        positionLabel: 'Position in the business',
        confirmLabel:
          'I confirm I am authorised to submit this annual return and the figures are correct.',
        continueAction: 'Submit annual return',
        error: {
          title: 'There is a problem',
          firstName: 'Enter your first name',
          lastName: 'Enter your last name',
          position: 'Enter your position in the business',
          confirm: 'You must confirm before submitting'
        }
      },
      cy: {
        title: 'Annual return — declaration',
        heading: 'TODO welsh',
        intro: 'TODO welsh',
        firstNameLabel: 'TODO welsh',
        lastNameLabel: 'TODO welsh',
        positionLabel: 'TODO welsh',
        confirmLabel: 'TODO welsh',
        continueAction: 'TODO welsh',
        error: {
          title: 'TODO welsh',
          firstName: 'TODO welsh',
          lastName: 'TODO welsh',
          position: 'TODO welsh',
          confirm: 'TODO welsh'
        }
      }
    }),
  annualReturnSmallConfirmation: (request) =>
    getContentForLanguage(request, {
      en: {
        title: 'Annual return submitted',
        heading: 'Your annual return has been submitted',
        intro:
          'Thanks for filing your annual return for this compliance period.',
        backToDashboardAction: 'Back to your dashboard'
      },
      cy: {
        title: 'Annual return submitted',
        heading: 'TODO welsh',
        intro: 'TODO welsh',
        backToDashboardAction: 'TODO welsh'
      }
    }),
  annualReturnIaCategories: (request) =>
    getContentForLanguage(request, {
      en: {
        title: 'Annual return — categories',
        heading: 'Industrial and automotive annual return',
        intro:
          'You will need to declare placed-on-market, taken-back, delivered, and exported tonnages for each battery category you place on the market.',
        coverageHeading:
          'You declared the following categories during onboarding',
        industrial: 'Industrial batteries',
        automotive: 'Automotive batteries',
        portable:
          'Portable batteries (covered separately under the small-producer flow)',
        startAction: 'Start your annual return',
        loadingMessage: 'Loading category coverage…',
        noCategoriesNotice:
          'No industrial or automotive categories are declared on your registration. Update your battery types from the account page.'
      },
      cy: {
        title: 'Annual return — categories',
        heading: 'TODO welsh',
        intro: 'TODO welsh',
        coverageHeading: 'TODO welsh',
        industrial: 'TODO welsh',
        automotive: 'TODO welsh',
        portable: 'TODO welsh',
        startAction: 'TODO welsh',
        loadingMessage: 'TODO welsh',
        noCategoriesNotice: 'TODO welsh'
      }
    }),
  annualReturnIaTonnages: (request) =>
    getContentForLanguage(request, {
      en: {
        title: 'Annual return — tonnages',
        heading: 'Enter tonnages by activity and chemistry',
        intro:
          'Enter your tonnages for each activity. The same three chemistries apply across all categories and activities.',
        categoryHeadings: {
          industrial: 'Industrial batteries',
          automotive: 'Automotive batteries'
        },
        activityHeadings: {
          placed: 'Placed on market',
          collected: 'Taken back / collected',
          delivered: 'Delivered to treatment',
          exported: 'Exported'
        },
        chemistries: {
          leadAcid: 'Lead-acid',
          nickelCadmium: 'Nickel-cadmium',
          other: 'Other'
        },
        tonnesLabel: 'Tonnes',
        totalsHeading: 'Totals',
        continueAction: 'Continue',
        error: {
          title: 'There is a problem',
          tonnes: 'Enter a positive number with up to 3 decimal places'
        }
      },
      cy: {
        title: 'Annual return — tonnages',
        heading: 'TODO welsh',
        intro: 'TODO welsh',
        categoryHeadings: { industrial: 'TODO', automotive: 'TODO' },
        activityHeadings: {
          placed: 'TODO',
          collected: 'TODO',
          delivered: 'TODO',
          exported: 'TODO'
        },
        chemistries: { leadAcid: 'TODO', nickelCadmium: 'TODO', other: 'TODO' },
        tonnesLabel: 'TODO welsh',
        totalsHeading: 'TODO welsh',
        continueAction: 'TODO welsh',
        error: { title: 'TODO welsh', tonnes: 'TODO welsh' }
      }
    }),
  annualReturnIaDeclaration: (request) =>
    getContentForLanguage(request, {
      en: {
        title: 'Annual return — declaration',
        heading: 'Declaration',
        intro:
          'Confirm the figures you have entered are correct. Submitting will record your annual return for the compliance period.',
        firstNameLabel: 'First name',
        lastNameLabel: 'Last name',
        positionLabel: 'Position in the business',
        confirmLabel:
          'I confirm I am authorised to submit this annual return and the figures are correct.',
        continueAction: 'Submit annual return',
        error: {
          title: 'There is a problem',
          firstName: 'Enter your first name',
          lastName: 'Enter your last name',
          position: 'Enter your position in the business',
          confirm: 'You must confirm before submitting'
        }
      },
      cy: {
        title: 'Annual return — declaration',
        heading: 'TODO welsh',
        intro: 'TODO welsh',
        firstNameLabel: 'TODO welsh',
        lastNameLabel: 'TODO welsh',
        positionLabel: 'TODO welsh',
        confirmLabel: 'TODO welsh',
        continueAction: 'TODO welsh',
        error: {
          title: 'TODO welsh',
          firstName: 'TODO welsh',
          lastName: 'TODO welsh',
          position: 'TODO welsh',
          confirm: 'TODO welsh'
        }
      }
    }),
  annualReturnIaConfirmation: (request) =>
    getContentForLanguage(request, {
      en: {
        title: 'Annual return submitted',
        heading: 'Your annual return has been submitted',
        intro:
          'Thanks for filing your industrial and automotive annual return for this compliance period.',
        backToDashboardAction: 'Back to your dashboard'
      },
      cy: {
        title: 'Annual return submitted',
        heading: 'TODO welsh',
        intro: 'TODO welsh',
        backToDashboardAction: 'TODO welsh'
      }
    }),
  account: (request) =>
    getContentForLanguage(request, {
      en: {
        title: 'Manage your account',
        heading: 'Manage your account',
        intro:
          'Review and update the details on your producer record. Changes are stored in your browser.',
        loadingMessage: 'Loading your account…',
        sections: {
          company: {
            title: 'Company details',
            companyName: 'Registered company name',
            tradingName: 'Trading name',
            companyRegistrationNo: 'Companies House number',
            webAddress: 'Website',
            sicCode: 'SIC code',
            registeredAddress: 'Registered office address',
            agencyCode: 'Regulator',
            editAction: 'Edit company details',
            empty: 'Not provided'
          },
          contact: {
            title: 'Primary contact',
            firstName: 'First name',
            lastName: 'Last name',
            position: 'Position',
            phone: 'Phone',
            email: 'Email',
            editAction: 'Edit contact details'
          },
          serviceOfNotice: {
            title: 'Service of notice address',
            sameAsRegistered: 'Same as registered office',
            editAction: 'Edit service of notice address'
          },
          batteryTypes: {
            title: 'Battery types',
            none: 'No battery types declared',
            portable: 'Portable',
            industrial: 'Industrial',
            automotive: 'Automotive',
            editAction: 'Edit battery types'
          },
          brandNames: {
            title: 'Brand names',
            empty: 'No brands recorded',
            editAction: 'Edit brand names'
          },
          submissions: {
            title: 'Past submissions',
            empty: 'You have not submitted an annual return yet.',
            registrationLabel: 'Registration',
            submissionLabel: 'Annual return',
            statusLabel: 'Status',
            periodLabel: 'Compliance period'
          },
          reset: {
            title: 'Prototype data',
            body: 'This is a prototype. Use the button below to clear all data stored in your browser and reload demo seed records.',
            confirmAction: 'Reset prototype data'
          }
        }
      },
      cy: {
        title: 'Manage your account',
        heading: 'TODO welsh',
        intro: 'TODO welsh',
        loadingMessage: 'TODO welsh',
        sections: {
          company: {
            title: 'TODO welsh',
            companyName: 'TODO welsh',
            tradingName: 'TODO welsh',
            companyRegistrationNo: 'TODO welsh',
            webAddress: 'TODO welsh',
            sicCode: 'TODO welsh',
            registeredAddress: 'TODO welsh',
            agencyCode: 'TODO welsh',
            editAction: 'TODO welsh',
            empty: 'TODO welsh'
          },
          contact: {
            title: 'TODO welsh',
            firstName: 'TODO welsh',
            lastName: 'TODO welsh',
            position: 'TODO welsh',
            phone: 'TODO welsh',
            email: 'TODO welsh',
            editAction: 'TODO welsh'
          },
          serviceOfNotice: {
            title: 'TODO welsh',
            sameAsRegistered: 'TODO welsh',
            editAction: 'TODO welsh'
          },
          batteryTypes: {
            title: 'TODO welsh',
            none: 'TODO welsh',
            portable: 'TODO welsh',
            industrial: 'TODO welsh',
            automotive: 'TODO welsh',
            editAction: 'TODO welsh'
          },
          brandNames: {
            title: 'TODO welsh',
            empty: 'TODO welsh',
            editAction: 'TODO welsh'
          },
          submissions: {
            title: 'TODO welsh',
            empty: 'TODO welsh',
            registrationLabel: 'TODO welsh',
            submissionLabel: 'TODO welsh',
            statusLabel: 'TODO welsh',
            periodLabel: 'TODO welsh'
          },
          reset: {
            title: 'TODO welsh',
            body: 'TODO welsh',
            confirmAction: 'TODO welsh'
          }
        }
      }
    }),
  serviceCharge: (request) =>
    getContentForLanguage(request, {
      en: {
        title: 'Service charge',
        heading: 'Pay your service charge',
        intro:
          'Pay the service charge to complete approval of your producer registration for the compliance period.',
        organisationLabel: 'Organisation',
        feeLabel: 'Service charge',
        complianceLabel: 'Compliance period',
        smallProducerNote:
          'Small producer fee: a single annual charge for portable-only producers under 1 tonne per year.',
        directRegistrantNote:
          'Direct registrant fee: an annual charge covering producers placing industrial, automotive, or larger volumes of portable batteries.',
        payAction: 'Pay now',
        cancelAction: 'Cancel and return to dashboard',
        processing: 'Connecting to GOV.UK Pay…',
        loadingMessage: 'Loading payment details…'
      },
      cy: {
        title: 'Service charge',
        heading: 'TODO welsh',
        intro: 'TODO welsh',
        organisationLabel: 'TODO welsh',
        feeLabel: 'TODO welsh',
        complianceLabel: 'TODO welsh',
        smallProducerNote: 'TODO welsh',
        directRegistrantNote: 'TODO welsh',
        payAction: 'TODO welsh',
        cancelAction: 'TODO welsh',
        processing: 'TODO welsh',
        loadingMessage: 'TODO welsh'
      }
    }),
  paymentDetails: (request) =>
    getContentForLanguage(request, {
      en: {
        title: 'Payment confirmed',
        heading: 'Service charge paid',
        intro:
          'Your service charge has been paid and your producer registration is now approved.',
        receiptHeading: 'Payment receipt',
        organisationLabel: 'Organisation',
        feeLabel: 'Amount paid',
        paymentIdLabel: 'Payment ID',
        complianceLabel: 'Compliance period',
        backToDashboardAction: 'Continue to your dashboard',
        loadingMessage: 'Loading payment receipt…'
      },
      cy: {
        title: 'Payment confirmed',
        heading: 'TODO welsh',
        intro: 'TODO welsh',
        receiptHeading: 'TODO welsh',
        organisationLabel: 'TODO welsh',
        feeLabel: 'TODO welsh',
        paymentIdLabel: 'TODO welsh',
        complianceLabel: 'TODO welsh',
        backToDashboardAction: 'TODO welsh',
        loadingMessage: 'TODO welsh'
      }
    }),
  error500: (request) =>
    getContentForLanguage(request, {
      en: {
        heading: 'Sorry, there is a problem with the service'
      },
      cy: {
        heading: 'TODO welsh'
      }
    })
}
