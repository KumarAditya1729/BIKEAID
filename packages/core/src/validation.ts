import { z } from "zod";
import { bikeCategories, distanceSlabs, mechanicStatuses, paymentMethods, roles, serviceTypes } from "./types";

export const uuidSchema = z.string().uuid();
export const roleSchema = z.enum(roles);
export const phoneSchema = z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10 digit Indian mobile number");

export const profileSchema = z.object({
  fullName: z.string().trim().min(2).max(80),
  phone: phoneSchema,
  role: roleSchema
});

export const serviceRequestSchema = z.object({
  serviceType: z.enum(serviceTypes),
  bikeCategory: z.enum(bikeCategories),
  distanceSlab: z.enum(distanceSlabs),
  pickupAddress: z.string().trim().min(10).max(500),
  issueDescription: z.string().trim().min(5).max(1000),
  whatsappNumber: phoneSchema
});

export const assignmentSchema = z.object({
  requestId: uuidSchema,
  garageId: uuidSchema,
  mechanicId: uuidSchema
});

export const rejectionSchema = z.object({
  requestId: uuidSchema,
  reason: z.string().trim().min(5).max(500)
});

export const mechanicAvailabilitySchema = z.object({
  status: z.enum(mechanicStatuses)
});

export const completionOtpSchema = z.object({
  requestId: uuidSchema,
  otp: z.string().regex(/^\d{6}$/, "OTP must be 6 digits")
});

export const paymentCollectionSchema = z.object({
  requestId: uuidSchema,
  method: z.enum(paymentMethods),
  amount: z.coerce.number().positive().max(100000),
  referenceNote: z.string().trim().max(140).optional()
});

export const paymentVerificationSchema = z.object({
  requestId: uuidSchema,
  status: z.enum(["verified", "disputed"]),
  referenceNote: z.string().trim().max(500).optional()
});

export const ratingSchema = z.object({
  requestId: uuidSchema,
  rating: z.coerce.number().int().min(1).max(5),
  review: z.string().trim().max(1000).optional()
});

export const photoMetadataSchema = z.object({
  requestId: uuidSchema,
  phase: z.enum(["before", "after"]),
  contentType: z.enum(["image/jpeg", "image/png", "image/webp"]),
  fileSize: z.coerce.number().int().positive().max(5 * 1024 * 1024)
});

export const rolePromotionSchema = z.object({
  profileId: uuidSchema,
  role: z.enum(["customer", "mechanic", "garage_owner", "admin"]),
  reason: z.string().trim().min(5).max(500)
});

export const mechanicVerificationSchema = z.object({
  mechanicId: uuidSchema,
  isVerified: z.boolean(),
  garageId: uuidSchema.optional(),
  payoutPercentage: z.coerce.number().min(0).max(100).optional()
});
