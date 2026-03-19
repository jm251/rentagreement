import { APP_DISCLAIMER } from "@/data/constants";
import { calculateAgreementEndDate } from "@/lib/date";
import { getDefaultPriceInr, toPaise } from "@/lib/pricing";
import { getStateLawConfig } from "@/lib/state-law";
import type {
  AgreementFormData,
  AgreementRecord,
  PreparedAgreement,
} from "@/types/agreement";
import type { AgreementClause, ClauseInput } from "@/types/clause";

function clauseId(prefix: string) {
  const randomId =
    globalThis.crypto?.randomUUID?.() ??
    `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `${prefix}-${randomId}`;
}

function buildAgreementHeading(formData: AgreementFormData) {
  switch (formData.agreementType) {
    case "monthlyRent":
      return "MONTHLY RENT AGREEMENT";
    case "fixedTermLease":
      return "FIXED TERM LEASE AGREEMENT";
    default:
      return "LEAVE AND LICENSE AGREEMENT";
  }
}

function toClause(source: "ai" | "system", input: ClauseInput, locked = false) {
  return {
    id: clauseId(source),
    source,
    locked,
    title: input.title,
    text: input.text,
  } satisfies AgreementClause;
}

export function buildHardcodedClauses(formData: AgreementFormData) {
  const stateLaw = getStateLawConfig(formData.property.pincode, formData.property.state);
  const cityState = `${formData.property.city}, ${stateLaw.name}`;
  const noticePeriod = formData.duration.noticePeriod || 1;

  return [
    toClause(
      "system",
      {
        title: "Jurisdiction",
        text: `The courts and other competent authorities at ${cityState} shall have jurisdiction over matters arising out of or connected with this agreement, subject to the dispute-resolution mechanism below.`,
      },
      true,
    ),
    toClause(
      "system",
      {
        title: "Termination and Notice",
        text: `Either party may terminate this agreement by giving ${noticePeriod} month(s) written notice to the other party, subject to any lock-in obligations expressly recorded in this agreement.`,
      },
      true,
    ),
    toClause(
      "system",
      {
        title: "Maintenance Responsibilities",
        text: "The landlord shall remain responsible for structural repairs and title-related obligations. The tenant shall maintain the premises in a tenant-like manner, bear day-to-day consumable expenses, and promptly report material defects.",
      },
      true,
    ),
    toClause(
      "system",
      {
        title: "Subletting Restriction",
        text: "The tenant shall not assign, sublet, part with possession, or otherwise create any third-party rights in the premises without the prior written consent of the landlord.",
      },
      true,
    ),
    toClause(
      "system",
      {
        title: "Dispute Resolution",
        text: "The parties shall first attempt an amicable resolution in good faith. Failing such resolution, disputes shall be referred to arbitration in accordance with applicable Indian law before either party approaches a competent court.",
      },
      true,
    ),
    toClause(
      "system",
      {
        title: "Force Majeure",
        text: "No party shall be treated as being in breach to the extent performance is delayed or prevented by events beyond reasonable control, including natural calamities, governmental restrictions, utility failures, or other force majeure events.",
      },
      true,
    ),
    toClause(
      "system",
      {
        title: "Governing Law",
        text: stateLaw.governingLaw,
      },
      true,
    ),
  ];
}

export function normalizeAiClauses(aiClauses: ClauseInput[]) {
  return aiClauses
    .filter((clause) => clause.title.trim() && clause.text.trim())
    .map((clause) => toClause("ai", clause));
}

export function buildPreparedAgreement(
  formData: AgreementFormData,
  options?: {
    agreementId?: string;
    agreementNumber?: string | null;
    createdAt?: string | null;
    paidAt?: string | null;
  },
): PreparedAgreement {
  const stateLaw = getStateLawConfig(formData.property.pincode, formData.property.state);
  const normalizedForm = {
    ...formData,
    landlord: {
      ...formData.landlord,
      jointOwnerNames: formData.landlord.jointOwnerNames
        .map((item) => item.trim())
        .filter(Boolean),
    },
    property: {
      ...formData.property,
      state: stateLaw.name,
    },
    duration: {
      ...formData.duration,
      endDate:
        formData.duration.endDate ||
        calculateAgreementEndDate(
          formData.duration.startDate,
          formData.duration.durationInMonths,
        ),
    },
  };

  const hardcodedClauses = buildHardcodedClauses(normalizedForm);
  const aiClauses = normalizeAiClauses(normalizedForm.aiClauses);
  const priceInr = getDefaultPriceInr();

  return {
    agreementId: options?.agreementId,
    agreementNumber: options?.agreementNumber ?? null,
    heading: stateLaw.agreementHeading || buildAgreementHeading(normalizedForm),
    formData: normalizedForm,
    stateLaw,
    priceInr,
    pricePaise: toPaise(priceInr),
    hardcodedClauses,
    finalClauses: [...hardcodedClauses, ...aiClauses],
    disclaimer: APP_DISCLAIMER,
    createdAt: options?.createdAt ?? null,
    paidAt: options?.paidAt ?? null,
  };
}

export function buildAgreementNumber(id: string) {
  const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const suffix = id.replace(/-/g, "").slice(0, 6).toUpperCase();
  return `RAG-${stamp}-${suffix}`;
}

export function createLegacyAgreementAccessToken() {
  const randomId =
    globalThis.crypto?.randomUUID?.() ??
    `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return randomId.replace(/-/g, "");
}

export function buildRecordPayload(formData: AgreementFormData) {
  const prepared = buildPreparedAgreement(formData);

  return {
    agreement_type: formData.agreementType,
    usage_type: formData.usageType,
    language: formData.language,
    contact_name: formData.contact.contactName,
    contact_email: formData.contact.contactEmail,
    contact_phone: formData.contact.contactPhone,
    landlord_name: formData.landlord.landlordFullName,
    tenant_name: formData.tenant.tenantFullName,
    city: prepared.formData.property.city,
    state: prepared.stateLaw.name,
    pincode: prepared.formData.property.pincode,
    start_date: prepared.formData.duration.startDate,
    end_date: prepared.formData.duration.endDate,
    duration_months: prepared.formData.duration.durationInMonths,
    monthly_rent_amount: prepared.formData.financial.monthlyRentAmount,
    security_deposit_amount: prepared.formData.financial.securityDepositAmount,
    notice_period_months: prepared.formData.duration.noticePeriod,
    lock_in_period_months: prepared.formData.duration.lockInPeriod ?? null,
    price_inr: prepared.priceInr,
    payment_amount_paise: prepared.pricePaise,
    form_data: prepared.formData,
    ai_clauses: formData.aiClauses,
    hardcoded_clauses: prepared.hardcodedClauses,
    final_clauses: prepared.finalClauses,
  };
}

export function mapRecordToPreparedAgreement(record: AgreementRecord) {
  return buildPreparedAgreement(record.form_data, {
    agreementId: record.id,
    agreementNumber: record.agreement_number,
    createdAt: record.created_at,
    paidAt: record.paid_at,
  });
}
