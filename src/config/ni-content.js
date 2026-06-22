export const niContent = {
  signIn: {
    title: 'Sign in — Northern Ireland producer',
    heading: 'Sign in to register as a Northern Ireland battery producer',
    intro:
      'Northern Ireland producers comply with the EU Batteries Regulation (EU) 2023/1542. Enter the email address you would like to register with. This prototype does not require a password.',
    emailLabel: 'Email address',
    continueAction: 'Continue',
    error: {
      message: 'Enter a valid email address'
    }
  },
  dashboard: {
    title: 'Dashboard — Northern Ireland producer',
    heading: 'Your Northern Ireland battery producer dashboard',
    intro:
      'As a Northern Ireland producer you must comply with the EU Batteries Regulation (EU) 2023/1542, which applies under the Windsor Framework. Turn on EUBR mode, then hover or focus an area to see the obligation it covers.',
    cards: [
      {
        eubrKey: 'registration',
        column: 'one-half',
        title: 'Registration',
        description: 'Register before placing batteries on the market.',
        status: { text: 'Not started', classes: 'govuk-tag--grey' },
        body: 'Register with your producer responsibility scheme so you can lawfully place batteries on the Northern Ireland market.'
      },
      {
        eubrKey: 'carbonFootprint',
        column: 'one-half',
        title: 'Carbon footprint declaration',
        description: 'Declare the carbon footprint of applicable batteries.',
        status: { text: 'Not started', classes: 'govuk-tag--grey' },
        body: 'Electric-vehicle, LMT and rechargeable industrial batteries must carry a carbon footprint declaration and performance class.'
      },
      {
        eubrKey: 'batteryPassport',
        column: 'one-half',
        title: 'Battery passport and labelling',
        description: 'Provide labelling, a QR data carrier and a battery passport.',
        status: { text: 'Not started', classes: 'govuk-tag--grey' },
        body: 'Apply the separate-collection symbol, capacity marking and QR code, and create a battery passport where required.'
      },
      {
        eubrKey: 'dueDiligence',
        column: 'one-half',
        title: 'Due diligence',
        description: 'Operate a supply-chain due diligence policy.',
        status: { text: 'Not started', classes: 'govuk-tag--grey' },
        body: 'Economic operators above the turnover threshold must run and verify a raw-materials due diligence policy.'
      },
      {
        eubrKey: 'reporting',
        column: 'full',
        title: 'Annual return',
        description: 'Report batteries placed on the market and collected.',
        status: { text: 'Not started', classes: 'govuk-tag--grey' },
        body: 'Report your placed-on-market, collection and recycling data to the competent authority each year.'
      }
    ]
  },
  onboarding: {
    companyDetails: {
      title: 'Company details',
      heading: 'Company details',
      intro:
        'Tell us about the business that places batteries on the Northern Ireland market.',
      companyNameLabel: 'Registered company name',
      companyRegistrationNoLabel: 'Companies House number',
      line1Label: 'Address line 1',
      townLabel: 'Town or city',
      postcodeLabel: 'Postcode',
      continueAction: 'Continue',
      error: {
        title: 'There is a problem',
        companyName: 'Enter your registered company name',
        companyRegistrationNo: 'Enter your Companies House number',
        line1: 'Enter the first line of the address',
        town: 'Enter the town or city',
        postcode: 'Enter a postcode'
      }
    },
    contactDetails: {
      title: 'Contact details',
      heading: 'Primary contact details',
      intro: 'Provide a person we can contact about this registration.',
      firstNameLabel: 'First name',
      lastNameLabel: 'Last name',
      positionLabel: 'Position in the business',
      emailLabel: 'Email address',
      phoneLabel: 'Phone number',
      continueAction: 'Continue',
      error: {
        title: 'There is a problem',
        firstName: 'Enter the contact first name',
        lastName: 'Enter the contact last name',
        position: 'Enter the position in the business',
        email: 'Enter a valid email address',
        phone: 'Enter a phone number'
      }
    },
    batteryCategories: {
      title: 'Battery categories',
      heading: 'What categories of batteries do you place on the market?',
      intro:
        'The EU Batteries Regulation classifies batteries into categories with different obligations. Select all that apply.',
      portableLabel: 'Portable batteries',
      portableHint: 'For example button cells, AA/AAA, mobile and laptop batteries.',
      lmtLabel: 'Light means of transport (LMT) batteries',
      lmtHint: 'Batteries for e-bikes, e-scooters and similar vehicles.',
      industrialLabel: 'Industrial batteries',
      industrialHint: 'Including energy storage, UPS, traction and telecoms.',
      electricVehicleLabel: 'Electric vehicle (EV) batteries',
      electricVehicleHint: 'Propulsion batteries for electric vehicles.',
      sliLabel: 'SLI batteries',
      sliHint: 'Starting, lighting and ignition batteries for vehicles.',
      restrictedHeading: 'Restricted substances',
      restrictedBody:
        'Whichever categories you place on the market, batteries must not contain mercury, cadmium or lead above the permitted thresholds.',
      continueAction: 'Continue',
      error: {
        title: 'There is a problem',
        atLeastOne: 'Select at least one battery category'
      }
    },
    brandNames: {
      title: 'Brand names',
      heading: 'Brand names',
      intro: 'List the brand names of the batteries you place on the market.',
      textareaLabel: 'Brand names',
      textareaHint: 'Enter one brand name per line.',
      continueAction: 'Continue',
      error: {
        title: 'There is a problem',
        atLeastOne: 'Enter at least one brand name'
      }
    },
    producerRoute: {
      title: 'How will you meet your obligations?',
      heading: 'How will you meet your producer responsibility obligations?',
      intro:
        'Under the EU Batteries Regulation you are responsible for your batteries at end of life. You can meet these obligations yourself or appoint a producer responsibility organisation (PRO).',
      selfLabel: 'I will meet my obligations directly',
      selfHint: 'You take operational and financial responsibility yourself.',
      proLabel: 'I will appoint a producer responsibility organisation',
      proHint: 'A PRO meets your collection and reporting obligations on your behalf.',
      continueAction: 'Continue',
      error: {
        title: 'There is a problem',
        choice: 'Select how you will meet your obligations'
      }
    },
    declaration: {
      title: 'Declaration',
      heading: 'Declaration',
      intro:
        'Confirm the information you have provided is correct. We will allocate your Northern Ireland producer registration number and record your registration.',
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
    confirmation: {
      title: 'Registration submitted',
      heading: 'Registration submitted',
      panelTitle: 'Registration submitted',
      panelBody: 'Your producer registration number',
      statusLabel: 'Status',
      statusValue: 'Submitted',
      regulatorLabel: 'Regulator',
      regulatorValue: 'DAERA (Northern Ireland)',
      nextHeading: 'What happens next',
      nextBody:
        'In a real service we would email you a confirmation. For this prototype the submission is recorded in your browser session.',
      continueAction: 'Continue to your dashboard'
    }
  }
}
