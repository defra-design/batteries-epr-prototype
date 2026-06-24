const SAMPLE_REGISTRATION = {
  bprn: 'NIP1000001',
  companyName: 'Demo Batteries Ltd',
  producerRoute: 'self',
  status: 'Registered',
  batteryCategories: {
    isPortable: true,
    isLmt: true,
    isIndustrial: true,
    isElectricVehicle: true,
    isSli: false
  },
  carbonFootprint: {
    carbonFootprintValue: '12.4',
    performanceClass: 'B',
    recycledCobalt: '18',
    recycledLithium: '4',
    recycledNickel: '7',
    recycledLead: '90'
  },
  batteryPassport: {
    passportCarrierId: 'BP-NI-000123',
    separateCollection: true,
    capacity: true,
    ce: true,
    hazardous: false,
    removability: 'na'
  }
}

const SAMPLE_RETURNS = [
  {
    period: '2026',
    reference: 'NI-AR-260001',
    status: 'Submitted',
    placedOnMarket: {
      pomPortable: '120',
      pomLmt: '40',
      pomIndustrial: '30',
      pomEv: '25',
      pomAutomotive: '15'
    },
    collection: {
      colPortable: '40',
      colLmt: '10',
      colIndustrial: '28',
      colEv: '24',
      colAutomotive: '12'
    },
    recyclingEfficiency: {
      reLeadAcid: '85',
      reLithium: '60',
      reNickelCadmium: '90'
    }
  },
  {
    period: '2027',
    reference: 'NI-AR-270001',
    status: 'Submitted',
    placedOnMarket: {
      pomPortable: '140',
      pomLmt: '40',
      pomIndustrial: '32',
      pomEv: '30',
      pomAutomotive: '16'
    },
    collection: {
      colPortable: '50',
      colLmt: '12',
      colIndustrial: '30',
      colEv: '29',
      colAutomotive: '13'
    },
    recyclingEfficiency: {
      reLeadAcid: '86',
      reLithium: '62',
      reNickelCadmium: '91'
    }
  },
  {
    period: '2028',
    reference: 'NI-AR-280001',
    status: 'Submitted',
    placedOnMarket: {
      pomPortable: '160',
      pomLmt: '40',
      pomIndustrial: '34',
      pomEv: '35',
      pomAutomotive: '18'
    },
    collection: {
      colPortable: '70',
      colLmt: '15',
      colIndustrial: '33',
      colEv: '34',
      colAutomotive: '15'
    },
    recyclingEfficiency: {
      reLeadAcid: '88',
      reLithium: '64',
      reNickelCadmium: '92'
    }
  }
]

export const seedSampleData = (store) => {
  store.saveRegistration(SAMPLE_REGISTRATION)
  SAMPLE_RETURNS.forEach((annualReturn) => store.saveAnnualReturn(annualReturn))
}
