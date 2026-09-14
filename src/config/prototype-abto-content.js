export const PROTOTYPE_ABTO_SERVICE_NAME = 'Batteries: Treatment Operator'

export const PROTOTYPE_ABTO_OPERATOR_NAME = 'Halton Battery Processing Ltd'

export const prototypeAbtoContent = {
  dashboard: {
    title: 'Incoming waste deliveries',
    heading: 'Incoming waste deliveries',
    caption: PROTOTYPE_ABTO_OPERATOR_NAME,
    subHeading: 'Pending verification',
    intro:
      'Deliveries that schemes have reported handing over to you. Compare each one against your weighbridge records before accepting it.',
    columns: {
      scheme: 'Scheme'
    },
    verifyAction: 'Verify'
  }
}
