export const CARBON_FOOTPRINT = {
  key: 'carbonFootprint',
  heading: 'Carbon footprint',
  appliesToCategories: ['isElectricVehicle', 'isLmt', 'isIndustrial'],
  legislation: {
    articles: 'Articles 7 to 10',
    title: 'Carbon footprint declaration',
    summary:
      'EV, LMT and rechargeable industrial batteries must carry a carbon footprint declaration and performance class.',
    appliesFrom: 'Phased from 2025 to 2028'
  }
}

export const RECYCLED_CONTENT = {
  key: 'recycledContent',
  heading: 'Recycled content',
  appliesToCategories: [
    'isElectricVehicle',
    'isLmt',
    'isIndustrial',
    'isSli'
  ],
  legislation: {
    articles: 'Article 8',
    title: 'Recycled content',
    summary:
      'Industrial, EV, LMT and SLI batteries must declare and meet minimum recycled shares of cobalt, lithium, nickel and lead.',
    appliesFrom: 'Declaration from 2028; minimum shares from 2031'
  },
  materials: [
    { key: 'cobalt', label: 'Cobalt', field: 'recycledCobalt', thresholdPercent: 16 },
    { key: 'lithium', label: 'Lithium', field: 'recycledLithium', thresholdPercent: 6 },
    { key: 'nickel', label: 'Nickel', field: 'recycledNickel', thresholdPercent: 6 },
    { key: 'lead', label: 'Lead', field: 'recycledLead', thresholdPercent: 85 }
  ]
}

export const BATTERY_PASSPORT = {
  key: 'batteryPassport',
  heading: 'Battery passport and labelling',
  appliesToCategories: ['isElectricVehicle', 'isLmt', 'isIndustrial'],
  legislation: {
    articles: 'Article 77 and 13(6)',
    title: 'Battery passport and QR code',
    summary:
      'EV, LMT and industrial batteries over 2 kWh need a QR data carrier linked to a digital battery passport.',
    appliesFrom: '18 February 2027'
  },
  labelFields: [
    { key: 'separateCollection', label: 'Separate-collection symbol' },
    { key: 'capacity', label: 'Capacity marking' },
    { key: 'ce', label: 'CE marking' },
    { key: 'hazardous', label: 'Hazardous-substance marking' }
  ]
}

export const REMOVABILITY_LABELS = {
  yes: 'Yes',
  no: 'No',
  na: 'Not applicable'
}
