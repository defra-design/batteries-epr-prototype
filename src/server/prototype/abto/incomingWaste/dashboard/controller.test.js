import { initialiseServer } from '../../../../../test-utils/initialise-server.js'
import { paths } from '../../../../../config/paths.js'
import { statusCodes } from '../../../../common/constants/status-codes.js'
import {
  PROTOTYPE_ABTO_OPERATOR_NAME,
  prototypeAbtoContent
} from '../../../../../config/prototype-abto-content.js'
import { formatTonnes, getDeliveries } from '../deliveries.js'

describe('#prototypeAbtoIncomingWasteDashboard', () => {
  let server
  beforeAll(async () => {
    server = await initialiseServer()
  })
  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('GET renders the incoming waste dashboard', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: paths.prototypeAbtoIncomingWasteDashboard
    })

    expect(statusCode).toBe(statusCodes.ok)

    const pageContent = prototypeAbtoContent.dashboard
    expect(result).toEqual(expect.stringContaining(pageContent.caption))
    expect(result).toEqual(expect.stringContaining(pageContent.heading))
    expect(result).toEqual(expect.stringContaining(pageContent.subHeading))
    expect(result).toEqual(expect.stringContaining(pageContent.intro))
    expect(result).toEqual(
      expect.stringContaining('data-testid="abto-dashboard-table"')
    )
    expect(result).toEqual(expect.stringContaining(pageContent.columns.scheme))
  })

  test('lists both seeded deliveries with their reported tonnage, batch ID and a Verify link to the comparison screen', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: paths.prototypeAbtoIncomingWasteDashboard
    })

    for (const delivery of getDeliveries()) {
      const escapedSchemeName = delivery.schemeName.replace(/&/g, '&amp;')
      expect(result).toEqual(expect.stringContaining(escapedSchemeName))
      expect(result).toEqual(
        expect.stringContaining(formatTonnes(delivery.reportedTonnes))
      )
      expect(result).toEqual(expect.stringContaining(delivery.id))

      const compareUrl = paths.prototypeAbtoIncomingWasteCompare.replace(
        '{deliveryId}',
        delivery.id
      )
      expect(result).toEqual(
        expect.stringContaining(
          `href="${compareUrl}" data-testid="abto-dashboard-verify-${delivery.id}"`
        )
      )
    }
  })

  test('reports the Voltguard delivery at 50.000 tonnes reported, matching the comparison screen', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: paths.prototypeAbtoIncomingWasteDashboard
    })

    const voltguard = getDeliveries().find(
      (delivery) => delivery.id === 'BT2026-0071'
    )
    expect(voltguard.reportedTonnes).toBe(50)
    expect(result).toEqual(expect.stringContaining('50.000t'))
    expect(result).not.toEqual(expect.stringContaining('41.200t'))
  })

  test('is task-flow chrome only — service name shown, no masthead navigation', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: paths.prototypeAbtoIncomingWasteDashboard
    })

    expect(result).toEqual(
      expect.stringContaining('Batteries: Treatment Operator')
    )
    expect(result).not.toEqual(expect.stringContaining('>Manage account<'))
    expect(result).not.toEqual(expect.stringContaining('>Sign out<'))
    expect(result).not.toEqual(expect.stringContaining('govuk-tabs__list-item'))
    expect(result).not.toEqual(expect.stringContaining('govuk-breadcrumbs'))
  })

  test('emits the payload the client uses to merge in deliveries reported by a scheme', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: paths.prototypeAbtoIncomingWasteDashboard
    })

    const payload = JSON.parse(
      result.match(/id="page-payload"[^>]*>([^<]+)<\/script>/)[1]
    )
    expect(payload).toEqual({
      step: 'dashboard',
      target: 'hydrate',
      operatorName: PROTOTYPE_ABTO_OPERATOR_NAME,
      verifyAction: prototypeAbtoContent.dashboard.verifyAction,
      compareUrlTemplate: paths.prototypeAbtoIncomingWasteCompare
    })
    expect(result).toEqual(
      expect.stringContaining('prototypeAbtoIncomingWaste')
    )
  })
})
