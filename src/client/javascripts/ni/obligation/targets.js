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
    thresholds: [
      { from: 2023, rate: 0.45 },
      { from: 2027, rate: 0.63 },
      { from: 2030, rate: 0.73 }
    ]
  },
  {
    key: 'lmt',
    label: 'Light means of transport (LMT) batteries',
    pomField: 'pomLmt',
    colField: 'colLmt',
    model: COLLECTION_TARGET,
    basis: 'Separate collection target (Article 60)',
    thresholds: [
      { from: 2028, rate: 0.51 },
      { from: 2031, rate: 0.61 }
    ]
  },
  {
    key: 'industrial',
    label: 'Industrial batteries',
    pomField: 'pomIndustrial',
    colField: 'colIndustrial',
    model: TAKE_BACK,
    basis: 'Take-back obligation (Article 61)'
  },
  {
    key: 'electricVehicle',
    label: 'Electric vehicle (EV) batteries',
    pomField: 'pomEv',
    colField: 'colEv',
    model: TAKE_BACK,
    basis: 'Take-back obligation (Article 61)'
  },
  {
    key: 'automotive',
    label: 'Automotive (SLI) batteries',
    pomField: 'pomAutomotive',
    colField: 'colAutomotive',
    model: TAKE_BACK,
    basis: 'Take-back obligation (Article 61)'
  }
]

export const RECYCLING_STREAMS = [
  {
    key: 'leadAcid',
    label: 'Lead-acid batteries',
    field: 'reLeadAcid',
    targetPercent: 80,
    appliesFrom: 'Annex XII, from 2025'
  },
  {
    key: 'lithium',
    label: 'Lithium-based batteries',
    field: 'reLithium',
    targetPercent: 65,
    appliesFrom: 'Annex XII, from 2025'
  },
  {
    key: 'nickelCadmium',
    label: 'Nickel-cadmium batteries',
    field: 'reNickelCadmium',
    targetPercent: 80,
    appliesFrom: 'Annex XII, from 2025'
  }
]
