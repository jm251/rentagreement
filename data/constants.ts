import type { AgreementFormData } from "@/types/agreement";

export const APP_DISCLAIMER =
  "This document is computer-generated from user inputs. Review it carefully before signing, stamping, notarization, or registration.";

export const AGREEMENT_TYPE_OPTIONS = [
  { value: "monthlyRent", label: "Monthly Rent" },
  { value: "leaveAndLicense", label: "Leave & License" },
  { value: "fixedTermLease", label: "Fixed Term Lease" },
] as const;

export const USAGE_TYPE_OPTIONS = [
  { value: "residential", label: "Residential" },
  { value: "commercial", label: "Commercial" },
] as const;

export const PROPERTY_TYPE_OPTIONS = [
  { value: "flat", label: "Flat" },
  { value: "villa", label: "Villa" },
  { value: "independentHouse", label: "Independent House" },
  { value: "shop", label: "Shop" },
  { value: "office", label: "Office" },
  { value: "other", label: "Other" },
] as const;

export const FURNISHING_OPTIONS = [
  { value: "furnished", label: "Furnished" },
  { value: "semiFurnished", label: "Semi-Furnished" },
  { value: "unfurnished", label: "Unfurnished" },
] as const;

export const OWNERSHIP_OPTIONS = [
  { value: "singleOwner", label: "Single Owner" },
  { value: "jointOwners", label: "Joint Owners" },
] as const;

export const TENANCY_PURPOSE_OPTIONS = [
  { value: "residential", label: "Residential" },
  { value: "workFromHome", label: "Work From Home" },
  { value: "commercial", label: "Commercial" },
] as const;

export const FORM_STEPS = [
  { id: 1, title: "Agreement Type", description: "Select the agreement category." },
  { id: 2, title: "Property", description: "Add the address, pincode, and amenities." },
  { id: 3, title: "Landlord", description: "Capture owner identity and contact details." },
  { id: 4, title: "Tenant", description: "Capture tenant identity and occupancy details." },
  { id: 5, title: "Financial Terms", description: "Set rent, deposit, escalation, and dues." },
  { id: 6, title: "Duration", description: "Define term, end date, and notice period." },
  { id: 7, title: "Special Clauses", description: "Generate and edit AI-assisted clauses." },
  { id: 8, title: "Preview & Pay", description: "Review the agreement and complete payment." },
] as const;

export const DEFAULT_FORM_VALUES: AgreementFormData = {
  agreementType: "leaveAndLicense",
  usageType: "residential",
  property: {
    propertyAddressLine1: "",
    propertyAddressLine2: "",
    city: "",
    pincode: "",
    state: "",
    propertyType: "flat",
    furnishingType: "semiFurnished",
    amenitiesIncluded: {
      parking: false,
      water: true,
      electricity: true,
      gas: false,
      other: "",
    },
  },
  landlord: {
    landlordFullName: "",
    landlordMobileNumber: "",
    landlordEmail: "",
    landlordPAN: "",
    landlordAadhaarLast4: "",
    landlordAddressSameAsProperty: true,
    landlordAddress: "",
    ownershipType: "singleOwner",
    jointOwnerNames: [],
  },
  tenant: {
    tenantFullName: "",
    tenantMobileNumber: "",
    tenantEmail: "",
    tenantPAN: "",
    tenantAadhaarLast4: "",
    numberOfOccupants: 1,
    purposeOfTenancy: "residential",
  },
  financial: {
    monthlyRentAmount: 25000,
    securityDepositAmount: 50000,
    rentDueDate: "5th of every month",
    latePaymentPenalty: "",
    rentEscalationEnabled: false,
    rentEscalationPercent: undefined,
    maintenanceCharges: "",
    whoPaysUtilities:
      "Electricity and gas to be paid by the tenant based on actual consumption.",
  },
  duration: {
    startDate: "",
    durationInMonths: 11,
    endDate: "",
    lockInPeriod: undefined,
    noticePeriod: 1,
  },
  specialConditions: "",
  aiClauses: [],
  contact: {
    contactName: "",
    contactEmail: "",
    contactPhone: "",
  },
  language: "en",
};
