import type { ClauseInput, AgreementClause } from "@/types/clause";

export type AgreementType =
  | "monthlyRent"
  | "leaveAndLicense"
  | "fixedTermLease";
export type UsageType = "residential" | "commercial";
export type PropertyType =
  | "flat"
  | "villa"
  | "independentHouse"
  | "shop"
  | "office"
  | "other";
export type FurnishingType = "furnished" | "semiFurnished" | "unfurnished";
export type OwnershipType = "singleOwner" | "jointOwners";
export type PurposeOfTenancy =
  | "residential"
  | "workFromHome"
  | "commercial";
export type AgreementLanguage = "en" | "hi";
export type AgreementStatus =
  | "draft"
  | "payment_initiated"
  | "paid"
  | "payment_failed";

export interface AmenitiesIncluded {
  parking: boolean;
  water: boolean;
  electricity: boolean;
  gas: boolean;
  other?: string;
}

export interface PropertyDetails {
  propertyAddressLine1: string;
  propertyAddressLine2?: string;
  city: string;
  pincode: string;
  state: string;
  propertyType: PropertyType;
  furnishingType: FurnishingType;
  amenitiesIncluded: AmenitiesIncluded;
}

export interface LandlordDetails {
  landlordFullName: string;
  landlordMobileNumber: string;
  landlordEmail: string;
  landlordPAN?: string;
  landlordAadhaarLast4?: string;
  landlordAddressSameAsProperty: boolean;
  landlordAddress?: string;
  ownershipType: OwnershipType;
  jointOwnerNames: string[];
}

export interface TenantDetails {
  tenantFullName: string;
  tenantMobileNumber: string;
  tenantEmail: string;
  tenantPAN?: string;
  tenantAadhaarLast4?: string;
  numberOfOccupants: number;
  purposeOfTenancy: PurposeOfTenancy;
}

export interface FinancialTerms {
  monthlyRentAmount: number;
  securityDepositAmount: number;
  rentDueDate: string;
  latePaymentPenalty?: string;
  rentEscalationEnabled: boolean;
  rentEscalationPercent?: number;
  maintenanceCharges?: string;
  whoPaysUtilities?: string;
}

export interface AgreementDuration {
  startDate: string;
  durationInMonths: number;
  endDate: string;
  lockInPeriod?: number;
  noticePeriod: number;
}

export interface PrimaryContact {
  contactName: string;
  contactEmail: string;
  contactPhone: string;
}

export interface AgreementFormData {
  agreementType: AgreementType;
  usageType: UsageType;
  property: PropertyDetails;
  landlord: LandlordDetails;
  tenant: TenantDetails;
  financial: FinancialTerms;
  duration: AgreementDuration;
  specialConditions: string;
  aiClauses: ClauseInput[];
  contact: PrimaryContact;
  language: AgreementLanguage;
}

export interface StateLawConfig {
  code: string;
  name: string;
  governingLaw: string;
  agreementHeading?: string;
}

export interface PreparedAgreement {
  agreementId?: string;
  agreementNumber?: string | null;
  heading: string;
  formData: AgreementFormData;
  stateLaw: StateLawConfig;
  priceInr: number;
  pricePaise: number;
  hardcodedClauses: AgreementClause[];
  finalClauses: AgreementClause[];
  disclaimer: string;
  createdAt?: string | null;
  paidAt?: string | null;
}

export interface AgreementRecord {
  id: string;
  created_at: string;
  updated_at: string;
  status: AgreementStatus;
  agreement_number: string | null;
  agreement_type: AgreementType;
  usage_type: UsageType;
  language: AgreementLanguage;
  contact_name: string | null;
  contact_email: string;
  contact_phone: string;
  landlord_name: string;
  tenant_name: string;
  city: string;
  state: string;
  pincode: string;
  start_date: string;
  end_date: string;
  duration_months: number;
  monthly_rent_amount: number;
  security_deposit_amount: number;
  notice_period_months: number;
  lock_in_period_months: number | null;
  price_inr: number;
  payment_amount_paise: number;
  payment_provider: string;
  stripe_checkout_session_id: string | null;
  stripe_payment_intent_id: string | null;
  stripe_payment_status: string | null;
  paid_at: string | null;
  pdf_path: string | null;
  pdf_url: string | null;
  email_sent_at: string | null;
  access_token: string;
  form_data: AgreementFormData;
  ai_clauses: ClauseInput[];
  hardcoded_clauses: AgreementClause[];
  final_clauses: AgreementClause[];
  html_snapshot: string | null;
}
