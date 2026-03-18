import { Controller, type UseFormReturn } from "react-hook-form";

import { FormField } from "@/components/forms/form-field";
import { OptionGrid } from "@/components/forms/option-grid";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { OWNERSHIP_OPTIONS } from "@/data/constants";
import type { AgreementFormData } from "@/types/agreement";

export function LandlordStep({ form }: { form: UseFormReturn<AgreementFormData> }) {
  const sameAsProperty = form.watch("landlord.landlordAddressSameAsProperty");
  const ownershipType = form.watch("landlord.ownershipType");
  const jointOwnerNames = form.watch("landlord.jointOwnerNames");

  function updateOwner(index: number, value: string) {
    const current = [...jointOwnerNames];
    current[index] = value;
    form.setValue("landlord.jointOwnerNames", current, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  function addOwner() {
    form.setValue("landlord.jointOwnerNames", [...jointOwnerNames, ""], {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  function removeOwner(index: number) {
    form.setValue(
      "landlord.jointOwnerNames",
      jointOwnerNames.filter((_, itemIndex) => itemIndex !== index),
      {
        shouldDirty: true,
        shouldValidate: true,
      },
    );
  }

  return (
    <div className="grid gap-6">
      <div className="grid gap-6 md:grid-cols-2">
        <FormField
          id="landlordFullName"
          label="Full name"
          error={form.formState.errors.landlord?.landlordFullName?.message}
        >
          <Input
            id="landlordFullName"
            placeholder="Landlord full name"
            {...form.register("landlord.landlordFullName")}
          />
        </FormField>

        <FormField
          id="landlordMobileNumber"
          label="Mobile number"
          error={form.formState.errors.landlord?.landlordMobileNumber?.message}
        >
          <Input
            id="landlordMobileNumber"
            placeholder="9876543210"
            inputMode="numeric"
            maxLength={10}
            {...form.register("landlord.landlordMobileNumber")}
          />
        </FormField>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <FormField
          id="landlordEmail"
          label="Email"
          error={form.formState.errors.landlord?.landlordEmail?.message}
        >
          <Input
            id="landlordEmail"
            type="email"
            placeholder="owner@example.com"
            {...form.register("landlord.landlordEmail")}
          />
        </FormField>

        <FormField
          id="landlordPAN"
          label="PAN"
          hint="Optional"
          error={form.formState.errors.landlord?.landlordPAN?.message}
        >
          <Input id="landlordPAN" placeholder="ABCDE1234F" {...form.register("landlord.landlordPAN")} />
        </FormField>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <FormField
          id="landlordAadhaarLast4"
          label="Aadhaar last 4 digits"
          hint="Optional. Never store the full Aadhaar number."
          error={form.formState.errors.landlord?.landlordAadhaarLast4?.message}
        >
          <Input
            id="landlordAadhaarLast4"
            placeholder="1234"
            inputMode="numeric"
            maxLength={4}
            {...form.register("landlord.landlordAadhaarLast4")}
          />
        </FormField>

        <div className="space-y-2">
          <span className="block text-sm font-medium text-foreground">
            Address handling
          </span>
          <label className="flex items-center gap-3 rounded-2xl border border-border bg-white px-4 py-3">
            <Checkbox {...form.register("landlord.landlordAddressSameAsProperty")} />
            <span className="text-sm">Landlord address is the same as the property</span>
          </label>
        </div>
      </div>

      {!sameAsProperty ? (
        <FormField
          id="landlordAddress"
          label="Landlord address"
          error={form.formState.errors.landlord?.landlordAddress?.message}
        >
          <Input
            id="landlordAddress"
            placeholder="Landlord address"
            {...form.register("landlord.landlordAddress")}
          />
        </FormField>
      ) : null}

      <Controller
        control={form.control}
        name="landlord.ownershipType"
        render={({ field }) => (
          <FormField
            label="Ownership type"
            error={form.formState.errors.landlord?.ownershipType?.message}
          >
            <OptionGrid
              value={field.value}
              onChange={field.onChange}
              options={OWNERSHIP_OPTIONS}
            />
          </FormField>
        )}
      />

      {ownershipType === "jointOwners" ? (
        <div className="space-y-4 rounded-2xl border border-border bg-muted/40 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Joint owner names</h3>
              <p className="text-sm text-muted-foreground">
                Add the additional owners who should appear in the agreement.
              </p>
            </div>
            <Button type="button" variant="outline" onClick={addOwner}>
              Add owner
            </Button>
          </div>
          {jointOwnerNames.map((name, index) => (
            <div key={`${index}-${name}`} className="flex gap-3">
              <Input
                placeholder={`Joint owner ${index + 1}`}
                value={name}
                onChange={(event) => updateOwner(index, event.target.value)}
              />
              <Button
                type="button"
                variant="ghost"
                onClick={() => removeOwner(index)}
              >
                Remove
              </Button>
            </div>
          ))}
          {form.formState.errors.landlord?.jointOwnerNames?.message ? (
            <p className="text-sm text-destructive">
              {form.formState.errors.landlord.jointOwnerNames.message}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
