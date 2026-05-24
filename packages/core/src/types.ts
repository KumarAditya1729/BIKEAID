export const roles = ["customer", "mechanic", "garage_owner", "admin", "super_admin"] as const;
export type Role = (typeof roles)[number];

export const bikeCategories = ["100cc", "150cc", "200-250cc", "350cc"] as const;
export type BikeCategory = (typeof bikeCategories)[number];

export const serviceTypes = ["roadside_assistance", "home_service"] as const;
export type ServiceType = (typeof serviceTypes)[number];

export const distanceSlabs = ["within_5km", "within_10km"] as const;
export type DistanceSlab = (typeof distanceSlabs)[number];

export const requestStatuses = [
  "draft",
  "submitted",
  "assigned",
  "accepted",
  "in_progress",
  "completed_pending_payment",
  "payment_pending_verification",
  "completed",
  "cancelled",
  "disputed"
] as const;
export type RequestStatus = (typeof requestStatuses)[number];

export const mechanicStatuses = ["online", "busy", "offline", "emergency_duty"] as const;
export type MechanicStatus = (typeof mechanicStatuses)[number];

export const paymentMethods = ["cash", "qr"] as const;
export type PaymentMethod = (typeof paymentMethods)[number];

export const paymentStatuses = ["pending", "verified", "disputed"] as const;
export type PaymentStatus = (typeof paymentStatuses)[number];

export type PricingQuote = {
  serviceBasePrice: number;
  visitingCharge: number;
  estimatedTotal: number;
  currency: "INR";
  notes: string[];
};
