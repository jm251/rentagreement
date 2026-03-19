import type { CSSProperties } from "react";

import { FURNISHING_OPTIONS, PROPERTY_TYPE_OPTIONS } from "@/data/constants";
import { formatAgreementDate } from "@/lib/date";
import { formatCurrencyInr, getOptionLabel } from "@/lib/utils";
import type { PreparedAgreement } from "@/types/agreement";

const pageStyle: CSSProperties = {
  background: "#fffdfa",
  color: "#201913",
  fontFamily: "Georgia, Cambria, 'Times New Roman', serif",
  border: "1px solid #e4d8ca",
  borderRadius: "20px",
  padding: "32px",
  lineHeight: 1.7,
  boxShadow: "0 18px 48px rgba(36, 55, 70, 0.08)",
};

const sectionTitleStyle: CSSProperties = {
  fontSize: "14px",
  fontWeight: 700,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: "#6a5948",
  marginBottom: "12px",
};

function Row({
  label,
  value,
}: {
  label: string;
  value: string | number | undefined | null;
}) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: "12px" }}>
      <div style={{ color: "#6a5948", fontWeight: 600 }}>{label}</div>
      <div>{value || "Not provided"}</div>
    </div>
  );
}

export function AgreementDocument({
  agreement,
}: {
  agreement: PreparedAgreement;
}) {
  const { formData } = agreement;
  const partiesLabel =
    formData.landlord.ownershipType === "jointOwners"
      ? `${formData.landlord.landlordFullName} and ${formData.landlord.jointOwnerNames.join(", ")}`
      : formData.landlord.landlordFullName;

  return (
    <article style={pageStyle}>
      <header style={{ textAlign: "center", marginBottom: "24px" }}>
        <p style={{ margin: 0, color: "#8d5f2d", fontWeight: 700 }}>Stamp paper / registration disclaimer</p>
        <p style={{ marginTop: "8px", color: "#6a5948", fontSize: "14px" }}>{agreement.disclaimer}</p>
        <h1 style={{ fontSize: "34px", marginTop: "20px", marginBottom: "8px", letterSpacing: "0.04em" }}>
          {agreement.heading}
        </h1>
        <p style={{ margin: 0, color: "#6a5948" }}>
          Agreement reference: {agreement.agreementNumber || agreement.agreementId || "Draft preview"}
        </p>
      </header>

      <section style={{ marginBottom: "24px" }}>
        <div style={sectionTitleStyle}>Parties</div>
        <div style={{ display: "grid", gap: "10px" }}>
          <Row label="Landlord" value={partiesLabel} />
          <Row label="Landlord Contact" value={`${formData.landlord.landlordMobileNumber} | ${formData.landlord.landlordEmail}`} />
          <Row label="Tenant" value={formData.tenant.tenantFullName} />
          <Row label="Tenant Contact" value={`${formData.tenant.tenantMobileNumber} | ${formData.tenant.tenantEmail}`} />
          <Row label="Usage" value={formData.usageType === "commercial" ? "Commercial" : "Residential"} />
        </div>
      </section>

      <section style={{ marginBottom: "24px" }}>
        <div style={sectionTitleStyle}>Property</div>
        <div style={{ display: "grid", gap: "10px" }}>
          <Row
            label="Address"
            value={[formData.property.propertyAddressLine1, formData.property.propertyAddressLine2, formData.property.city, `${formData.property.state} - ${formData.property.pincode}`]
              .filter(Boolean)
              .join(", ")}
          />
          <Row
            label="Property Type"
            value={getOptionLabel(formData.property.propertyType, PROPERTY_TYPE_OPTIONS)}
          />
          <Row
            label="Furnishing"
            value={getOptionLabel(formData.property.furnishingType, FURNISHING_OPTIONS)}
          />
          <Row
            label="Amenities"
            value={[
              formData.property.amenitiesIncluded.parking ? "Parking" : null,
              formData.property.amenitiesIncluded.water ? "Water" : null,
              formData.property.amenitiesIncluded.electricity ? "Electricity" : null,
              formData.property.amenitiesIncluded.gas ? "Gas" : null,
              formData.property.amenitiesIncluded.other || null,
            ]
              .filter(Boolean)
              .join(", ")}
          />
        </div>
      </section>

      <section style={{ marginBottom: "24px" }}>
        <div style={sectionTitleStyle}>Financial Terms</div>
        <div style={{ display: "grid", gap: "10px" }}>
          <Row label="Monthly Rent" value={formatCurrencyInr(formData.financial.monthlyRentAmount)} />
          <Row label="Security Deposit" value={formatCurrencyInr(formData.financial.securityDepositAmount)} />
          <Row label="Rent Due Date" value={formData.financial.rentDueDate} />
          <Row label="Late Payment Penalty" value={formData.financial.latePaymentPenalty || "Not specified"} />
          <Row
            label="Escalation"
            value={
              formData.financial.rentEscalationEnabled
                ? `${formData.financial.rentEscalationPercent}% per year`
                : "No annual escalation"
            }
          />
          <Row label="Maintenance Charges" value={formData.financial.maintenanceCharges || "Not specified"} />
          <Row label="Utilities" value={formData.financial.whoPaysUtilities || "As mutually agreed by the parties."} />
        </div>
      </section>

      <section style={{ marginBottom: "24px" }}>
        <div style={sectionTitleStyle}>Duration</div>
        <div style={{ display: "grid", gap: "10px" }}>
          <Row label="Start Date" value={formatAgreementDate(formData.duration.startDate)} />
          <Row label="End Date" value={formatAgreementDate(formData.duration.endDate)} />
          <Row label="Duration" value={`${formData.duration.durationInMonths} month(s)`} />
          <Row label="Lock-in Period" value={formData.duration.lockInPeriod ? `${formData.duration.lockInPeriod} month(s)` : "Not specified"} />
          <Row label="Notice Period" value={`${formData.duration.noticePeriod} month(s)`} />
        </div>
      </section>

      <section style={{ marginBottom: "24px" }}>
        <div style={sectionTitleStyle}>General Conditions</div>
        <ol style={{ margin: 0, paddingLeft: "18px", display: "grid", gap: "14px" }}>
          {agreement.hardcodedClauses.map((clause, index) => (
            <li key={clause.id}>
              <div style={{ fontWeight: 700, marginBottom: "4px" }}>
                {index + 1}. {clause.title}
              </div>
              <div>{clause.text}</div>
            </li>
          ))}
        </ol>
      </section>

      <section style={{ marginBottom: "24px" }}>
        <div style={sectionTitleStyle}>Special Clauses</div>
        {agreement.finalClauses.filter((clause) => clause.source === "ai").length > 0 ? (
          <ol style={{ margin: 0, paddingLeft: "18px", display: "grid", gap: "14px" }}>
            {agreement.finalClauses
              .filter((clause) => clause.source === "ai")
              .map((clause, index) => (
                <li key={clause.id}>
                  <div style={{ fontWeight: 700, marginBottom: "4px" }}>
                    {index + 1}. {clause.title}
                  </div>
                  <div>{clause.text}</div>
                </li>
              ))}
          </ol>
        ) : (
          <p style={{ margin: 0, color: "#6a5948" }}>
            No AI-generated special clauses were added for this agreement.
          </p>
        )}
      </section>

      <section style={{ marginBottom: "24px" }}>
        <div style={sectionTitleStyle}>Contact and Delivery</div>
        <div style={{ display: "grid", gap: "10px" }}>
          <Row label="Primary Contact" value={formData.contact.contactName} />
          <Row label="Email" value={formData.contact.contactEmail} />
          <Row label="Mobile" value={formData.contact.contactPhone} />
        </div>
      </section>

      <section>
        <div style={sectionTitleStyle}>Signature Block</div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: "24px",
            marginTop: "48px",
          }}
        >
          {["Landlord", "Tenant", "Witness 1", "Witness 2"].map((label) => (
            <div key={label}>
              <div style={{ borderBottom: "1px solid #201913", marginBottom: "8px", minHeight: "32px" }} />
              <div style={{ color: "#6a5948", fontSize: "14px" }}>{label}</div>
            </div>
          ))}
        </div>
      </section>
    </article>
  );
}
