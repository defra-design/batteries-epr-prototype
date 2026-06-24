export const niContent = {
  home: {
    title: 'Northern Ireland producer (EU Batteries Regulation)',
    description:
      'A walkthrough for producers placing batteries on the Northern Ireland market under the EU Batteries Regulation (EU) 2023/1542, which applies under the Windsor Framework. Turn on EUBR mode to see which legislation each area covers.',
    bullets: [
      'Register, declare battery categories and choose how you meet your producer responsibility obligations.',
      'Complete EUBR-specific steps: carbon footprint, battery passport and supply-chain due diligence.',
      'Submit your annual return on batteries placed on the market, collected and recycled.'
    ],
    primaryAction: 'Start the Northern Ireland journey'
  },
  signIn: {
    title: 'Sign in — Northern Ireland producer',
    heading: 'Sign in to register as a Northern Ireland battery producer',
    intro:
      'Northern Ireland producers comply with the EU Batteries Regulation (EU) 2023/1542. Enter the email address you would like to register with. This playground does not require a password.',
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
      },
      {
        eubrKey: 'collectionTargets',
        column: 'full',
        title: 'Collection and recycling obligation',
        description: 'See the obligation calculated from your annual returns.',
        status: { text: 'Not started', classes: 'govuk-tag--grey' },
        body: 'View your collection targets and recycling efficiency, calculated from the annual returns you have submitted.'
      },
      {
        eubrKey: 'recycledContent',
        column: 'full',
        title: 'Battery product requirements',
        description: 'Carbon footprint, recycled content and battery passport.',
        status: { text: 'Not started', classes: 'govuk-tag--grey' },
        body: 'See which carbon footprint, recycled-content and battery-passport requirements apply to your batteries, based on your registration.'
      }
    ]
  },
  productRequirements: {
    title: 'Battery product requirements — Northern Ireland producer',
    heading: 'Your battery product requirements',
    intro:
      'These EU Batteries Regulation product obligations apply to electric-vehicle, LMT and industrial batteries. Status is calculated from the details you gave during registration. Turn on EUBR mode and hover a heading to see the legislation it comes from.',
    empty:
      'Complete your registration to see which carbon footprint, recycled content and battery passport requirements apply to you.'
  },
  obligation: {
    title: 'Your obligation — Northern Ireland producer',
    heading: 'Your collection and recycling obligation',
    intro:
      'This obligation is calculated from the annual returns you have submitted. Portable batteries have a percentage collection target under Article 59, measured against the average tonnage placed on the market over the reporting year and the two preceding years; recycling efficiency follows Annex XII of the EU Batteries Regulation.',
    note:
      'Industrial, automotive and EV batteries have a take-back obligation under Article 61: you must accept all returned waste batteries free of charge, so there is no percentage collection target for these streams.',
    empty:
      'Submit an annual return to see your calculated collection and recycling obligation.'
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
    carbonFootprint: {
      title: 'Carbon footprint declaration',
      heading: 'Declare the carbon footprint of your batteries',
      intro:
        'Electric-vehicle, LMT and rechargeable industrial batteries must carry a carbon footprint declaration and performance class, and meet minimum recycled-content shares.',
      valueLabel: 'Carbon footprint (kg CO2e per kWh)',
      valueHint: 'Enter the declared carbon footprint over the battery life cycle.',
      classLegend: 'Carbon footprint performance class',
      classHint: 'Class A is the lowest carbon footprint.',
      classes: ['A', 'B', 'C', 'D', 'E'],
      recycledHeading: 'Recycled content',
      recycledIntro:
        'Declare the share of recycled material recovered from waste, if known. Minimum shares apply from 18 August 2028.',
      cobaltLabel: 'Recycled cobalt',
      lithiumLabel: 'Recycled lithium',
      nickelLabel: 'Recycled nickel',
      leadLabel: 'Recycled lead',
      continueAction: 'Continue',
      error: {
        title: 'There is a problem',
        value: 'Enter the carbon footprint as a number',
        class: 'Select a performance class',
        percentage: 'Enter a percentage between 0 and 100'
      }
    },
    batteryPassport: {
      title: 'Battery passport and labelling',
      heading: 'Battery passport and labelling',
      intro:
        'LMT, industrial and electric-vehicle batteries need a QR data carrier linked to a digital battery passport. All batteries must carry the required labelling, and portable batteries must be removable by the end user.',
      qrCaption: 'Illustrative QR data carrier — links to the battery passport',
      carrierLabel: 'Battery passport data carrier reference (optional)',
      carrierHint:
        'In a real service the QR code links to the digital battery passport.',
      labelLegend: 'Confirm the labelling applied to your batteries',
      separateCollectionLabel:
        'Separate-collection symbol (crossed-out wheeled bin)',
      capacityLabel: 'Capacity marking',
      ceLabel: 'CE marking',
      hazardousLabel: 'Hazardous-substance marking where required',
      removabilityLegend:
        'Are portable batteries removable and replaceable by the end user?',
      removabilityYes: 'Yes',
      removabilityNo: 'No',
      removabilityNa:
        'Not applicable — I do not place portable batteries on the market',
      continueAction: 'Continue',
      error: {
        title: 'There is a problem',
        removability:
          'Select whether portable batteries are removable and replaceable'
      }
    },
    dueDiligence: {
      title: 'Due diligence',
      heading: 'Supply-chain due diligence',
      intro:
        'Economic operators with net turnover above €40 million must operate a battery due diligence policy covering raw materials such as cobalt, lithium, nickel and natural graphite.',
      thresholdLegend: 'Is your net turnover above €40 million?',
      thresholdYes: 'Yes',
      thresholdNo: 'No',
      policyHeading: 'Due diligence policy',
      policyIntro:
        'Confirm your due diligence arrangements. These apply if your turnover is above the threshold.',
      policyConfirmLabel:
        'We operate a supply-chain due diligence policy for raw materials',
      verifiedConfirmLabel:
        'Our due diligence policy has been verified by a notified body',
      referenceLabel: 'Link to your due diligence policy (optional)',
      continueAction: 'Continue',
      error: {
        title: 'There is a problem',
        threshold:
          'Select whether your net turnover is above €40 million',
        policyConfirm: 'Confirm you operate a due diligence policy'
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
        'In a real service we would email you a confirmation. For this playground the submission is recorded in your browser session.',
      continueAction: 'Continue to your dashboard'
    }
  },
  annualReturn: {
    categories: {
      title: 'Annual return — categories',
      heading: 'Which battery categories does this return cover?',
      intro:
        'Each year you must report to your competent authority on the batteries you place on the market and what is collected and recycled. Select the categories this return covers.',
      portableLabel: 'Portable batteries',
      lmtLabel: 'Light means of transport (LMT) batteries',
      industrialLabel: 'Industrial batteries',
      electricVehicleLabel: 'Electric vehicle (EV) batteries',
      sliLabel: 'SLI batteries',
      continueAction: 'Continue',
      error: {
        title: 'There is a problem',
        atLeastOne: 'Select at least one battery category'
      }
    },
    placedOnMarket: {
      title: 'Annual return — placed on market',
      heading: 'Batteries placed on the market',
      intro:
        'Enter the total weight of batteries you placed on the Northern Ireland market during the reporting period.',
      portableLabel: 'Portable batteries',
      lmtLabel: 'Light means of transport (LMT) batteries',
      industrialLabel: 'Industrial batteries',
      evLabel: 'Electric vehicle (EV) batteries',
      automotiveLabel: 'Automotive (SLI) batteries',
      tonnesSuffix: 'tonnes',
      continueAction: 'Continue',
      error: {
        title: 'There is a problem',
        atLeastOne: 'Enter at least one placed-on-market tonnage',
        number: 'Enter a weight in tonnes as a number'
      }
    },
    collection: {
      title: 'Annual return — collection',
      heading: 'Waste batteries collected',
      intro:
        'Enter the weight of waste batteries collected or taken back during the reporting period.',
      targetsHeading: 'Collection targets',
      targetsBody:
        'Producers must meet rising collection targets for portable batteries (45% rising to 73%) and LMT batteries, and take back industrial, automotive and EV batteries free of charge.',
      portableLabel: 'Portable batteries collected',
      lmtLabel: 'LMT batteries collected',
      industrialLabel: 'Industrial batteries taken back',
      evLabel: 'Electric vehicle (EV) batteries taken back',
      automotiveLabel: 'Automotive (SLI) batteries taken back',
      tonnesSuffix: 'tonnes',
      continueAction: 'Continue',
      error: {
        title: 'There is a problem',
        number: 'Enter a weight in tonnes as a number'
      }
    },
    recyclingEfficiency: {
      title: 'Annual return — recycling efficiency',
      heading: 'Recycling efficiency and material recovery',
      intro:
        'Enter the recycling efficiency achieved for the waste batteries sent for treatment, by chemistry.',
      leadAcidLabel: 'Lead-acid recycling efficiency',
      lithiumLabel: 'Lithium-based recycling efficiency',
      nickelCadmiumLabel: 'Nickel-cadmium recycling efficiency',
      recoveryHeading: 'Material recovery',
      recoveryBody:
        'Treatment must also meet recovery targets for cobalt, copper, lead, lithium and nickel set out in Annex XII.',
      continueAction: 'Continue',
      error: {
        title: 'There is a problem',
        percentage: 'Enter a percentage between 0 and 100'
      }
    },
    declaration: {
      title: 'Annual return — declaration',
      heading: 'Declaration',
      intro:
        'Confirm the figures you have entered are correct. Submitting will record your annual return for the reporting period.',
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
    confirmation: {
      title: 'Annual return submitted',
      heading: 'Annual return submitted',
      panelTitle: 'Annual return submitted',
      panelBody: 'Your annual return reference',
      periodLabel: 'Reporting period',
      regulatorLabel: 'Regulator',
      regulatorValue: 'DAERA (Northern Ireland)',
      nextHeading: 'What happens next',
      nextBody:
        'In a real service your competent authority would acknowledge your return. For this playground the submission is recorded in your browser session.',
      continueAction: 'Back to your dashboard'
    }
  }
}
