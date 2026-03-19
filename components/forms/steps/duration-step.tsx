import { Controller, type UseFormReturn } from "react-hook-form";

import { FormField } from "@/components/forms/form-field";
import { Input } from "@/components/ui/input";
import { parseNumberInput } from "@/lib/utils";
import type { AgreementFormData } from "@/types/agreement";

export function DurationStep({ form }: { form: UseFormReturn<AgreementFormData> }) {
  const calculatedEndDate = form.watch("duration.endDate");

  return (
    <div className="grid gap-6">
      <div className="grid gap-6 md:grid-cols-3">
        <FormField
          id="startDate"
          label="Start date"
          error={form.formState.errors.duration?.startDate?.message}
        >
          <Input
            id="startDate"
            type="date"
            {...form.register("duration.startDate")}
          />
        </FormField>

        <FormField
          id="durationInMonths"
          label="Duration in months"
          error={form.formState.errors.duration?.durationInMonths?.message}
        >
          <Input
            id="durationInMonths"
            type="number"
            min={1}
            {...form.register("duration.durationInMonths", {
              setValueAs: parseNumberInput,
            })}
          />
        </FormField>

        <FormField
          id="endDate"
          label="Calculated end date"
          error={form.formState.errors.duration?.endDate?.message}
          hint="Calculated as start date + duration months - 1 day."
        >
          <Controller
            control={form.control}
            name="duration.endDate"
            render={({ field }) => (
              <Input
                id="endDate"
                type="date"
                readOnly
                name={field.name}
                ref={field.ref}
                value={calculatedEndDate || ""}
                onChange={field.onChange}
                onBlur={field.onBlur}
              />
            )}
          />
        </FormField>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <FormField
          id="lockInPeriod"
          label="Lock-in period (months)"
          hint="Optional"
          error={form.formState.errors.duration?.lockInPeriod?.message}
        >
          <Input
            id="lockInPeriod"
            type="number"
            min={0}
            {...form.register("duration.lockInPeriod", {
              setValueAs: parseNumberInput,
            })}
          />
        </FormField>

        <FormField
          id="noticePeriod"
          label="Notice period (months)"
          error={form.formState.errors.duration?.noticePeriod?.message}
        >
          <Input
            id="noticePeriod"
            type="number"
            min={1}
            {...form.register("duration.noticePeriod", {
              setValueAs: parseNumberInput,
            })}
          />
        </FormField>
      </div>
    </div>
  );
}
