import { z } from "zod";

import { calculateAgreementEndDate } from "@/lib/date";
import { parseNumberInput } from "@/lib/utils";

const mobileNumberRegex = /^[6-9]\d{9}$/;
const pincodeRegex = /^\d{6}$/;
const panRegex = /^[A-Z]{5}\d{4}[A-Z]$/;
const aadhaarLast4Regex = /^\d{4}$/;

const optionalTrimmedString = z
  .string()
  .transform((value) => value.trim())
  .optional()
  .or(z.literal(""));

const requiredString = (label: string) =>
  z.string().trim().min(1, `${label} is required.`);

const requiredNumber = (label: string) =>
  z.preprocess(
    parseNumberInput,
    z.any().transform((value, ctx) => {
      if (typeof value !== "number" || Number.isNaN(value)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `${label} is required.`,
        });
        return z.NEVER;
      }

      return value;
    }),
  );

const optionalNumber = () =>
  z.preprocess(parseNumberInput, z.number().optional());

const optionalPanSchema = z
  .string()
  .trim()
  .toUpperCase()
  .refine((value) => value === "" || panRegex.test(value), "Enter a valid PAN.")
  .optional()
  .or(z.literal(""));

const optionalAadhaarLast4Schema = z
  .string()
  .trim()
  .refine(
    (value) => value === "" || aadhaarLast4Regex.test(value),
    "Aadhaar must contain only the last 4 digits.",
  )
  .optional()
  .or(z.literal(""));

export const clauseSchema = z.object({
  title: requiredString("Clause title"),
  text: requiredString("Clause text"),
});

const agreementFormBaseSchema = z.object({
    agreementType: z.enum(["monthlyRent", "leaveAndLicense", "fixedTermLease"]),
    usageType: z.enum(["residential", "commercial"]),
    property: z.object({
      propertyAddressLine1: requiredString("Address line 1"),
      propertyAddressLine2: optionalTrimmedString,
      city: requiredString("City"),
      pincode: z
        .string()
        .trim()
        .regex(pincodeRegex, "Enter a valid 6-digit pincode."),
      state: requiredString("State"),
      propertyType: z.enum([
        "flat",
        "villa",
        "independentHouse",
        "shop",
        "office",
        "other",
      ]),
      furnishingType: z.enum([
        "furnished",
        "semiFurnished",
        "unfurnished",
      ]),
      amenitiesIncluded: z.object({
        parking: z.boolean(),
        water: z.boolean(),
        electricity: z.boolean(),
        gas: z.boolean(),
        other: optionalTrimmedString,
      }),
    }),
    landlord: z
      .object({
        landlordFullName: requiredString("Landlord name"),
        landlordMobileNumber: z
          .string()
          .trim()
          .regex(mobileNumberRegex, "Enter a valid Indian mobile number."),
        landlordEmail: z.string().trim().email("Enter a valid email address."),
        landlordPAN: optionalPanSchema,
        landlordAadhaarLast4: optionalAadhaarLast4Schema,
        landlordAddressSameAsProperty: z.boolean(),
        landlordAddress: optionalTrimmedString,
        ownershipType: z.enum(["singleOwner", "jointOwners"]),
        jointOwnerNames: z.array(z.string().trim()).default([]),
      })
      .superRefine((value, ctx) => {
        if (!value.landlordAddressSameAsProperty && !value.landlordAddress?.trim()) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["landlordAddress"],
            message: "Landlord address is required if it differs from the property.",
          });
        }

        if (value.ownershipType === "jointOwners") {
          const validNames = value.jointOwnerNames.filter((name) => name.trim().length > 1);
          if (validNames.length === 0) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ["jointOwnerNames"],
              message: "Add at least one joint owner name.",
            });
          }
        }
      }),
    tenant: z.object({
      tenantFullName: requiredString("Tenant name"),
      tenantMobileNumber: z
        .string()
        .trim()
        .regex(mobileNumberRegex, "Enter a valid Indian mobile number."),
      tenantEmail: z.string().trim().email("Enter a valid email address."),
      tenantPAN: optionalPanSchema,
      tenantAadhaarLast4: optionalAadhaarLast4Schema,
      numberOfOccupants: requiredNumber("Number of occupants").pipe(
        z
          .number()
          .int("Occupants must be a whole number.")
          .min(1, "At least one occupant is required."),
      ),
      purposeOfTenancy: z.enum([
        "residential",
        "workFromHome",
        "commercial",
      ]),
    }),
    financial: z
      .object({
        monthlyRentAmount: requiredNumber("Monthly rent amount").pipe(
          z.number().positive("Monthly rent must be greater than 0."),
        ),
        securityDepositAmount: requiredNumber("Security deposit amount").pipe(
          z.number().positive("Security deposit must be greater than 0."),
        ),
        rentDueDate: requiredString("Rent due date"),
        latePaymentPenalty: optionalTrimmedString,
        rentEscalationEnabled: z.boolean(),
        rentEscalationPercent: optionalNumber(),
        maintenanceCharges: optionalTrimmedString,
        whoPaysUtilities: optionalTrimmedString,
      })
      .superRefine((value, ctx) => {
        if (
          value.rentEscalationEnabled &&
          (!value.rentEscalationPercent || value.rentEscalationPercent <= 0)
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["rentEscalationPercent"],
            message: "Escalation percent must be greater than 0.",
          });
        }
      }),
    duration: z
      .object({
        startDate: requiredString("Start date"),
        durationInMonths: requiredNumber("Duration").pipe(
          z
            .number()
            .int("Duration must be a whole number.")
            .positive("Duration must be greater than 0."),
        ),
        endDate: requiredString("End date"),
        lockInPeriod: optionalNumber(),
        noticePeriod: z
          .preprocess(parseNumberInput, z.number().optional())
          .transform((value) => value ?? 1)
          .pipe(
            z
              .number()
              .int("Notice period must be a whole number.")
              .positive("Notice period must be greater than 0."),
          ),
      })
      .superRefine((value, ctx) => {
        const calculated = calculateAgreementEndDate(
          value.startDate,
          value.durationInMonths,
        );

        if (!calculated) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["endDate"],
            message: "End date could not be calculated.",
          });
          return;
        }

        if (calculated !== value.endDate) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["endDate"],
            message: "End date must match the calculated agreement term.",
          });
        }

        if (value.lockInPeriod && value.lockInPeriod > value.durationInMonths) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["lockInPeriod"],
            message: "Lock-in period cannot exceed the total duration.",
          });
        }
      }),
    specialConditions: z
      .string()
      .trim()
      .max(2000, "Special conditions must be 2000 characters or fewer."),
    aiClauses: z.array(clauseSchema).max(5, "A maximum of 5 AI clauses is allowed."),
    contact: z.object({
      contactName: requiredString("Primary contact name"),
      contactEmail: z.string().trim().email("Enter a valid email address."),
      contactPhone: z
        .string()
        .trim()
        .regex(mobileNumberRegex, "Enter a valid Indian mobile number."),
    }),
    language: z.enum(["en", "hi"]).default("en"),
});

export const agreementFormSchema = agreementFormBaseSchema;

export const clauseGenerationSchema = agreementFormBaseSchema
  .omit({ contact: true, aiClauses: true })
  .extend({
    contact: z
      .object({
        contactName: z.string().optional().or(z.literal("")),
        contactEmail: z.string().optional().or(z.literal("")),
        contactPhone: z.string().optional().or(z.literal("")),
      })
      .optional(),
  });

export const paymentInitiateSchema = z.object({
  formData: agreementFormSchema,
});

export const paymentVerifySchema = z.object({
  agreementId: z.string().uuid("Agreement ID must be a valid UUID."),
  stripeSessionId: requiredString("Stripe session ID"),
});

export const createPdfSchema = z.object({
  agreementId: z.string().uuid("Agreement ID must be a valid UUID."),
});

export type AgreementFormSchema = z.infer<typeof agreementFormSchema>;
export type ClauseGenerationSchema = z.infer<typeof clauseGenerationSchema>;
