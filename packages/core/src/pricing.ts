import type { BikeCategory, DistanceSlab, PricingQuote, ServiceType } from "./types";

const baseServicePrices: Record<ServiceType, Record<BikeCategory, number>> = {
  roadside_assistance: {
    "100cc": 299,
    "150cc": 349,
    "200-250cc": 449,
    "350cc": 599
  },
  home_service: {
    "100cc": 599,
    "150cc": 699,
    "200-250cc": 899,
    "350cc": 1199
  }
};

const visitingCharges: Record<DistanceSlab, number> = {
  within_5km: 100,
  within_10km: 200
};

export function quoteService(serviceType: ServiceType, bikeCategory: BikeCategory, distanceSlab: DistanceSlab): PricingQuote {
  const serviceBasePrice = baseServicePrices[serviceType][bikeCategory];
  const visitingCharge = visitingCharges[distanceSlab];

  return {
    serviceBasePrice,
    visitingCharge,
    estimatedTotal: serviceBasePrice + visitingCharge,
    currency: "INR",
    notes: [
      "Final spare parts cost is confirmed after inspection.",
      "Customer shares live location over WhatsApp for MVP dispatch.",
      "Payment is collected by cash or mechanic QR, then verified by operations."
    ]
  };
}
