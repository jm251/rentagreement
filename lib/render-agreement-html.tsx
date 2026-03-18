import "server-only";

import { formatAgreementDate } from "@/lib/date";
import { formatCurrencyInr } from "@/lib/utils";
import type { PreparedAgreement } from "@/types/agreement";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function row(label: string, value: string) {
  return `
    <div class="row">
      <div class="label">${escapeHtml(label)}</div>
      <div class="value">${escapeHtml(value || "Not provided")}</div>
    </div>
  `;
}

function clauseList(items: Array<{ title: string; text: string }>) {
  return `
    <ol class="clause-list">
      ${items
        .map(
          (clause, index) => `
            <li>
              <div class="clause-title">${index + 1}. ${escapeHtml(clause.title)}</div>
              <div>${escapeHtml(clause.text)}</div>
            </li>
          `,
        )
        .join("")}
    </ol>
  `;
}

export function renderAgreementHtmlDocument(agreement: PreparedAgreement) {
  const { formData } = agreement;
  const aiClauses = agreement.finalClauses.filter((clause) => clause.source === "ai");
  const partiesLabel =
    formData.landlord.ownershipType === "jointOwners"
      ? `${formData.landlord.landlordFullName} and ${formData.landlord.jointOwnerNames.join(", ")}`
      : formData.landlord.landlordFullName;

  const amenities = [
    formData.property.amenitiesIncluded.parking ? "Parking" : null,
    formData.property.amenitiesIncluded.water ? "Water" : null,
    formData.property.amenitiesIncluded.electricity ? "Electricity" : null,
    formData.property.amenitiesIncluded.gas ? "Gas" : null,
    formData.property.amenitiesIncluded.other || null,
  ]
    .filter(Boolean)
    .join(", ");

  return `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>${escapeHtml(agreement.heading)}</title>
      <style>
        * { box-sizing: border-box; }
        body {
          margin: 0;
          padding: 24px;
          background: #f8f5ef;
          color: #201913;
          font-family: Georgia, Cambria, "Times New Roman", serif;
          line-height: 1.7;
        }
        article {
          background: #fffdfa;
          border: 1px solid #e4d8ca;
          border-radius: 20px;
          padding: 32px;
        }
        h1 {
          margin: 16px 0 8px;
          font-size: 34px;
          text-align: center;
          letter-spacing: 0.04em;
        }
        .subtle {
          color: #6a5948;
        }
        .center { text-align: center; }
        .section {
          margin-top: 24px;
        }
        .section-title {
          margin-bottom: 12px;
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #6a5948;
        }
        .row {
          display: grid;
          grid-template-columns: 180px 1fr;
          gap: 12px;
          margin-bottom: 10px;
        }
        .label {
          font-weight: 600;
          color: #6a5948;
        }
        .clause-list {
          margin: 0;
          padding-left: 20px;
        }
        .clause-list li {
          margin-bottom: 14px;
        }
        .clause-title {
          font-weight: 700;
          margin-bottom: 4px;
        }
        .signature-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 24px;
          margin-top: 48px;
        }
        .signature-line {
          border-bottom: 1px solid #201913;
          min-height: 32px;
          margin-bottom: 8px;
        }
      </style>
    </head>
    <body>
      <article>
        <div class="center">
          <p style="margin: 0; color: #8d5f2d; font-weight: 700;">Stamp paper / registration disclaimer</p>
          <p class="subtle" style="margin-top: 8px;">${escapeHtml(agreement.disclaimer)}</p>
          <h1>${escapeHtml(agreement.heading)}</h1>
          <p class="subtle" style="margin: 0;">Agreement reference: ${escapeHtml(
            agreement.agreementNumber || agreement.agreementId || "Draft preview",
          )}</p>
        </div>

        <section class="section">
          <div class="section-title">Parties</div>
          ${row("Landlord", partiesLabel)}
          ${row(
            "Landlord Contact",
            `${formData.landlord.landlordMobileNumber} | ${formData.landlord.landlordEmail}`,
          )}
          ${row("Tenant", formData.tenant.tenantFullName)}
          ${row(
            "Tenant Contact",
            `${formData.tenant.tenantMobileNumber} | ${formData.tenant.tenantEmail}`,
          )}
          ${row(
            "Usage",
            formData.usageType === "commercial" ? "Commercial" : "Residential",
          )}
        </section>

        <section class="section">
          <div class="section-title">Property</div>
          ${row(
            "Address",
            [
              formData.property.propertyAddressLine1,
              formData.property.propertyAddressLine2,
              formData.property.city,
              `${formData.property.state} - ${formData.property.pincode}`,
            ]
              .filter(Boolean)
              .join(", "),
          )}
          ${row("Property Type", formData.property.propertyType)}
          ${row("Furnishing", formData.property.furnishingType)}
          ${row("Amenities", amenities)}
        </section>

        <section class="section">
          <div class="section-title">Financial Terms</div>
          ${row("Monthly Rent", formatCurrencyInr(formData.financial.monthlyRentAmount))}
          ${row("Security Deposit", formatCurrencyInr(formData.financial.securityDepositAmount))}
          ${row("Rent Due Date", formData.financial.rentDueDate)}
          ${row("Late Payment Penalty", formData.financial.latePaymentPenalty || "Not specified")}
          ${row(
            "Escalation",
            formData.financial.rentEscalationEnabled
              ? `${formData.financial.rentEscalationPercent}% per year`
              : "No annual escalation",
          )}
          ${row("Maintenance Charges", formData.financial.maintenanceCharges || "Not specified")}
          ${row("Utilities", formData.financial.whoPaysUtilities || "As mutually agreed by the parties.")}
        </section>

        <section class="section">
          <div class="section-title">Duration</div>
          ${row("Start Date", formatAgreementDate(formData.duration.startDate))}
          ${row("End Date", formatAgreementDate(formData.duration.endDate))}
          ${row("Duration", `${formData.duration.durationInMonths} month(s)`)}
          ${row(
            "Lock-in Period",
            formData.duration.lockInPeriod
              ? `${formData.duration.lockInPeriod} month(s)`
              : "Not specified",
          )}
          ${row("Notice Period", `${formData.duration.noticePeriod} month(s)`)}
        </section>

        <section class="section">
          <div class="section-title">General Conditions</div>
          ${clauseList(agreement.hardcodedClauses)}
        </section>

        <section class="section">
          <div class="section-title">Special Clauses</div>
          ${
            aiClauses.length > 0
              ? clauseList(aiClauses)
              : '<p class="subtle">No AI-generated special clauses were added for this agreement.</p>'
          }
        </section>

        <section class="section">
          <div class="section-title">Contact and Delivery</div>
          ${row("Primary Contact", formData.contact.contactName)}
          ${row("Email", formData.contact.contactEmail)}
          ${row("Mobile", formData.contact.contactPhone)}
        </section>

        <section class="section">
          <div class="section-title">Signature Block</div>
          <div class="signature-grid">
            ${["Landlord", "Tenant", "Witness 1", "Witness 2"]
              .map(
                (label) => `
                  <div>
                    <div class="signature-line"></div>
                    <div class="subtle">${escapeHtml(label)}</div>
                  </div>
                `,
              )
              .join("")}
          </div>
        </section>
      </article>
    </body>
  </html>`;
}
