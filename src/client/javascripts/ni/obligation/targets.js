export const COLLECTION_TARGET = 'collection-target'
export const TAKE_BACK = 'take-back'

export const COLLECTION_STREAMS = [
  {
    key: 'portable',
    label: 'Portable batteries',
    pomField: 'pomPortable',
    colField: 'colPortable',
    model: COLLECTION_TARGET,
    basis: 'Separate collection target (Article 59)',
    calculationArticles: 'Article 59(3)',
    thresholds: [
      { from: 2023, rate: 0.45 },
      { from: 2027, rate: 0.63 },
      { from: 2030, rate: 0.73 }
    ],
    legislation: {
      articles: 'Article 59',
      title: 'Separate collection target for portable batteries',
      summary:
        'Producers must meet a rising separate-collection target, measured against the average tonnage placed on the market over the year and the two preceding years.',
      appliesFrom: '45% from 2023, 63% from 2027, 73% from 2030'
    }
  },
  {
    key: 'lmt',
    label: 'Light means of transport (LMT) batteries',
    pomField: 'pomLmt',
    colField: 'colLmt',
    model: COLLECTION_TARGET,
    basis: 'Separate collection target (Article 60)',
    calculationArticles: 'Article 60(3)',
    thresholds: [
      { from: 2028, rate: 0.51 },
      { from: 2031, rate: 0.61 }
    ],
    legislation: {
      articles: 'Article 60',
      title: 'Collection target for LMT batteries',
      summary:
        'Light means of transport batteries have their own separate-collection targets, phased in from 2028.',
      appliesFrom: '51% from 2028, 61% from 2031'
    }
  },
  {
    key: 'industrial',
    label: 'Industrial batteries',
    pomField: 'pomIndustrial',
    colField: 'colIndustrial',
    model: TAKE_BACK,
    basis: 'Take-back obligation (Article 61)',
    legislation: {
      articles: 'Article 61',
      title: 'Take-back of industrial batteries',
      summary:
        'Producers must accept all returned waste industrial batteries free of charge. There is no percentage collection target.',
      appliesFrom: 'From 18 August 2025'
    }
  },
  {
    key: 'electricVehicle',
    label: 'Electric vehicle (EV) batteries',
    pomField: 'pomEv',
    colField: 'colEv',
    model: TAKE_BACK,
    basis: 'Take-back obligation (Article 61)',
    legislation: {
      articles: 'Article 61',
      title: 'Take-back of electric vehicle batteries',
      summary:
        'Producers must accept all returned waste EV batteries free of charge. There is no percentage collection target.',
      appliesFrom: 'From 18 August 2025'
    }
  },
  {
    key: 'automotive',
    label: 'Automotive (SLI) batteries',
    pomField: 'pomAutomotive',
    colField: 'colAutomotive',
    model: TAKE_BACK,
    basis: 'Take-back obligation (Article 61)',
    legislation: {
      articles: 'Article 61',
      title: 'Take-back of automotive (SLI) batteries',
      summary:
        'Producers must accept all returned waste SLI batteries free of charge. There is no percentage collection target.',
      appliesFrom: 'From 18 August 2025'
    }
  }
]

export const RECYCLING_STREAMS = [
  {
    key: 'leadAcid',
    label: 'Lead-acid batteries',
    field: 'reLeadAcid',
    targetPercent: 80,
    appliesFrom: 'Annex XII, from 2025',
    legislation: {
      articles: 'Article 71 and Annex XII',
      title: 'Recycling efficiency — lead-acid',
      summary:
        'Lead-acid batteries must meet a minimum recycling efficiency and a lead material-recovery target.',
      appliesFrom: 'From 2025'
    }
  },
  {
    key: 'lithium',
    label: 'Lithium-based batteries',
    field: 'reLithium',
    targetPercent: 65,
    appliesFrom: 'Annex XII, from 2025',
    legislation: {
      articles: 'Article 71 and Annex XII',
      title: 'Recycling efficiency — lithium-based',
      summary:
        'Lithium-based batteries must meet a minimum recycling efficiency and lithium, cobalt and nickel recovery targets.',
      appliesFrom: 'From 2025'
    }
  },
  {
    key: 'nickelCadmium',
    label: 'Nickel-cadmium batteries',
    field: 'reNickelCadmium',
    targetPercent: 80,
    appliesFrom: 'Annex XII, from 2025',
    legislation: {
      articles: 'Article 71 and Annex XII',
      title: 'Recycling efficiency — nickel-cadmium',
      summary:
        'Nickel-cadmium batteries must meet a minimum recycling efficiency target.',
      appliesFrom: 'From 2025'
    }
  }
]
