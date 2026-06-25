import inert from '@hapi/inert'

import { home } from './home/index.js'
import { about } from './about/index.js'
import { cookies } from './cookies/index.js'
import { terms } from './terms/index.js'
import { privacy } from './privacy/index.js'
import { accessibility } from './accessibility/index.js'
import { health } from './health/index.js'
import { signIn } from './signIn/index.js'
import { signOut } from './signOut/index.js'
import { signedOut } from './signedOut/index.js'
import { publicRegister } from './publicRegister/index.js'
import { dashboard } from './dashboard/index.js'
import { onboarding } from './onboarding/index.js'
import { annualReturn } from './annualReturn/index.js'
import { serviceCharge } from './serviceCharge/index.js'
import { paymentDetails } from './paymentDetails/index.js'
import { account } from './account/index.js'
import { accountScheme } from './account/scheme/index.js'
import { leaveScheme } from './leaveScheme/index.js'
import { devReset } from './devReset/index.js'
import { devTimeTravel } from './devTimeTravel/index.js'
import { devSchemes } from './devSchemes/index.js'
import { devData } from './devData/index.js'
import { complianceSchemeDashboard } from './complianceScheme/dashboard/index.js'
import { complianceSchemeSignIn } from './complianceScheme/signIn/index.js'
import { complianceSchemeApplication } from './complianceScheme/application/index.js'
import { complianceSchemeMembers } from './complianceScheme/members/index.js'
import { complianceSchemeQuarterly } from './complianceScheme/quarterly/index.js'
import { complianceSchemeIa } from './complianceScheme/industrialAutomotive/index.js'
import { complianceSchemeEvidence } from './complianceScheme/evidence/index.js'
import { complianceSchemeObligation } from './complianceScheme/obligation/index.js'
import { regulatorSignIn } from './regulator/signIn/index.js'
import { regulatorDashboard } from './regulator/dashboard/index.js'
import { regulatorSchemeList } from './regulator/schemes/list/index.js'
import { regulatorSchemeDetail } from './regulator/schemes/detail/index.js'
import { regulatorOperatorList } from './regulator/operators/list/index.js'
import { regulatorOperatorDetail } from './regulator/operators/detail/index.js'
import { regulatorProducerList } from './regulator/producers/list/index.js'
import { regulatorProducerDetail } from './regulator/producers/detail/index.js'
import { regulatorEvidenceList } from './regulator/evidence/list/index.js'
import { regulatorEvidenceDetail } from './regulator/evidence/detail/index.js'
import { regulatorSubmissions } from './regulator/submissions/index.js'
import { regulatorSchemeWithdraw } from './regulator/schemes/withdraw/index.js'
import { regulatorOperatorWithdraw } from './regulator/operators/withdraw/index.js'
import { operatorSignIn } from './operator/signIn/index.js'
import { operatorDashboard } from './operator/dashboard/index.js'
import { operatorApplication } from './operator/application/index.js'
import { operatorEvidence } from './operator/evidence/index.js'
import { operatorQuarterly } from './operator/quarterly/index.js'
import { operatorAnnualReturn } from './operator/annualReturn/index.js'
import { niSignIn } from './ni/signIn/index.js'
import { niDashboard } from './ni/dashboard/index.js'
import { niOnboarding } from './ni/onboarding/index.js'
import { niAnnualReturn } from './ni/annualReturn/index.js'
import { niObligation } from './ni/obligation/index.js'
import { niProductRequirements } from './ni/productRequirements/index.js'
import { serveStaticFiles } from './common/helpers/serve-static-files.js'

const createPlugin = (plugins, [item, routes]) => {
  plugins.push({
    plugin: {
      name: item,
      register(server) {
        server.route(routes)
      }
    }
  })
  return plugins
}

export const router = {
  plugin: {
    name: 'router',
    async register(server) {
      await server.register([inert])

      const plugins = Object.entries({
        home: home.openRoutes,
        about: about.openRoutes,
        cookies: cookies.openRoutes,
        terms: terms.openRoutes,
        privacy: privacy.openRoutes,
        accessibility: accessibility.openRoutes,
        health: health.openRoutes,
        signIn: signIn.openRoutes,
        signOut: signOut.openRoutes,
        signedOut: signedOut.openRoutes,
        publicRegister: publicRegister.openRoutes,
        dashboard: dashboard.openRoutes,
        onboarding: onboarding.openRoutes,
        annualReturn: annualReturn.openRoutes,
        serviceCharge: serviceCharge.openRoutes,
        paymentDetails: paymentDetails.openRoutes,
        account: account.openRoutes,
        accountScheme: accountScheme.openRoutes,
        leaveScheme: leaveScheme.openRoutes,
        devReset: devReset.openRoutes,
        devTimeTravel: devTimeTravel.openRoutes,
        devSchemes: devSchemes.openRoutes,
        devData: devData.openRoutes,
        complianceSchemeDashboard: complianceSchemeDashboard.openRoutes,
        complianceSchemeSignIn: complianceSchemeSignIn.openRoutes,
        complianceSchemeApplication: complianceSchemeApplication.openRoutes,
        complianceSchemeMembers: complianceSchemeMembers.openRoutes,
        complianceSchemeQuarterly: complianceSchemeQuarterly.openRoutes,
        complianceSchemeIa: complianceSchemeIa.openRoutes,
        complianceSchemeEvidence: complianceSchemeEvidence.openRoutes,
        complianceSchemeObligation: complianceSchemeObligation.openRoutes,
        regulatorSignIn: regulatorSignIn.openRoutes,
        regulatorDashboard: regulatorDashboard.openRoutes,
        regulatorSchemeList: regulatorSchemeList.openRoutes,
        regulatorSchemeDetail: regulatorSchemeDetail.openRoutes,
        regulatorOperatorList: regulatorOperatorList.openRoutes,
        regulatorOperatorDetail: regulatorOperatorDetail.openRoutes,
        regulatorProducerList: regulatorProducerList.openRoutes,
        regulatorProducerDetail: regulatorProducerDetail.openRoutes,
        regulatorEvidenceList: regulatorEvidenceList.openRoutes,
        regulatorEvidenceDetail: regulatorEvidenceDetail.openRoutes,
        regulatorSubmissions: regulatorSubmissions.openRoutes,
        regulatorSchemeWithdraw: regulatorSchemeWithdraw.openRoutes,
        regulatorOperatorWithdraw: regulatorOperatorWithdraw.openRoutes,
        operatorSignIn: operatorSignIn.openRoutes,
        operatorDashboard: operatorDashboard.openRoutes,
        operatorApplication: operatorApplication.openRoutes,
        operatorEvidence: operatorEvidence.openRoutes,
        operatorQuarterly: operatorQuarterly.openRoutes,
        operatorAnnualReturn: operatorAnnualReturn.openRoutes,
        niSignIn: niSignIn.openRoutes,
        niDashboard: niDashboard.openRoutes,
        niOnboarding: niOnboarding.openRoutes,
        niAnnualReturn: niAnnualReturn.openRoutes,
        niObligation: niObligation.openRoutes,
        niProductRequirements: niProductRequirements.openRoutes
      }).reduce((p, entry) => createPlugin(p, entry), [])

      await server.register(plugins)

      await server.register([serveStaticFiles])
    }
  }
}
