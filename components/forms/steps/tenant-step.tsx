import { Controller, type UseFormReturn } from "react-hook-form";

import { FormField } from "@/components/forms/form-field";
import { OptionGrid } from "@/components/forms/option-grid";
import { Input } from "@/components/ui/input";
import { TENANCY_PURPOSE_OPTIONS } from "@/data/constants";
import { parseNumberInput } from "@/lib/utils";
import type { AgreementFormData } from "@/types/agreement";

export function TenantStep({ form }: { form: UseFormReturn<AgreementFormData> }) {
  return (
    <div className="grid gap-6">
      <div className="grid gap-6 md:grid-cols-2">
        <FormField
          id="tenantFullName"
          label="Full name"
          error={form.formState.errors.tenant?.tenantFullName?.message}
        >
          <Input
            id="tenantFullName"
            placeholder="Tenant full name"
            {...form.register("tenant.tenantFullName")}
          />
        </FormField>

        <FormField
          id="tenantMobileNumber"
          label="Mobile number"
          error={form.formState.errors.tenant?.tenantMobileNumber?.message}
        >
          <Input
            id="tenantMobileNumber"
            placeholder="9876543210"
            inputMode="numeric"
            maxLength={10}
            {...form.register("tenant.tenantMobileNumber")}
          />
        </FormField>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <FormField
          id="tenantEmail"
          label="Email"
          error={form.formState.errors.tenant?.tenantEmail?.message}
        >
          <Input
            id="tenantEmail"
            type="email"
            placeholder="tenant@example.com"
            {...form.register("tenant.tenantEmail")}
          />
        </FormField>

        <FormField
          id="tenantPAN"
          label="PAN"
          hint="Optional"
          error={form.formState.errors.tenant?.tenantPAN?.message}
        >
          <Input id="tenantPAN" placeholder="ABCDE1234F" {...form.register("tenant.tenantPAN")} />
        </FormField>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <FormField
          id="tenantAadhaarLast4"
          label="Aadhaar last 4 digits"
          hint="Optional. Never store the full Aadhaar number."
          error={form.formState.errors.tenant?.tenantAadhaarLast4?.message}
        >
          <Input
            id="tenantAadhaarLast4"
            placeholder="1234"
            inputMode="numeric"
            maxLength={4}
            {...form.register("tenant.tenantAadhaarLast4")}
          />
        </FormField>

        <FormField
          id="numberOfOccupants"
          label="Number of occupants"
          error={form.formState.errors.tenant?.numberOfOccupants?.message}
        >
          <Input
            id="numberOfOccupants"
            type="number"
            min={1}
            {...form.register("tenant.numberOfOccupants", {
              setValueAs: parseNumberInput,
            })}
          />
        </FormField>
      </div>

      <Controller
        control={form.control}
        name="tenant.purposeOfTenancy"
        render={({ field }) => (
          <FormField
            label="Purpose of tenancy"
            error={form.formState.errors.tenant?.purposeOfTenancy?.message}
          >
            <OptionGrid
              value={field.value}
              onChange={field.onChange}
              options={TENANCY_PURPOSE_OPTIONS}
            />
          </FormField>
        )}
      />
    </div>
  );
}
