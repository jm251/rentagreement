import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDefaultPriceInr } from "@/lib/pricing";
import { formatCurrencyInr } from "@/lib/utils";
import type { AgreementFormData } from "@/types/agreement";

export function SummaryCard({ formData }: { formData: AgreementFormData }) {
  return (
    <Card className="sticky top-6">
      <CardHeader>
        <CardTitle>Live summary</CardTitle>
        <p className="text-sm text-muted-foreground">
          Your preview and payment amount update as you complete the wizard.
        </p>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div className="rounded-2xl bg-muted p-4">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Agreement
          </div>
          <div className="mt-2 font-semibold">
            {formData.agreementType === "leaveAndLicense"
              ? "Leave & License"
              : formData.agreementType === "monthlyRent"
                ? "Monthly Rent"
                : "Fixed Term Lease"}
          </div>
          <div className="text-muted-foreground">
            {formData.property.city || "City pending"},{" "}
            {formData.property.state || "State pending"}
          </div>
        </div>
        <div className="grid gap-2">
          <SummaryRow label="Landlord" value={formData.landlord.landlordFullName} />
          <SummaryRow label="Tenant" value={formData.tenant.tenantFullName} />
          <SummaryRow
            label="Rent"
            value={formatCurrencyInr(formData.financial.monthlyRentAmount || 0)}
          />
          <SummaryRow
            label="Deposit"
            value={formatCurrencyInr(formData.financial.securityDepositAmount || 0)}
          />
          <SummaryRow
            label="Term"
            value={
              formData.duration.durationInMonths
                ? `${formData.duration.durationInMonths} months`
                : "Pending"
            }
          />
        </div>
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Final price
          </div>
          <div className="mt-2 font-serif text-3xl font-semibold">
            {formatCurrencyInr(getDefaultPriceInr())}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SummaryRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value || "Pending"}</span>
    </div>
  );
}
