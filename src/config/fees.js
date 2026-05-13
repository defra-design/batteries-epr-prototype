export const FEE_SCHEDULE = {
  smallProducer: 3000,
  directRegistrant: 55000
}

export const feeForRoute = (producerRoute) =>
  FEE_SCHEDULE[producerRoute] ?? FEE_SCHEDULE.directRegistrant
