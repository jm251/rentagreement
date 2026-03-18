import { Controller, type UseFormReturn } from "react-hook-form";

import { FormField } from "@/components/forms/form-field";
import { OptionGrid } from "@/components/forms/option-grid";
import { AGREEMENT_TYPE_OPTIONS, USAGE_TYPE_OPTIONS } from "@/data/constants";
import type { AgreementFormData } from "@/types/agreement";

export function AgreementTypeStep({
  form,
}: {
  form: UseFormReturn<AgreementFormData>;
}) {
  return (
    <div className="space-y-8">
      <Controller
        control={form.control}
        name="agreementType"
        render={({ field }) => (
          <FormField
            label="Agreement type"
            error={form.formState.errors.agreementType?.message}
          >
            <OptionGrid
              value={field.value}
              onChange={field.onChange}
              options={AGREEMENT_TYPE_OPTIONS}
              columns={3}
            />
          </FormField>
        )}
      />

      <Controller
        control={form.control}
        name="usageType"
        render={({ field }) => (
          <FormField
            label="Usage type"
            error={form.formState.errors.usageType?.message}
          >
            <OptionGrid
              value={field.value}
              onChange={field.onChange}
              options={USAGE_TYPE_OPTIONS}
            />
          </FormField>
        )}
      />
    </div>
  );
}
