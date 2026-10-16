// Seed data for the regulator's "review ABTO waste returns" journey. Waste
// returns are linked to the compliance scheme whose batteries the operator
// treated, so every submission carries a schemeId (matching the ids in
// storage-seed.json's prototypeRegulatorSchemes), an abtoId and a siteId.
// Figures are tonnes, held at full precision.

export const REVIEW_PERIOD = {
  label: 'Q3 2026',
  longLabel: 'Quarter 3, 2026',
  deadline: '30 Nov 2026'
}

export const SMALL_OPERATOR_THRESHOLD_TONNES = 15

// Everything accepted before this prototype's session starts is already in
// this total; accepting a return adds that return's intake figure to it.
export const NATIONAL_ROLLING_TOTAL_SEED_TONNES = 1139.51

export const CATEGORIES = [
  { id: 'leadAcid', label: 'Lead-acid' },
  { id: 'nicd', label: 'NiCd' },
  { id: 'other', label: 'Other' }
]

// Draft → sign-off → opened-for-review, always on the day after submission.
const buildTimeline = (day, nextDay, extra = []) => [
  { at: `${day}T11:56:00`, text: 'Submission drafted by ABTO operator' },
  {
    at: `${day}T12:28:00`,
    text: 'Authorised and signed off via PIN by the appropriate person'
  },
  { at: `${nextDay}T09:32:00`, text: 'Opened for review by EA caseworker' },
  ...extra
]

export const seedAbtos = () => [
  {
    id: 'haz-tech',
    name: 'Haz Tech',
    type: 'ABTO',
    classification: 'small',
    bensIssuedThisYear: 9.2,
    approvedSince: '2025-06-02',
    schemeIds: ['ironwave-compliance'],
    contacts: [
      { id: 'sam-patel', name: 'Sam Patel', role: 'appropriate person' },
      { id: 'lee-morgan', name: 'Lee Morgan', role: 'account user' }
    ],
    sites: [
      {
        id: 'portsmouth',
        name: 'Portsmouth Site',
        approvalNumber: 'ABTO/2026/0891',
        address: 'Quay Road, Portsmouth PO3 5LR'
      },
      {
        id: 'halton-industrial-park',
        name: 'Unit 4, Halton Industrial Park',
        approvalNumber: 'ABTO/2026/0412',
        address: 'Unit 4, Halton Industrial Park, Runcorn WA7 1PD'
      },
      {
        id: 'riverside-works',
        name: 'Riverside Works, Runcorn',
        approvalNumber: 'ABTO/2026/0413',
        address: 'Riverside Works, Runcorn WA7 1QX'
      }
    ]
  },
  {
    id: 'halton-battery-processing',
    name: 'Halton Battery Processing Ltd',
    type: 'ABTO',
    classification: 'small',
    bensIssuedThisYear: 15.42,
    approvedSince: '2025-03-14',
    schemeIds: [
      'ironwave-compliance',
      'voltguard-batteries',
      'copper-and-co-compliance'
    ],
    contacts: [
      { id: 'jo-marsh', name: 'Jo Marsh', role: 'appropriate person' },
      { id: 'dev-khan', name: 'Dev Khan', role: 'account user' }
    ],
    sites: [
      {
        id: 'foundry-lane',
        name: 'Foundry Lane',
        approvalNumber: 'ABTO/2025/0412',
        address: 'Unit 4, Foundry Lane Industrial Estate, Widnes WA8 0RY'
      }
    ]
  },
  {
    id: 'valpak-recycling',
    name: 'Valpak Recycling',
    type: 'ABS',
    classification: 'small',
    bensIssuedThisYear: 6.8,
    approvedSince: '2026-01-19',
    schemeIds: ['repic'],
    contacts: [
      { id: 'ana-lewis', name: 'Ana Lewis', role: 'appropriate person' },
      { id: 'tom-reid', name: 'Tom Reid', role: 'account user' }
    ],
    sites: [
      {
        id: 'cardiff',
        name: 'Cardiff Site',
        approvalNumber: 'ABTO/2026/0703',
        address: '8 Dock Street, Cardiff CF10 4PL'
      }
    ]
  },
  {
    id: 'ecobat-treatment',
    name: 'Ecobat Treatment',
    type: 'ABTO',
    classification: 'small',
    bensIssuedThisYear: 11.3,
    approvedSince: '2025-08-11',
    schemeIds: ['repic'],
    contacts: [
      { id: 'priya-nair', name: 'Priya Nair', role: 'appropriate person' },
      { id: 'ben-oyelaran', name: 'Ben Oyelaran', role: 'account user' }
    ],
    sites: [
      {
        id: 'nottingham',
        name: 'Nottingham',
        approvalNumber: 'ABTO/2025/0255',
        address: '21 Trent Lane, Nottingham NG2 3DE'
      }
    ]
  },
  {
    id: 'recell-processing',
    name: 'ReCell Processing',
    type: 'ABTO',
    classification: 'small',
    bensIssuedThisYear: 16.1,
    approvedSince: '2026-02-03',
    schemeIds: ['repic'],
    contacts: [
      { id: 'iona-grant', name: 'Iona Grant', role: 'appropriate person' },
      { id: 'raj-mehta', name: 'Raj Mehta', role: 'account user' }
    ],
    sites: [
      {
        id: 'aberdeen',
        name: 'Aberdeen',
        approvalNumber: 'ABTO/2026/0119',
        address: '12 Harbour Road, Aberdeen AB11 5QA'
      }
    ]
  }
]

const figures = (leadAcid, nicd, other) => ({ leadAcid, nicd, other })

export const seedSubmissions = () => [
  {
    id: 'ironwave-compliance:haz-tech:portsmouth',
    schemeId: 'ironwave-compliance',
    abtoId: 'haz-tech',
    siteId: 'portsmouth',
    status: 'awaitingReview',
    submittedOn: '2026-10-06T12:28:00',
    intake: figures(45.2, 12.0, 8.15),
    bens: figures(45.2, 10.0, 8.15),
    benCount: 6,
    checks: [
      {
        title: 'Whole-ton anomaly detected',
        body: 'IronWave Compliance reported exactly 15.000 tonnes of lead-acid. Real-world weighbridge data rarely lands on an exact whole tonne.'
      },
      {
        title: 'Repeated tonnage check',
        body: 'IronWave Compliance has submitted identical tonnage (12.450 t) for three consecutive quarters.'
      },
      {
        title: 'Invisible stockpile alert',
        body: '2.000 tonnes of sorted lithium-ion has sat in the intake log for more than 45 days without associated evidence notes being issued.'
      }
    ],
    timeline: buildTimeline('2026-10-06', '2026-10-07'),
    query: null,
    acceptedAt: null
  },
  {
    id: 'ironwave-compliance:haz-tech:halton-industrial-park',
    schemeId: 'ironwave-compliance',
    abtoId: 'haz-tech',
    siteId: 'halton-industrial-park',
    status: 'awaitingReview',
    submittedOn: '2026-10-07T12:10:00',
    intake: figures(30.5, 6.0, 2.25),
    bens: figures(30.5, 6.0, 2.25),
    benCount: 4,
    checks: [],
    timeline: buildTimeline('2026-10-07', '2026-10-08'),
    query: null,
    acceptedAt: null
  },
  {
    id: 'ironwave-compliance:haz-tech:riverside-works',
    schemeId: 'ironwave-compliance',
    abtoId: 'haz-tech',
    siteId: 'riverside-works',
    status: 'accepted',
    submittedOn: '2026-10-02T12:05:00',
    intake: figures(18.75, 3.5, 1.1),
    bens: figures(18.75, 3.5, 1.1),
    benCount: 3,
    checks: [],
    timeline: buildTimeline('2026-10-02', '2026-10-03', [
      { at: '2026-10-03T14:20:00', text: 'Accepted by EA caseworker' }
    ]),
    query: null,
    acceptedAt: '2026-10-03T14:20:00'
  },
  {
    id: 'ironwave-compliance:halton-battery-processing:foundry-lane',
    schemeId: 'ironwave-compliance',
    abtoId: 'halton-battery-processing',
    siteId: 'foundry-lane',
    status: 'accepted',
    submittedOn: '2026-10-02T11:40:00',
    intake: figures(9.1, 4.2, 2.12),
    bens: figures(9.1, 4.2, 2.12),
    benCount: 5,
    checks: [],
    timeline: buildTimeline('2026-10-02', '2026-10-03', [
      { at: '2026-10-03T10:15:00', text: 'Accepted by EA caseworker' }
    ]),
    query: null,
    acceptedAt: '2026-10-03T10:15:00'
  },
  {
    id: 'repic:valpak-recycling:cardiff',
    schemeId: 'repic',
    abtoId: 'valpak-recycling',
    siteId: 'cardiff',
    status: 'awaitingReview',
    submittedOn: '2026-10-09T12:00:00',
    intake: figures(22.4, 5.15, 3.6),
    bens: figures(22.4, 5.15, 3.6),
    benCount: 4,
    checks: [],
    timeline: buildTimeline('2026-10-09', '2026-10-10'),
    query: null,
    acceptedAt: null
  },
  {
    id: 'repic:ecobat-treatment:nottingham',
    schemeId: 'repic',
    abtoId: 'ecobat-treatment',
    siteId: 'nottingham',
    status: 'querySent',
    submittedOn: '2026-10-01T12:30:00',
    intake: figures(14.0, 2.8, 5.5),
    bens: figures(14.0, 2.0, 5.5),
    benCount: 3,
    checks: [],
    timeline: buildTimeline('2026-10-01', '2026-10-02', [
      { at: '2026-10-02T15:05:00', text: 'Query sent to ABTO by EA caseworker' }
    ]),
    query: {
      categoryIds: ['nicd'],
      contactIds: ['priya-nair'],
      reason: 'NiCd tonnage in the return does not match BENs issued.',
      sentAt: '2026-10-02T15:05:00'
    },
    acceptedAt: null
  },
  {
    id: 'repic:recell-processing:aberdeen',
    schemeId: 'repic',
    abtoId: 'recell-processing',
    siteId: 'aberdeen',
    status: 'overdue',
    submittedOn: null,
    intake: null,
    bens: null,
    benCount: 0,
    checks: [],
    timeline: [],
    query: null,
    acceptedAt: null
  }
]
