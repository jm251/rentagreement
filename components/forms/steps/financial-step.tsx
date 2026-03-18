import type { UseFormReturn } from "react-hook-form";

import { FormField } from "@/components/forms/form-field";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { parseNumberInput } from "@/lib/utils";
import type { AgreementFormData } from "@/types/agreement";

export function FinancialStep({
  form,
}: {
  form: UseFormReturn<AgreementFormData>;
}) {
  const escalationEnabled = form.watch("financial.rentEscalationEnabled");

  return (
    <div className="grid gap-6">
      <div className="grid gap-6 md:grid-cols-2">
        <FormField
          id="monthlyRentAmount"
          label="Monthly rent amount (INR)"
          error={form.formState.errors.financial?.monthlyRentAmount?.message}
        >
          <Input
            id="monthlyRentAmount"
            type="number"
            min={1}
            {...form.register("financial.monthlyRentAmount", {
              setValueAs: parseNumberInput,
            })}
          />
        </FormField>

        <FormField
          id="securityDepositAmount"
          label="Security deposit amount (INR)"
          error={form.formState.errors.financial?.securityDepositAmount?.message}
        >
          <Input
            id="securityDepositAmount"
            type="number"
            min={1}
            {...form.register("financial.securityDepositAmount", {
              setValueAs: parseNumberInput,
            })}
          />
        </FormField>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <FormField
          id="rentDueDate"
          label="Rent due date"
          error={form.formState.errors.financial?.rentDueDate?.message}
        >
          <Input
            id="rentDueDate"
            placeholder="5th of every month"
            {...form.register("financial.rentDueDate")}
          />
        </FormField>

        <FormField
          id="latePaymentPenalty"
          label="Late payment penalty"
          hint="Optional"
          error={form.formState.errors.financial?.latePaymentPenalty?.message}
        >
          <Input
            id="latePaymentPenalty"
            placeholder="₹500 after 5 days"
            {...form.register("financial.latePaymentPenalty")}
          />
        </FormField>
      </div>

      <div className="rounded-2xl border border-border bg-muted/40 p-4">
        <label className="flex items-center gap-3">
          <Checkbox {...form.register("financial.rentEscalationEnabled")} />
          <span className="font-medium">Enable annual rent escalation</span>
        </label>
        {escalationEnabled ? (
          <div className="mt-4 max-w-sm">
            <FormField
              id="rentEscalationPercent"
              label="Escalation percent"
              error={form.formState.errors.financial?.rentEscalationPercent?.message}
            >
              <Input
                id="rentEscalationPercent"
                type="number"
                min={1}
                step="0.5"
                {...form.register("financial.rentEscalationPercent", {
                  setValueAs: parseNumberInput,
                })}
              />
            </FormField>
          </div>
        ) : null}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <FormField
          id="maintenanceCharges"
          label="Maintenance charges"
          hint="Optional"
          error={form.formState.errors.financial?.maintenanceCharges?.message}
        >
          <Input
            id="maintenanceCharges"
            placeholder="Society maintenance paid by tenant"
            {...form.register("financial.maintenanceCharges")}
          />
        </FormField>

        <FormField
          id="whoPaysUtilities"
          label="Utilities"
          hint="Optional structured note"
          error={form.formState.errors.financial?.whoPaysUtilities?.message}
        >
          <Input
            id="whoPaysUtilities"
            placeholder="Water by landlord, electricity by tenant"
            {...form.register("financial.whoPaysUtilities")}
          />
        </FormField>
      </div>
    </div>
  );
}
