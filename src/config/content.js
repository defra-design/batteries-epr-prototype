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
        title: 'Battery EPR prototype',
        heading: 'Battery EPR prototype',
        intro:
          'A walkthrough of the new Battery Extended Producer Responsibility service journeys.',
        prototypeBanner:
          'This is a prototype. All data is stored in your browser. Choose a journey to begin.',
        journeys: {
          producer: {
            title: 'I am a producer',
            description:
              'Register as a battery producer, declare the batteries you place on the market, and submit annual returns.',
            bullets: [
              'Small producers — UK businesses placing fewer than 1 tonne of portable batteries on the market each year.',
              'Direct registrants — UK businesses placing industrial or automotive batteries, or more than 1 tonne of portable batteries.',
              'Compliance scheme members — UK businesses whose annual return is filed by an approved scheme.'
            ],
            primaryAction: 'Sign in to register',
            secondaryAction: 'Search the public register'
          },
          complianceScheme: {
            title: 'I am a compliance scheme',
            description:
              'Sign in as an approved battery compliance scheme to manage your members and submissions.',
            bullets: [
              'Accept producers who have nominated your scheme during registration.',
              'File quarterly market data and the annual Industrial & Automotive return.',
              'Issue evidence to members and track your obligation.'
            ],
            primaryAction: 'Sign in to your scheme'
          },
          comingSoon: {
            label: 'Coming soon',
            abto: {
              title: 'I am an approved battery treatment operator',
              description:
                'Issue evidence notes to compliance schemes and the public register. Not part of this prototype yet.'
            },
            regulator: {
              title: 'I am a regulator',
              description:
                'Approve compliance schemes, monitor producer registrations and trigger enforcement actions. Not part of this prototype yet.'
            }
          }
        }
      },
      cy: {
        title: 'TODO welsh',
        heading: 'TODO welsh',
        intro: 'TODO welsh',
        prototypeBanner: 'TODO welsh',
        journeys: {
          producer: {
            title: 'TODO welsh',
            description: 'TODO welsh',
            bullets: [],
            primaryAction: 'TODO welsh',
            secondaryAction: 'TODO welsh'
          },
          complianceScheme: {
            title: 'TODO welsh',
            description: 'TODO welsh',
            bullets: [],
            primaryAction: 'TODO welsh'
          },
          comingSoon: {
            label: 'TODO welsh',
            abto: { title: 'TODO welsh', description: 'TODO welsh' },
            regulator: { title: 'TODO welsh', description: 'TODO welsh' }
          }
        }
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
          'Small producers place fewer than 1 tonne of portable batteries on the market each year. Producers who place 1 tonne or more of portable batteries must register through a compliance scheme. Producers who place industrial or automotive batteries can register as a direct registrant or through a compliance scheme.',
        smallProducerLabel: 'Small producer',
        smallProducerHint:
          'I place fewer than 1 tonne of portable batteries on the UK market each year.',
        directRegistrantLabel: 'Direct registrant',
        directRegistrantHint:
          'I place industrial or automotive batteries on the market.',
        complianceSchemeLabel: 'Member of a battery compliance scheme',
        complianceSchemeHint:
          'A scheme files your annual return for you. You will need to know which approved scheme you belong to.',
        continueAction: 'Continue',
        forcedHeading: 'The small producer route is not available',
        forcedBody:
          'Because you place industrial or automotive batteries on the market, the small producer route is not available. You can register as a direct registrant or through a compliance scheme.',
        portableOnlyHeading: 'You cannot register as a direct registrant',
        portableOnlyBody:
          'Because you only place portable batteries on the market, you must either register as a small producer (fewer than 1 tonne) or through a compliance scheme.',
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
        complianceSchemeLabel: 'TODO welsh',
        complianceSchemeHint: 'TODO welsh',
        continueAction: 'TODO welsh',
        forcedHeading: 'TODO welsh',
        forcedBody: 'TODO welsh',
        portableOnlyHeading: 'TODO welsh',
        portableOnlyBody: 'TODO welsh',
        error: {
          title: 'TODO welsh',
          choice: 'TODO welsh'
        }
      }
    }),
  onboardingSchemeSelect: (request) =>
    getContentForLanguage(request, {
      en: {
        title: 'Choose your compliance scheme',
        heading: 'Choose your compliance scheme',
        intro:
          'Select the approved battery compliance scheme that will register and report on your behalf.',
        continueAction: 'Continue',
        cannotFindSummary: 'I cannot find my scheme',
        cannotFindBody:
          'Speak to the scheme that has agreed to act on your behalf. If you do not yet have a scheme, you cannot complete registration on this route.',
        noAgencyMatch:
          'There are no approved compliance schemes registered with your environment agency. Contact your scheme directly to confirm next steps.',
        error: {
          title: 'There is a problem',
          choice: 'Select your compliance scheme'
        }
      },
      cy: {
        title: 'TODO welsh',
        heading: 'TODO welsh',
        intro: 'TODO welsh',
        continueAction: 'TODO welsh',
        cannotFindSummary: 'TODO welsh',
        cannotFindBody: 'TODO welsh',
        noAgencyMatch: 'TODO welsh',
        error: {
          title: 'TODO welsh',
          choice: 'TODO welsh'
        }
      }
    }),
  onboardingSchemeConfirm: (request) =>
    getContentForLanguage(request, {
      en: {
        title: 'Confirm your compliance scheme',
        heading: 'Confirm your compliance scheme',
        intro:
          'Check the scheme details below. By confirming, you authorise this scheme to register and report on your behalf.',
        nameLabel: 'Scheme name',
        operatorLabel: 'Scheme operator',
        contactEmailLabel: 'Scheme contact email',
        webAddressLabel: 'Scheme website',
        continueAction: 'Confirm my scheme'
      },
      cy: {
        title: 'TODO welsh',
        heading: 'TODO welsh',
        intro: 'TODO welsh',
        nameLabel: 'TODO welsh',
        operatorLabel: 'TODO welsh',
        contactEmailLabel: 'TODO welsh',
        webAddressLabel: 'TODO welsh',
        continueAction: 'TODO welsh'
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
        },
        schemeOverrides: {
          intro:
            'Confirm the information you have provided is correct. By submitting, you authorise your chosen compliance scheme to act on your behalf for this compliance period. You accept joint and several liability for the obligations the scheme files under your name.',
          confirmLabel:
            'I confirm I am authorised to nominate this scheme to act on behalf of the business and that the details are correct.',
          continueAction: 'Submit and notify scheme'
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
        },
        schemeOverrides: {
          intro: 'TODO welsh',
          confirmLabel: 'TODO welsh',
          continueAction: 'TODO welsh'
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
              'Your registration is approved for the {compliancePeriod} compliance period.',
            statusPendingScheme: 'Awaiting scheme',
            bprnAwaitingScheme: 'Awaiting scheme roster',
            pendingSchemeBody:
              'Your compliance scheme will register you when it files its next member roster.'
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
          agencyMismatch: {
            title: 'Important',
            body: 'Your scheme is regulated by {schemeAgency} but your registered address is now in {producerAgency} — contact your scheme.'
          },
          schemeRoute: {
            title: 'Your compliance scheme',
            description:
              'A compliance scheme files your annual return on your behalf.',
            statusRepresented: 'Represented',
            bodyWithScheme:
              '{scheme} files your annual return on your behalf — there is nothing for you to submit this period.',
            bodyAwaitingScheme:
              'Your chosen scheme will confirm your registration when it files its next member roster.',
            viewSchemeLink: 'View scheme details',
            rosterLabel: 'Last roster update:',
            rosterValueAwaiting: 'Awaiting first roster',
            statusPending: 'Awaiting roster'
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
          agencyMismatch: { title: 'TODO welsh', body: 'TODO welsh' },
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
  annualReturnSchemeRepresented: (request) =>
    getContentForLanguage(request, {
      en: {
        title: 'Your scheme reports on your behalf',
        heading: 'Your scheme reports on your behalf',
        intro:
          'You are a member of a battery compliance scheme. The scheme files your annual return on your behalf — there is nothing for you to submit for this compliance period.',
        schemeNameLabel: 'Scheme',
        periodLabel: 'Compliance period',
        rosterLabel: 'Last roster update',
        rosterPending: 'Awaiting first roster',
        viewSchemeAction: 'View your scheme details',
        backToDashboardAction: 'Back to your dashboard'
      },
      cy: {
        title: 'TODO welsh',
        heading: 'TODO welsh',
        intro: 'TODO welsh',
        schemeNameLabel: 'TODO welsh',
        periodLabel: 'TODO welsh',
        rosterLabel: 'TODO welsh',
        rosterPending: 'TODO welsh',
        viewSchemeAction: 'TODO welsh',
        backToDashboardAction: 'TODO welsh'
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
  leaveSchemeReason: (request) =>
    getContentForLanguage(request, {
      en: {
        title: 'Why are you leaving your compliance scheme?',
        heading: 'Why are you leaving your compliance scheme?',
        intro:
          'Tell us why you are leaving so the scheme and your environment agency have a record of the change.',
        reasonLegend: 'Reason for leaving',
        reasons: {
          joinedAnotherScheme: 'I am joining a different compliance scheme',
          belowThreshold:
            'I am now below the threshold and want to register as a small producer',
          ceasedTrading: 'My business has ceased placing batteries on the market',
          other: 'Other'
        },
        otherReasonLabel: 'If other, please describe',
        otherReasonHint: 'Tell us briefly why you are leaving the scheme.',
        continueAction: 'Continue',
        cancelAction: 'Cancel and return to your account',
        error: {
          title: 'There is a problem',
          choice: 'Select a reason for leaving',
          otherRequired: 'Tell us why you are leaving the scheme'
        }
      },
      cy: {
        title: 'TODO welsh',
        heading: 'TODO welsh',
        intro: 'TODO welsh',
        reasonLegend: 'TODO welsh',
        reasons: {
          joinedAnotherScheme: 'TODO welsh',
          belowThreshold: 'TODO welsh',
          ceasedTrading: 'TODO welsh',
          other: 'TODO welsh'
        },
        otherReasonLabel: 'TODO welsh',
        otherReasonHint: 'TODO welsh',
        continueAction: 'TODO welsh',
        cancelAction: 'TODO welsh',
        error: {
          title: 'TODO welsh',
          choice: 'TODO welsh',
          otherRequired: 'TODO welsh'
        }
      }
    }),
  leaveSchemeDeclaration: (request) =>
    getContentForLanguage(request, {
      en: {
        title: 'Confirm you will register directly',
        heading: 'Confirm you will register directly',
        intro:
          'By leaving your compliance scheme you take back responsibility for filing your own annual return.',
        summaryReasonLabel: 'Your reason',
        responsibility1:
          'You will be issued a Battery Producer Registration Number (BPRN) directly.',
        responsibility2:
          'You must file your own annual return for the current compliance period.',
        responsibility3:
          'Your environment agency will be notified of the change.',
        confirmLegend: 'Declaration',
        confirmLabel:
          'I confirm I am authorised to leave the scheme on behalf of this business and that the details above are correct.',
        continueAction: 'Leave the scheme',
        backAction: 'Back',
        error: {
          title: 'There is a problem',
          confirm: 'You must confirm the declaration before continuing'
        }
      },
      cy: {
        title: 'TODO welsh',
        heading: 'TODO welsh',
        intro: 'TODO welsh',
        summaryReasonLabel: 'TODO welsh',
        responsibility1: 'TODO welsh',
        responsibility2: 'TODO welsh',
        responsibility3: 'TODO welsh',
        confirmLegend: 'TODO welsh',
        confirmLabel: 'TODO welsh',
        continueAction: 'TODO welsh',
        backAction: 'TODO welsh',
        error: {
          title: 'TODO welsh',
          confirm: 'TODO welsh'
        }
      }
    }),
  leaveSchemeConfirmation: (request) =>
    getContentForLanguage(request, {
      en: {
        title: 'You have left your compliance scheme',
        heading: 'You have left your compliance scheme',
        intro:
          'You are now a direct registrant. You are responsible for filing your own annual return for this compliance period.',
        bprnLabel: 'Your BPRN:',
        next1: 'Your scheme membership has been closed.',
        next2:
          'You can file an annual return from your dashboard whenever you are ready.',
        continueAction: 'Continue to your dashboard'
      },
      cy: {
        title: 'TODO welsh',
        heading: 'TODO welsh',
        intro: 'TODO welsh',
        bprnLabel: 'TODO welsh',
        next1: 'TODO welsh',
        next2: 'TODO welsh',
        continueAction: 'TODO welsh'
      }
    }),
  accountScheme: (request) =>
    getContentForLanguage(request, {
      en: {
        title: 'Your compliance scheme',
        heading: 'Your compliance scheme',
        intro:
          'This is the battery compliance scheme that files annual returns on your behalf.',
        loadingMessage: 'Loading your scheme details…',
        detailsHeading: 'Scheme details',
        nameLabel: 'Scheme name',
        operatorLabel: 'Scheme operator',
        approvalNumberLabel: 'Approval number',
        contactEmailLabel: 'Scheme contact email',
        webAddressLabel: 'Scheme website',
        editAction: 'Change scheme',
        leaveAction: 'Leave this scheme',
        timelineHeading: 'Membership history',
        timelineEmpty: 'No previous memberships recorded.',
        timelineJoined: 'Joined',
        timelineLeft: 'Left',
        timelineActive: 'current',
        timelineReason: 'Reason',
        notMemberBody:
          'You are not a member of a compliance scheme. Go back to your account to change your producer route.',
        backAction: 'Back to your account',
        notFoundName: 'Scheme record unavailable'
      },
      cy: {
        title: 'TODO welsh',
        heading: 'TODO welsh',
        intro: 'TODO welsh',
        loadingMessage: 'TODO welsh',
        detailsHeading: 'TODO welsh',
        nameLabel: 'TODO welsh',
        operatorLabel: 'TODO welsh',
        approvalNumberLabel: 'TODO welsh',
        contactEmailLabel: 'TODO welsh',
        webAddressLabel: 'TODO welsh',
        editAction: 'TODO welsh',
        leaveAction: 'TODO welsh',
        timelineHeading: 'TODO welsh',
        timelineEmpty: 'TODO welsh',
        timelineJoined: 'TODO welsh',
        timelineLeft: 'TODO welsh',
        timelineActive: 'TODO welsh',
        timelineReason: 'TODO welsh',
        notMemberBody: 'TODO welsh',
        backAction: 'TODO welsh',
        notFoundName: 'TODO welsh'
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
          scheme: {
            title: 'Compliance scheme',
            nameLabel: 'Scheme',
            viewAction: 'View scheme details',
            editAction: 'Change scheme'
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
          scheme: {
            title: 'TODO welsh',
            nameLabel: 'TODO welsh',
            viewAction: 'TODO welsh',
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
    }),
  complianceSchemeSignIn: (request) =>
    getContentForLanguage(request, {
      en: {
        title: 'Sign in to your compliance scheme',
        heading: 'Sign in to your compliance scheme',
        intro:
          'Choose which approved battery compliance scheme you are operating as. You can switch later.',
        legend: 'Compliance scheme',
        continueAction: 'Continue',
        cancelAction: 'Cancel and return to the prototype home',
        error: {
          title: 'There is a problem',
          choice: 'Select a compliance scheme to continue'
        }
      },
      cy: {
        title: 'TODO welsh',
        heading: 'TODO welsh',
        intro: 'TODO welsh',
        legend: 'TODO welsh',
        continueAction: 'TODO welsh',
        cancelAction: 'TODO welsh',
        error: {
          title: 'TODO welsh',
          choice: 'TODO welsh'
        }
      }
    }),
  complianceScheme: (request) =>
    getContentForLanguage(request, {
      en: {
        title: 'Compliance scheme',
        heading: heading('Compliance scheme', 'Compliance scheme', null),
        introParagraph:
          'Manage your battery compliance scheme: apply for approval, manage your members, submit quarterly and annual returns, and issue evidence.',
        switchSchemeAction: 'Switch scheme',
        navLabel: 'Compliance scheme',
        tiles: {
          approval: {
            heading: 'Application for approval',
            statusLabel: 'Status',
            statuses: {
              'not-started': 'Not started',
              'in-progress': 'In progress',
              submitted: 'Submitted',
              approved: 'Approved'
            },
            startAction: 'Start application',
            continueAction: 'Continue application',
            viewAction: 'View application'
          },
          members: {
            heading: 'Scheme members',
            countLabel: 'Active members',
            manageAction: 'Manage members'
          },
          evidence: {
            heading: 'Evidence and obligation',
            acceptedLabel: 'Accepted evidence (tonnes)',
            awaitingLabel: 'Awaiting acceptance (tonnes)',
            obligationLabel: 'Indicative obligation (tonnes)',
            deltaLabel: 'Outstanding (tonnes)',
            manageAction: 'Manage evidence',
            availabilityHeading: 'Evidence availability',
            availabilityOn: 'Available to members',
            availabilityOff: 'Not available to members',
            availabilityToggleAction: 'Change availability'
          },
          quarterly: {
            heading: 'Quarterly submissions',
            disabledHint: 'Available after your scheme is approved.',
            quarters: ['Q1', 'Q2', 'Q3', 'Q4'],
            startAction: 'Start',
            continueAction: 'Continue',
            viewAction: 'View',
            statuses: {
              'not-started': 'Not started',
              'in-progress': 'In progress',
              submitted: 'Submitted'
            }
          },
          ia: {
            heading: 'Industrial and automotive annual submission',
            disabledHint: 'Available after your scheme is approved.',
            startAction: 'Start',
            continueAction: 'Continue',
            viewAction: 'View'
          },
          obligationBreakdown: {
            heading: 'Obligation breakdown',
            viewAction: 'View obligation breakdown'
          }
        },
        debug: {
          fastForwardAction: 'Mark scheme as approved (debug)',
          fastForwardConfirmation: 'Scheme marked as approved.'
        },
        membersPages: {
          list: {
            title: 'Scheme members',
            heading: 'Scheme members',
            intro:
              'Producers who are currently members of your compliance scheme.',
            tableCaption: 'Active scheme members',
            columns: {
              bprn: 'BPRN',
              companyName: 'Company name',
              joinedOn: 'Joined',
              actions: 'Actions'
            },
            emptyMessage: 'No members have joined the scheme yet.',
            addAction: 'Add a member',
            removeAction: 'Remove',
            backToDashboardAction: 'Back to compliance scheme dashboard',
            historyHeading: 'Past members',
            historyEmpty: 'No past members.',
            leftOnLabel: 'Left',
            pendingHeading: 'Awaiting your acceptance',
            pendingEmpty: 'No producers are awaiting acceptance.',
            acceptAction: 'Accept',
            rejectAction: 'Reject',
            acceptConfirm: 'Accept this producer into the scheme?',
            rejectConfirm: 'Reject this producer’s request to join?'
          },
          add: {
            title: 'Add a scheme member',
            heading: 'Add a scheme member',
            intro:
              'Add a producer to your scheme by entering their BPRN and company name.',
            bprnLabel: 'Producer BPRN',
            bprnHint:
              'A producer BPRN is allocated by an environment agency, for example BPRN-EA-2026-000001.',
            companyNameLabel: 'Company name',
            continueAction: 'Add member',
            cancelAction: 'Cancel',
            error: {
              bprn: 'Enter a producer BPRN',
              bprnFormat: 'Enter a BPRN in the format BPRN-XX-YYYY-NNNNNN',
              companyName: 'Enter the company name'
            }
          },
          remove: {
            title: 'Remove a scheme member',
            heading: 'Are you sure you want to remove this member?',
            intro:
              'Removing a member records the leaving date and stops them counting towards your obligation. They remain visible in the past members list.',
            confirmAction: 'Yes, remove this member',
            cancelAction: 'Cancel',
            notFound:
              'This member could not be found. They may already have been removed.'
          }
        },
        evidencePages: {
          errorTitle: 'There is a problem',
          continueAction: 'Continue',
          confirmAction: 'Confirm and submit',
          list: {
            title: 'Evidence',
            heading: 'Evidence',
            intro:
              'Evidence you have issued, are receiving acceptance for, or have transferred.',
            issueAction: 'Issue evidence',
            availabilityAction: 'Change evidence availability',
            backToDashboardAction: 'Back to compliance scheme dashboard',
            columns: {
              recipient: 'Recipient',
              category: 'Category',
              tonnes: 'Tonnes',
              status: 'Status',
              transfer: 'Transfer',
              actions: 'Actions'
            },
            statuses: {
              'awaiting-acceptance': 'Awaiting acceptance',
              accepted: 'Accepted',
              'awaiting-authorisation': 'Awaiting authorisation',
              cancelled: 'Cancelled'
            },
            categories: {
              portable: 'Portable',
              industrial: 'Industrial',
              automotive: 'Automotive'
            },
            transferLabels: { XOUT: 'Transferred out', XIN: 'Transferred in' },
            viewAction: 'View',
            emptyMessage: 'No evidence issued for this compliance period yet.'
          },
          issue: {
            steps: {
              recipient: {
                title: 'Choose a recipient',
                heading: 'Choose a recipient member',
                intro: 'Pick which member this evidence is being issued to.',
                legend: 'Recipient',
                continueAction: 'Continue',
                error: { recipientBprn: 'Choose a recipient member' },
                noMembersMessage:
                  'You have no active members in this compliance period. Add a member first.'
              },
              tonnes: {
                title: 'Category and tonnes',
                heading: 'Category and tonnes',
                intro: 'Tell us the category and how much evidence is being issued.',
                categoryLegend: 'Category',
                tonnesLabel: 'Tonnes',
                tonnesHint: 'Enter a value up to three decimal places.',
                portable: 'Portable',
                industrial: 'Industrial',
                automotive: 'Automotive',
                continueAction: 'Continue',
                error: {
                  category: 'Choose a category',
                  tonnes: 'Enter the tonnes',
                  tonnesFormat: 'Enter tonnes as a number'
                }
              },
              declaration: {
                title: 'Issue evidence',
                heading: 'Declaration',
                intro:
                  'Confirm the details below and issue the evidence note. The recipient will need to accept it.',
                summaryHeading: 'Summary',
                recipientLabel: 'Recipient',
                categoryLabel: 'Category',
                tonnesLabel: 'Tonnes',
                declarationLabel:
                  'I confirm the information provided is correct and issue this evidence.',
                confirmAction: 'Issue evidence',
                error: {
                  declarationAccepted: 'Confirm the declaration to issue evidence'
                }
              },
              confirmation: {
                title: 'Evidence issued',
                heading: 'Evidence issued',
                intro: 'The evidence is awaiting acceptance by the recipient.',
                returnToListAction: 'Return to evidence'
              }
            }
          },
          detail: {
            title: 'Evidence',
            heading: 'Evidence details',
            recipientLabel: 'Recipient',
            categoryLabel: 'Category',
            tonnesLabel: 'Tonnes',
            statusLabel: 'Status',
            issuedOnLabel: 'Issued on',
            transferLabel: 'Transfer',
            acceptAction: 'Accept evidence',
            rejectAction: 'Reject evidence',
            transferAction: 'Transfer to another scheme',
            backAction: 'Back to evidence',
            notFoundMessage: 'This evidence could not be found.',
            noActionsMessage: 'No actions are available for evidence in this state.'
          },
          transfer: {
            title: 'Transfer evidence',
            heading: 'Transfer evidence to another scheme',
            intro:
              'Transfer this evidence to another compliance scheme. The recipient will need to authorise the transfer.',
            counterpartyLegend: 'Receiving scheme',
            confirmAction: 'Transfer evidence',
            cancelAction: 'Cancel',
            error: {
              counterpartySchemeId: 'Choose a receiving scheme',
              noCandidates: 'No other compliance schemes are available for transfer.'
            },
            notFoundMessage: 'This evidence could not be found.',
            ineligibleMessage:
              'This evidence cannot be transferred because of its current status.'
          },
          availability: {
            title: 'Evidence availability',
            heading: 'Change evidence availability',
            intro:
              'Set whether your members can be issued evidence by this scheme.',
            currentLabel: 'Current status',
            availableLabel: 'Available to members',
            unavailableLabel: 'Not available to members',
            confirmAction: 'Change availability',
            cancelAction: 'Cancel'
          }
        },
        obligationPage: {
          title: 'Obligation breakdown',
          heading: 'Obligation breakdown',
          intro:
            'How your scheme\'s obligation is calculated from quarterly market data, by category.',
          tableCaption: 'Obligation by battery category',
          totalsLabel: 'Total',
          backToDashboardAction: 'Back to compliance scheme dashboard',
          methodologyHeading: 'How this is calculated',
          methodology:
            'For each category, the obligation is the total tonnes placed on the UK market across all four quarters multiplied by the recycling target. Accepted evidence reduces the outstanding obligation. This is a prototype calculation — production maths will be more nuanced.',
          columns: {
            category: 'Category',
            placed: 'Placed on market (tonnes)',
            target: 'Recycling target',
            obligation: 'Obligation (tonnes)',
            accepted: 'Accepted evidence (tonnes)',
            outstanding: 'Outstanding (tonnes)'
          },
          categories: {
            portable: 'Portable',
            industrial: 'Industrial',
            automotive: 'Automotive'
          }
        },
        quarterlyPages: {
          errorTitle: 'There is a problem',
          continueAction: 'Continue',
          confirmAction: 'Confirm and submit',
          steps: {
            memberList: {
              title: 'Scheme members',
              heading: 'Enter tonnage data for each member',
              intro:
                'Select a member to enter their market and waste tonnage data for this quarter.',
              bprnColumn: 'BPRN',
              companyColumn: 'Company name',
              marketStatusColumn: 'Market data',
              wasteStatusColumn: 'Waste data',
              actionColumn: 'Action',
              enterAction: 'Enter data',
              editAction: 'Edit',
              enteredTag: 'Entered',
              notEnteredTag: 'Not entered',
              continueAction: 'Continue',
              emptyMessage: 'This scheme has no active members for the current compliance period.',
              totalsHeading: 'Totals'
            },
            marketData: {
              title: 'Batteries placed on the market',
              heading: 'Batteries placed on the market this quarter',
              intro:
                'Enter the tonnes of batteries this member placed on the UK market, by category.',
              portableLabel: 'Portable batteries (tonnes)',
              industrialLabel: 'Industrial batteries (tonnes)',
              automotiveLabel: 'Automotive batteries (tonnes)',
              hint: 'Enter a value in tonnes, up to three decimal places.',
              error: {
                portable: 'Enter portable tonnes',
                portableFormat: 'Enter portable tonnes as a number',
                industrial: 'Enter industrial tonnes',
                industrialFormat: 'Enter industrial tonnes as a number',
                automotive: 'Enter automotive tonnes',
                automotiveFormat: 'Enter automotive tonnes as a number'
              }
            },
            wasteData: {
              title: 'Waste batteries collected',
              heading: 'Waste batteries collected this quarter',
              intro:
                'Enter the tonnes of waste batteries this member collected.',
              portableLabel: 'Portable batteries (tonnes)',
              industrialLabel: 'Industrial batteries (tonnes)',
              automotiveLabel: 'Automotive batteries (tonnes)',
              hint: 'Enter a value in tonnes, up to three decimal places.',
              error: {
                portable: 'Enter portable tonnes',
                portableFormat: 'Enter portable tonnes as a number',
                industrial: 'Enter industrial tonnes',
                industrialFormat: 'Enter industrial tonnes as a number',
                automotive: 'Enter automotive tonnes',
                automotiveFormat: 'Enter automotive tonnes as a number'
              }
            },
            checkAnswers: {
              title: 'Check your answers',
              heading: 'Check your answers',
              intro:
                'Review the figures for this quarter before submitting.',
              marketHeading: 'Placed on the market',
              wasteHeading: 'Waste collected',
              portableLabel: 'Portable (tonnes)',
              industrialLabel: 'Industrial (tonnes)',
              automotiveLabel: 'Automotive (tonnes)',
              changeAction: 'Change',
              submitAction: 'Submit return'
            },
            declaration: {
              title: 'Declaration',
              heading: 'Declaration',
              intro:
                'Confirm the figures are correct and submit the quarterly return.',
              declarationLabel:
                'I confirm the information provided is correct and submit this quarterly return.',
              error: { declarationAccepted: 'Confirm the declaration to submit' }
            },
            confirmation: {
              title: 'Quarterly return submitted',
              heading: 'Quarterly return submitted',
              intro:
                'Your quarterly return has been recorded. You can review it from the dashboard.',
              returnToDashboardAction: 'Return to dashboard'
            }
          }
        },
        iaPages: {
          errorTitle: 'There is a problem',
          continueAction: 'Continue',
          confirmAction: 'Confirm and submit',
          steps: {
            memberList: {
              title: 'Scheme members',
              heading: 'Enter tonnage data for each member',
              intro:
                'Select a member to enter their industrial and automotive battery data for this compliance period.',
              bprnColumn: 'BPRN',
              companyColumn: 'Company name',
              statusColumn: 'Status',
              actionColumn: 'Action',
              enterAction: 'Enter data',
              editAction: 'Edit',
              enteredTag: 'Entered',
              notEnteredTag: 'Not entered',
              continueAction: 'Continue',
              emptyMessage: 'This scheme has no active members for the current compliance period.',
              totalsHeading: 'Totals'
            },
            placed: {
              title: 'Industrial and automotive batteries placed',
              heading: 'Batteries placed on the market this year',
              intro:
                'Enter the tonnes of industrial and automotive batteries this member placed on the UK market for this compliance period.',
              industrialLabel: 'Industrial batteries (tonnes)',
              automotiveLabel: 'Automotive batteries (tonnes)',
              hint: 'Enter a value in tonnes, up to three decimal places.',
              error: {
                industrial: 'Enter industrial tonnes',
                industrialFormat: 'Enter industrial tonnes as a number',
                automotive: 'Enter automotive tonnes',
                automotiveFormat: 'Enter automotive tonnes as a number'
              }
            },
            exported: {
              title: 'Batteries exported',
              heading: 'Industrial and automotive batteries exported this year',
              intro:
                'Enter the tonnes of industrial and automotive batteries this member exported.',
              industrialLabel: 'Industrial batteries (tonnes)',
              automotiveLabel: 'Automotive batteries (tonnes)',
              hint: 'Enter a value in tonnes, up to three decimal places.',
              error: {
                industrial: 'Enter industrial tonnes',
                industrialFormat: 'Enter industrial tonnes as a number',
                automotive: 'Enter automotive tonnes',
                automotiveFormat: 'Enter automotive tonnes as a number'
              }
            },
            takenBack: {
              title: 'Batteries taken back',
              heading: 'Industrial and automotive batteries taken back this year',
              intro:
                'Enter the tonnes of industrial and automotive batteries this member took back from the market.',
              industrialLabel: 'Industrial batteries (tonnes)',
              automotiveLabel: 'Automotive batteries (tonnes)',
              hint: 'Enter a value in tonnes, up to three decimal places.',
              error: {
                industrial: 'Enter industrial tonnes',
                industrialFormat: 'Enter industrial tonnes as a number',
                automotive: 'Enter automotive tonnes',
                automotiveFormat: 'Enter automotive tonnes as a number'
              }
            },
            delivered: {
              title: 'Batteries delivered for treatment',
              heading:
                'Industrial and automotive batteries delivered for treatment this year',
              intro:
                'Enter the tonnes of industrial and automotive batteries this member delivered to treatment operators.',
              industrialLabel: 'Industrial batteries (tonnes)',
              automotiveLabel: 'Automotive batteries (tonnes)',
              hint: 'Enter a value in tonnes, up to three decimal places.',
              error: {
                industrial: 'Enter industrial tonnes',
                industrialFormat: 'Enter industrial tonnes as a number',
                automotive: 'Enter automotive tonnes',
                automotiveFormat: 'Enter automotive tonnes as a number'
              }
            },
            checkAnswers: {
              title: 'Check your answers',
              heading: 'Check your answers',
              intro:
                'Review the figures for the industrial and automotive submission before submitting.',
              placedHeading: 'Placed on the market',
              exportedHeading: 'Exported',
              takenBackHeading: 'Taken back',
              deliveredHeading: 'Delivered for treatment',
              industrialLabel: 'Industrial (tonnes)',
              automotiveLabel: 'Automotive (tonnes)',
              changeAction: 'Change',
              submitAction: 'Submit return'
            },
            declaration: {
              title: 'Declaration',
              heading: 'Declaration',
              intro:
                'Confirm the figures are correct and submit the industrial and automotive return.',
              declarationLabel:
                'I confirm the information provided is correct and submit this return.',
              error: { declarationAccepted: 'Confirm the declaration to submit' }
            },
            confirmation: {
              title: 'Annual return submitted',
              heading: 'Industrial and automotive return submitted',
              intro:
                'Your industrial and automotive return has been recorded. You can review it from the dashboard.',
              returnToDashboardAction: 'Return to dashboard'
            }
          }
        },
        application: {
          errorTitle: 'There is a problem',
          continueAction: 'Continue',
          saveAndContinueAction: 'Save and continue',
          steps: {
            schemeDetails: {
              title: 'Scheme details',
              heading: 'Scheme details',
              intro: 'Tell us the legal name of the scheme and any trading names.',
              nameLabel: 'Scheme name',
              tradingNamesLabel: 'Trading names',
              tradingNamesHint: 'Enter each trading name on a new line.',
              error: { name: 'Enter the scheme name' }
            },
            registeredAddress: {
              title: 'Registered address',
              heading: 'Registered address',
              intro: 'The registered office address of the scheme.',
              line1Label: 'Address line 1',
              line2Label: 'Address line 2 (optional)',
              townLabel: 'Town or city',
              postcodeLabel: 'Postcode'
            },
            contactAddress: {
              title: 'Contact and service of notice address',
              heading: 'Contact and service of notice address',
              intro: 'Where the regulator should send formal notices.',
              line1Label: 'Address line 1',
              line2Label: 'Address line 2 (optional)',
              townLabel: 'Town or city',
              postcodeLabel: 'Postcode'
            },
            operationalPlan: {
              title: 'Operational plan',
              heading: 'Operational plan',
              intro:
                'Summarise how the scheme will operate, including collection and treatment routes.',
              operationalPlanLabel: 'Operational plan',
              operationalPlanHint:
                'A few sentences is fine for the prototype.',
              error: { operationalPlan: 'Enter the operational plan summary' }
            },
            partners: {
              title: 'Partner organisations',
              heading: 'Partner organisations',
              intro:
                'List the partner organisations involved in delivering the scheme.',
              partnersLabel: 'Partner organisations',
              partnersHint: 'Enter each organisation on a new line.'
            },
            offences: {
              title: 'Relevant offences',
              heading: 'Relevant offences',
              intro:
                'Tell us whether any directors or officers have unspent convictions for relevant environmental offences.',
              hasOffencesLabel: 'Are there any relevant offences to declare?',
              yesLabel: 'Yes',
              noLabel: 'No',
              offencesDetailLabel: 'Provide details',
              offencesDetailHint: 'Include dates, offence types and outcomes.',
              error: {
                hasOffences: 'Select yes or no',
                offencesDetail: 'Enter the offence details'
              }
            },
            additionalFiles: {
              title: 'Additional files',
              heading: 'Additional files',
              intro:
                'List the supporting documents you would attach in the live service.',
              additionalFilesLabel: 'Supporting files',
              additionalFilesHint:
                'Enter one filename per line (prototype only — no real upload).'
            },
            declaration: {
              title: 'Declaration',
              heading: 'Declaration',
              intro:
                'Confirm the information you have provided is correct and complete.',
              declarationLabel:
                'I confirm the information provided is correct and submit this application.',
              error: { declarationAccepted: 'Confirm the declaration to submit' }
            },
            confirmation: {
              title: 'Application submitted',
              heading: 'Application submitted',
              intro:
                'Your application has been recorded. The regulator will review it and notify you of the outcome.',
              returnToDashboardAction: 'Return to dashboard'
            }
          }
        }
      },
      cy: {
        title: 'Compliance scheme',
        heading: heading('TODO welsh', 'TODO welsh', null),
        introParagraph: 'TODO welsh',
        switchSchemeAction: 'TODO welsh',
        navLabel: 'TODO welsh',
        tiles: {
          approval: {
            heading: 'TODO welsh',
            statusLabel: 'TODO welsh',
            statuses: {
              'not-started': 'TODO welsh',
              'in-progress': 'TODO welsh',
              submitted: 'TODO welsh',
              approved: 'TODO welsh'
            },
            startAction: 'TODO welsh',
            continueAction: 'TODO welsh',
            viewAction: 'TODO welsh'
          },
          members: {
            heading: 'TODO welsh',
            countLabel: 'TODO welsh',
            manageAction: 'TODO welsh'
          },
          evidence: {
            heading: 'TODO welsh',
            acceptedLabel: 'TODO welsh',
            awaitingLabel: 'TODO welsh',
            obligationLabel: 'TODO welsh',
            deltaLabel: 'TODO welsh',
            manageAction: 'TODO welsh',
            availabilityHeading: 'TODO welsh',
            availabilityOn: 'TODO welsh',
            availabilityOff: 'TODO welsh',
            availabilityToggleAction: 'TODO welsh'
          },
          quarterly: {
            heading: 'TODO welsh',
            disabledHint: 'TODO welsh',
            quarters: ['Q1', 'Q2', 'Q3', 'Q4'],
            startAction: 'TODO welsh',
            continueAction: 'TODO welsh',
            viewAction: 'TODO welsh',
            statuses: {
              'not-started': 'TODO welsh',
              'in-progress': 'TODO welsh',
              submitted: 'TODO welsh'
            }
          },
          ia: {
            heading: 'TODO welsh',
            disabledHint: 'TODO welsh',
            startAction: 'TODO welsh',
            continueAction: 'TODO welsh',
            viewAction: 'TODO welsh'
          },
          obligationBreakdown: {
            heading: 'TODO welsh',
            viewAction: 'TODO welsh'
          }
        },
        debug: {
          fastForwardAction: 'TODO welsh',
          fastForwardConfirmation: 'TODO welsh'
        },
        membersPages: {
          list: {
            title: 'TODO welsh',
            heading: 'TODO welsh',
            intro: 'TODO welsh',
            tableCaption: 'TODO welsh',
            columns: {
              bprn: 'TODO welsh',
              companyName: 'TODO welsh',
              joinedOn: 'TODO welsh',
              actions: 'TODO welsh'
            },
            emptyMessage: 'TODO welsh',
            addAction: 'TODO welsh',
            removeAction: 'TODO welsh',
            backToDashboardAction: 'TODO welsh',
            historyHeading: 'TODO welsh',
            historyEmpty: 'TODO welsh',
            leftOnLabel: 'TODO welsh',
            pendingHeading: 'TODO welsh',
            pendingEmpty: 'TODO welsh',
            acceptAction: 'TODO welsh',
            rejectAction: 'TODO welsh',
            acceptConfirm: 'TODO welsh',
            rejectConfirm: 'TODO welsh'
          },
          add: {
            title: 'TODO welsh',
            heading: 'TODO welsh',
            intro: 'TODO welsh',
            bprnLabel: 'TODO welsh',
            bprnHint: 'TODO welsh',
            companyNameLabel: 'TODO welsh',
            continueAction: 'TODO welsh',
            cancelAction: 'TODO welsh',
            error: {
              bprn: 'TODO welsh',
              bprnFormat: 'TODO welsh',
              companyName: 'TODO welsh'
            }
          },
          remove: {
            title: 'TODO welsh',
            heading: 'TODO welsh',
            intro: 'TODO welsh',
            confirmAction: 'TODO welsh',
            cancelAction: 'TODO welsh',
            notFound: 'TODO welsh'
          }
        },
        evidencePages: {
          errorTitle: 'TODO welsh',
          continueAction: 'TODO welsh',
          confirmAction: 'TODO welsh',
          list: {
            title: 'TODO welsh',
            heading: 'TODO welsh',
            intro: 'TODO welsh',
            issueAction: 'TODO welsh',
            availabilityAction: 'TODO welsh',
            backToDashboardAction: 'TODO welsh',
            columns: {
              recipient: 'TODO welsh',
              category: 'TODO welsh',
              tonnes: 'TODO welsh',
              status: 'TODO welsh',
              transfer: 'TODO welsh',
              actions: 'TODO welsh'
            },
            statuses: {
              'awaiting-acceptance': 'TODO welsh',
              accepted: 'TODO welsh',
              'awaiting-authorisation': 'TODO welsh',
              cancelled: 'TODO welsh'
            },
            categories: {
              portable: 'TODO welsh',
              industrial: 'TODO welsh',
              automotive: 'TODO welsh'
            },
            transferLabels: { XOUT: 'TODO welsh', XIN: 'TODO welsh' },
            viewAction: 'TODO welsh',
            emptyMessage: 'TODO welsh'
          },
          issue: {
            steps: {
              recipient: {
                title: 'TODO welsh',
                heading: 'TODO welsh',
                intro: 'TODO welsh',
                legend: 'TODO welsh',
                continueAction: 'TODO welsh',
                error: { recipientBprn: 'TODO welsh' },
                noMembersMessage: 'TODO welsh'
              },
              tonnes: {
                title: 'TODO welsh',
                heading: 'TODO welsh',
                intro: 'TODO welsh',
                categoryLegend: 'TODO welsh',
                tonnesLabel: 'TODO welsh',
                tonnesHint: 'TODO welsh',
                portable: 'TODO welsh',
                industrial: 'TODO welsh',
                automotive: 'TODO welsh',
                continueAction: 'TODO welsh',
                error: {
                  category: 'TODO welsh',
                  tonnes: 'TODO welsh',
                  tonnesFormat: 'TODO welsh'
                }
              },
              declaration: {
                title: 'TODO welsh',
                heading: 'TODO welsh',
                intro: 'TODO welsh',
                summaryHeading: 'TODO welsh',
                recipientLabel: 'TODO welsh',
                categoryLabel: 'TODO welsh',
                tonnesLabel: 'TODO welsh',
                declarationLabel: 'TODO welsh',
                confirmAction: 'TODO welsh',
                error: { declarationAccepted: 'TODO welsh' }
              },
              confirmation: {
                title: 'TODO welsh',
                heading: 'TODO welsh',
                intro: 'TODO welsh',
                returnToListAction: 'TODO welsh'
              }
            }
          },
          detail: {
            title: 'TODO welsh',
            heading: 'TODO welsh',
            recipientLabel: 'TODO welsh',
            categoryLabel: 'TODO welsh',
            tonnesLabel: 'TODO welsh',
            statusLabel: 'TODO welsh',
            issuedOnLabel: 'TODO welsh',
            transferLabel: 'TODO welsh',
            acceptAction: 'TODO welsh',
            rejectAction: 'TODO welsh',
            transferAction: 'TODO welsh',
            backAction: 'TODO welsh',
            notFoundMessage: 'TODO welsh',
            noActionsMessage: 'TODO welsh'
          },
          transfer: {
            title: 'TODO welsh',
            heading: 'TODO welsh',
            intro: 'TODO welsh',
            counterpartyLegend: 'TODO welsh',
            confirmAction: 'TODO welsh',
            cancelAction: 'TODO welsh',
            error: {
              counterpartySchemeId: 'TODO welsh',
              noCandidates: 'TODO welsh'
            },
            notFoundMessage: 'TODO welsh',
            ineligibleMessage: 'TODO welsh'
          },
          availability: {
            title: 'TODO welsh',
            heading: 'TODO welsh',
            intro: 'TODO welsh',
            currentLabel: 'TODO welsh',
            availableLabel: 'TODO welsh',
            unavailableLabel: 'TODO welsh',
            confirmAction: 'TODO welsh',
            cancelAction: 'TODO welsh'
          }
        },
        obligationPage: {
          title: 'TODO welsh',
          heading: 'TODO welsh',
          intro: 'TODO welsh',
          tableCaption: 'TODO welsh',
          totalsLabel: 'TODO welsh',
          backToDashboardAction: 'TODO welsh',
          methodologyHeading: 'TODO welsh',
          methodology: 'TODO welsh',
          columns: {
            category: 'TODO welsh',
            placed: 'TODO welsh',
            target: 'TODO welsh',
            obligation: 'TODO welsh',
            accepted: 'TODO welsh',
            outstanding: 'TODO welsh'
          },
          categories: {
            portable: 'TODO welsh',
            industrial: 'TODO welsh',
            automotive: 'TODO welsh'
          }
        },
        quarterlyPages: {
          errorTitle: 'TODO welsh',
          continueAction: 'TODO welsh',
          confirmAction: 'TODO welsh',
          steps: {
            memberList: {
              title: 'TODO welsh',
              heading: 'TODO welsh',
              intro: 'TODO welsh',
              bprnColumn: 'TODO welsh',
              companyColumn: 'TODO welsh',
              marketStatusColumn: 'TODO welsh',
              wasteStatusColumn: 'TODO welsh',
              actionColumn: 'TODO welsh',
              enterAction: 'TODO welsh',
              editAction: 'TODO welsh',
              enteredTag: 'TODO welsh',
              notEnteredTag: 'TODO welsh',
              continueAction: 'TODO welsh',
              emptyMessage: 'TODO welsh',
              totalsHeading: 'TODO welsh'
            },
            marketData: {
              title: 'TODO welsh',
              heading: 'TODO welsh',
              intro: 'TODO welsh',
              portableLabel: 'TODO welsh',
              industrialLabel: 'TODO welsh',
              automotiveLabel: 'TODO welsh',
              hint: 'TODO welsh',
              error: {
                portable: 'TODO welsh',
                portableFormat: 'TODO welsh',
                industrial: 'TODO welsh',
                industrialFormat: 'TODO welsh',
                automotive: 'TODO welsh',
                automotiveFormat: 'TODO welsh'
              }
            },
            wasteData: {
              title: 'TODO welsh',
              heading: 'TODO welsh',
              intro: 'TODO welsh',
              portableLabel: 'TODO welsh',
              industrialLabel: 'TODO welsh',
              automotiveLabel: 'TODO welsh',
              hint: 'TODO welsh',
              error: {
                portable: 'TODO welsh',
                portableFormat: 'TODO welsh',
                industrial: 'TODO welsh',
                industrialFormat: 'TODO welsh',
                automotive: 'TODO welsh',
                automotiveFormat: 'TODO welsh'
              }
            },
            checkAnswers: {
              title: 'TODO welsh',
              heading: 'TODO welsh',
              intro: 'TODO welsh',
              marketHeading: 'TODO welsh',
              wasteHeading: 'TODO welsh',
              portableLabel: 'TODO welsh',
              industrialLabel: 'TODO welsh',
              automotiveLabel: 'TODO welsh',
              changeAction: 'TODO welsh',
              submitAction: 'TODO welsh'
            },
            declaration: {
              title: 'TODO welsh',
              heading: 'TODO welsh',
              intro: 'TODO welsh',
              declarationLabel: 'TODO welsh',
              error: { declarationAccepted: 'TODO welsh' }
            },
            confirmation: {
              title: 'TODO welsh',
              heading: 'TODO welsh',
              intro: 'TODO welsh',
              returnToDashboardAction: 'TODO welsh'
            }
          }
        },
        iaPages: {
          errorTitle: 'TODO welsh',
          continueAction: 'TODO welsh',
          confirmAction: 'TODO welsh',
          steps: {
            memberList: {
              title: 'TODO welsh',
              heading: 'TODO welsh',
              intro: 'TODO welsh',
              bprnColumn: 'TODO welsh',
              companyColumn: 'TODO welsh',
              statusColumn: 'TODO welsh',
              actionColumn: 'TODO welsh',
              enterAction: 'TODO welsh',
              editAction: 'TODO welsh',
              enteredTag: 'TODO welsh',
              notEnteredTag: 'TODO welsh',
              continueAction: 'TODO welsh',
              emptyMessage: 'TODO welsh',
              totalsHeading: 'TODO welsh'
            },
            placed: {
              title: 'TODO welsh',
              heading: 'TODO welsh',
              intro: 'TODO welsh',
              industrialLabel: 'TODO welsh',
              automotiveLabel: 'TODO welsh',
              hint: 'TODO welsh',
              error: {
                industrial: 'TODO welsh',
                industrialFormat: 'TODO welsh',
                automotive: 'TODO welsh',
                automotiveFormat: 'TODO welsh'
              }
            },
            exported: {
              title: 'TODO welsh',
              heading: 'TODO welsh',
              intro: 'TODO welsh',
              industrialLabel: 'TODO welsh',
              automotiveLabel: 'TODO welsh',
              hint: 'TODO welsh',
              error: {
                industrial: 'TODO welsh',
                industrialFormat: 'TODO welsh',
                automotive: 'TODO welsh',
                automotiveFormat: 'TODO welsh'
              }
            },
            takenBack: {
              title: 'TODO welsh',
              heading: 'TODO welsh',
              intro: 'TODO welsh',
              industrialLabel: 'TODO welsh',
              automotiveLabel: 'TODO welsh',
              hint: 'TODO welsh',
              error: {
                industrial: 'TODO welsh',
                industrialFormat: 'TODO welsh',
                automotive: 'TODO welsh',
                automotiveFormat: 'TODO welsh'
              }
            },
            delivered: {
              title: 'TODO welsh',
              heading: 'TODO welsh',
              intro: 'TODO welsh',
              industrialLabel: 'TODO welsh',
              automotiveLabel: 'TODO welsh',
              hint: 'TODO welsh',
              error: {
                industrial: 'TODO welsh',
                industrialFormat: 'TODO welsh',
                automotive: 'TODO welsh',
                automotiveFormat: 'TODO welsh'
              }
            },
            checkAnswers: {
              title: 'TODO welsh',
              heading: 'TODO welsh',
              intro: 'TODO welsh',
              placedHeading: 'TODO welsh',
              exportedHeading: 'TODO welsh',
              takenBackHeading: 'TODO welsh',
              deliveredHeading: 'TODO welsh',
              industrialLabel: 'TODO welsh',
              automotiveLabel: 'TODO welsh',
              changeAction: 'TODO welsh',
              submitAction: 'TODO welsh'
            },
            declaration: {
              title: 'TODO welsh',
              heading: 'TODO welsh',
              intro: 'TODO welsh',
              declarationLabel: 'TODO welsh',
              error: { declarationAccepted: 'TODO welsh' }
            },
            confirmation: {
              title: 'TODO welsh',
              heading: 'TODO welsh',
              intro: 'TODO welsh',
              returnToDashboardAction: 'TODO welsh'
            }
          }
        },
        application: {
          errorTitle: 'TODO welsh',
          continueAction: 'TODO welsh',
          saveAndContinueAction: 'TODO welsh',
          steps: {
            schemeDetails: {
              title: 'TODO welsh',
              heading: 'TODO welsh',
              intro: 'TODO welsh',
              nameLabel: 'TODO welsh',
              tradingNamesLabel: 'TODO welsh',
              tradingNamesHint: 'TODO welsh',
              error: { name: 'TODO welsh' }
            },
            registeredAddress: {
              title: 'TODO welsh',
              heading: 'TODO welsh',
              intro: 'TODO welsh',
              line1Label: 'TODO welsh',
              line2Label: 'TODO welsh',
              townLabel: 'TODO welsh',
              postcodeLabel: 'TODO welsh'
            },
            contactAddress: {
              title: 'TODO welsh',
              heading: 'TODO welsh',
              intro: 'TODO welsh',
              line1Label: 'TODO welsh',
              line2Label: 'TODO welsh',
              townLabel: 'TODO welsh',
              postcodeLabel: 'TODO welsh'
            },
            operationalPlan: {
              title: 'TODO welsh',
              heading: 'TODO welsh',
              intro: 'TODO welsh',
              operationalPlanLabel: 'TODO welsh',
              operationalPlanHint: 'TODO welsh',
              error: { operationalPlan: 'TODO welsh' }
            },
            partners: {
              title: 'TODO welsh',
              heading: 'TODO welsh',
              intro: 'TODO welsh',
              partnersLabel: 'TODO welsh',
              partnersHint: 'TODO welsh'
            },
            offences: {
              title: 'TODO welsh',
              heading: 'TODO welsh',
              intro: 'TODO welsh',
              hasOffencesLabel: 'TODO welsh',
              yesLabel: 'TODO welsh',
              noLabel: 'TODO welsh',
              offencesDetailLabel: 'TODO welsh',
              offencesDetailHint: 'TODO welsh',
              error: {
                hasOffences: 'TODO welsh',
                offencesDetail: 'TODO welsh'
              }
            },
            additionalFiles: {
              title: 'TODO welsh',
              heading: 'TODO welsh',
              intro: 'TODO welsh',
              additionalFilesLabel: 'TODO welsh',
              additionalFilesHint: 'TODO welsh'
            },
            declaration: {
              title: 'TODO welsh',
              heading: 'TODO welsh',
              intro: 'TODO welsh',
              declarationLabel: 'TODO welsh',
              error: { declarationAccepted: 'TODO welsh' }
            },
            confirmation: {
              title: 'TODO welsh',
              heading: 'TODO welsh',
              intro: 'TODO welsh',
              returnToDashboardAction: 'TODO welsh'
            }
          }
        }
      }
    })
}
