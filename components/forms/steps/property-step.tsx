import { Controller, type UseFormReturn } from "react-hook-form";

import { FormField } from "@/components/forms/form-field";
import { OptionGrid } from "@/components/forms/option-grid";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { AMENITY_OPTIONS } from "@/data/amenities";
import {
  FURNISHING_OPTIONS,
  PROPERTY_TYPE_OPTIONS,
} from "@/data/constants";
import type { AgreementFormData } from "@/types/agreement";

export function PropertyStep({ form }: { form: UseFormReturn<AgreementFormData> }) {
  return (
    <div className="grid gap-6">
      <FormField
        id="propertyAddressLine1"
        label="Property address line 1"
        error={form.formState.errors.property?.propertyAddressLine1?.message}
      >
        <Input
          id="propertyAddressLine1"
          placeholder="Flat / building / street"
          {...form.register("property.propertyAddressLine1")}
        />
      </FormField>

      <FormField
        id="propertyAddressLine2"
        label="Property address line 2"
        hint="Optional"
        error={form.formState.errors.property?.propertyAddressLine2?.message}
      >
        <Input
          id="propertyAddressLine2"
          placeholder="Area / landmark"
          {...form.register("property.propertyAddressLine2")}
        />
      </FormField>

      <div className="grid gap-6 md:grid-cols-3">
        <FormField
          id="city"
          label="City"
          error={form.formState.errors.property?.city?.message}
        >
          <Input
            id="city"
            placeholder="Enter city"
            {...form.register("property.city")}
          />
        </FormField>

        <FormField
          id="pincode"
          label="Pincode"
          error={form.formState.errors.property?.pincode?.message}
        >
          <Input
            id="pincode"
            placeholder="Enter 6-digit pincode"
            inputMode="numeric"
            maxLength={6}
            {...form.register("property.pincode")}
          />
        </FormField>

        <FormField
          id="state"
          label="Detected state"
          error={form.formState.errors.property?.state?.message}
          hint="Auto-detected from pincode. You can still correct it if needed."
        >
          <Input
            id="state"
            placeholder="Auto-detected from pincode"
            {...form.register("property.state")}
          />
        </FormField>
      </div>

      <Controller
        control={form.control}
        name="property.propertyType"
        render={({ field }) => (
          <FormField
            label="Property type"
            error={form.formState.errors.property?.propertyType?.message}
          >
            <OptionGrid
              value={field.value}
              onChange={field.onChange}
              options={PROPERTY_TYPE_OPTIONS}
              columns={3}
            />
          </FormField>
        )}
      />

      <Controller
        control={form.control}
        name="property.furnishingType"
        render={({ field }) => (
          <FormField
            label="Furnishing"
            error={form.formState.errors.property?.furnishingType?.message}
          >
            <OptionGrid
              value={field.value}
              onChange={field.onChange}
              options={FURNISHING_OPTIONS}
              columns={3}
            />
          </FormField>
        )}
      />

      <div className="grid gap-4">
        <div>
          <h3 className="text-sm font-medium">Amenities included</h3>
          <p className="text-sm text-muted-foreground">
            These appear in the property and maintenance sections of the agreement.
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {AMENITY_OPTIONS.map((option) => (
            <label
              key={option.value}
              className="flex items-center gap-3 rounded-2xl border border-border bg-white px-4 py-3"
            >
              <Checkbox {...form.register(`property.amenitiesIncluded.${option.value}`)} />
              <span className="text-sm font-medium">{option.label}</span>
            </label>
          ))}
        </div>
        <FormField
          id="amenitiesOther"
          label="Other amenities"
          hint="Optional"
          error={form.formState.errors.property?.amenitiesIncluded?.other?.message}
        >
          <Input
            id="amenitiesOther"
            placeholder="Clubhouse, security, lift access"
            {...form.register("property.amenitiesIncluded.other")}
          />
        </FormField>
      </div>
    </div>
  );
}
