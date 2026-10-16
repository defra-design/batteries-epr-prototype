// Seeded IronWave Compliance application for the regulator's "application for
// approval" journey. The ten steps and their automated results come from the
// Figma frames; `result` values are keys of content.application.results.
export const APPLICATION_ID = 'ironwave-compliance'

export const application = {
  id: APPLICATION_ID,
  schemeName: 'IronWave Compliance',
  submittedOn: '24 July 2026',
  approvalNumber: 'BCS-2026-0147',
  approvedFrom: '1 January 2027',
  compliancePeriod: '2027',
  reviewDate: '31 December 2027',
  organisation: {
    operatorType: 'Compliance scheme',
    companiesHouseNumber: '09217364',
    address: 'Unit 4, Ironbridge Business Park',
    town: 'Telford',
    postcode: 'TF8 7NP',
    telephone: '01952 654321',
    email: 'tom.whitfield@ironwave.co.uk'
  },
  signatory: {
    name: 'Priya Shah',
    position: 'Director',
    email: 'priya.shah@ironwave.co.uk'
  },
  superUser: {
    name: 'Tom Whitfield',
    jobTitle: 'Compliance Officer',
    telephone: '01952 654321',
    email: 'tom.whitfield@ironwave.co.uk'
  },
  steps: [
    {
      title: 'Compliance scheme operator',
      summary: 'Company, operator and signatory',
      result: 'passed',
      details: [
        ['Scheme name', 'IronWave Compliance'],
        ['Operator', 'Priya Shah'],
        ['Company registration number', '09217364'],
        ['Date completed', '24 July 2026']
      ],
      checks: [
        [
          'Company number found on Companies House',
          '09217364 · Active · name matches IronWave Compliance',
          'passed'
        ],
        [
          'Operator listed as a director on Companies House',
          'Priya Shah',
          'passed'
        ],
        [
          'Operator confirmed as authorised signatory',
          'Confirmation link accepted',
          'passed'
        ]
      ]
    },
    {
      title: 'Main contact',
      summary: 'Contact details and email verification',
      result: 'manualCheck',
      details: [
        ['Contact name', 'Tom Whitfield'],
        ['Job title', 'Compliance Officer'],
        ['Email', 'tom.whitfield@ironwave.co.uk'],
        ['Telephone', '01952 654321']
      ],
      checks: [
        ['Email address verified', 'Verification link clicked', 'passed'],
        ['Telephone number format is valid', 'UK landline', 'passed'],
        [
          'Contact name matches the supporting documents',
          "We can't check this automatically",
          'manualCheck'
        ]
      ]
    },
    {
      title: 'Organisation address',
      summary: 'Address and postcode',
      result: 'passed',
      details: [
        ['Address', 'Unit 4, Ironbridge Business Park'],
        ['Town', 'Telford'],
        ['County', 'Shropshire'],
        ['Postcode', 'TF8 7NP']
      ],
      checks: [
        [
          'Address matches the Companies House registered office',
          'Unit 4, Ironbridge Business Park, TF8 7NP',
          'passed'
        ],
        [
          'Postcode found in address lookup',
          'TF8 7NP is a valid UK postcode',
          'passed'
        ]
      ]
    },
    {
      title: 'Service of notice address',
      summary: 'Address for legal notices',
      result: 'passed',
      details: [
        ['Address', 'Unit 4, Ironbridge Business Park'],
        ['Town', 'Telford'],
        ['County', 'Shropshire'],
        ['Postcode', 'TF8 7NP']
      ],
      checks: [
        ['UK address that can receive legal notices', 'Not a PO box', 'passed'],
        [
          'Same as the organisation address',
          'No alternative address given',
          'passed'
        ]
      ]
    },
    {
      title: 'Invoice address',
      summary: 'Billing address and invoice contact',
      result: 'toCheck',
      warning:
        'No named contact was given for invoicing queries. Ask IronWave Compliance for one before you approve.',
      details: [
        ['Address', 'Unit 4, Ironbridge Business Park'],
        ['Town', 'Telford'],
        ['County', 'Shropshire'],
        ['Postcode', 'TF8 7NP']
      ],
      checks: [
        [
          'Postcode found in address lookup',
          'TF8 7NP is a valid UK postcode',
          'passed'
        ],
        [
          'Named contact for invoicing queries',
          'No invoice contact provided',
          'checkNeeded'
        ]
      ]
    },
    {
      title: 'Sole trader / partnership details',
      summary: 'Business type',
      result: 'notApplicable',
      details: [
        ['Business type', 'Limited company'],
        ['Details', 'Not applicable – registered company']
      ],
      checks: [
        [
          'Business type confirmed on Companies House',
          'Private limited company, so this step does not apply',
          'notApplicable'
        ]
      ]
    },
    {
      title: 'Proposed scheme rules',
      summary: 'Scheme rules document',
      result: 'manualCheck',
      details: [
        ['Scheme rules document', 'IronWave_Scheme_Rules_v1.pdf'],
        [
          'Summary',
          'Covers member obligations, fees, and reporting requirements'
        ]
      ],
      checks: [
        [
          'File opens and passed a virus scan',
          'IronWave_Scheme_Rules_v1.pdf',
          'passed'
        ],
        [
          'Required sections found',
          'Member obligations, fees and reporting',
          'passed'
        ],
        [
          'Consistent with the Waste Batteries and Accumulators Regulations',
          "We can't check this automatically",
          'manualCheck'
        ]
      ]
    },
    {
      title: 'Relevant offences',
      summary: 'Declared and recorded offences',
      result: 'passed',
      details: [['Relevant offences declared', 'None declared']],
      checks: [
        [
          'Environment Agency enforcement records',
          'No matches for the company or its directors',
          'passed'
        ],
        [
          'Companies House disqualified directors register',
          'No matches',
          'passed'
        ]
      ]
    },
    {
      title: 'Operational plan',
      summary: 'Operational plan document',
      result: 'manualCheck',
      details: [
        ['Operational plan document', 'IronWave_Operational_Plan.pdf'],
        ['Date submitted', '24 July 2026']
      ],
      checks: [
        [
          'File opens and passed a virus scan',
          'IronWave_Operational_Plan.pdf',
          'passed'
        ],
        [
          'Covers collection, treatment and reporting',
          'All 3 sections found',
          'passed'
        ],
        [
          "Plan is realistic for the scheme's declared members",
          "We can't check this automatically",
          'manualCheck'
        ]
      ]
    },
    {
      title: 'Additional supporting files',
      summary: 'Required files and file checks',
      result: 'passed',
      details: [
        [
          'Files uploaded',
          '3 files (Certificate of incorporation, Insurance certificate, Bank details letter)'
        ]
      ],
      checks: [
        [
          'All required files uploaded',
          'Certificate of incorporation, insurance certificate, bank details letter',
          'passed'
        ],
        ['Files open and passed a virus scan', '3 of 3 files', 'passed']
      ]
    }
  ]
}

// The member list IronWave Compliance has submitted and is waiting on a decision.
export const memberList = {
  schemeId: 'ironwave-compliance',
  submittedOn: '12 August 2026'
}
