"use client";

import { useDeferredValue, useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type FieldPath, type Resolver } from "react-hook-form";
import { AlertCircle } from "lucide-react";

import { buildPreparedAgreement } from "@/lib/agreement";
import { calculateAgreementEndDate } from "@/lib/date";
import { getStateLawConfig } from "@/lib/state-law";
import { agreementFormSchema } from "@/lib/validators";
import { DEFAULT_FORM_VALUES, FORM_STEPS } from "@/data/constants";
import { AgreementTypeStep } from "@/components/forms/steps/agreement-type-step";
import { PropertyStep } from "@/components/forms/steps/property-step";
import { LandlordStep } from "@/components/forms/steps/landlord-step";
import { TenantStep } from "@/components/forms/steps/tenant-step";
import { FinancialStep } from "@/components/forms/steps/financial-step";
import { DurationStep } from "@/components/forms/steps/duration-step";
import { SpecialClausesStep } from "@/components/forms/steps/special-clauses-step";
import { PreviewPayStep } from "@/components/forms/steps/preview-pay-step";
import { SummaryCard } from "@/components/forms/summary-card";
import { Stepper } from "@/components/forms/stepper";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AgreementFormData } from "@/types/agreement";
import type {
  GenerateClausesResponse,
  PaymentInitiateResponse,
} from "@/types/api";

function getStepFields(
  step: number,
  values: AgreementFormData,
): FieldPath<AgreementFormData>[] {
  switch (step) {
    case 1:
      return ["agreementType", "usageType"];
    case 2:
      return [
        "property.propertyAddressLine1",
        "property.city",
        "property.pincode",
        "property.state",
        "property.propertyType",
        "property.furnishingType",
      ];
    case 3:
      return [
        "landlord.landlordFullName",
        "landlord.landlordMobileNumber",
        "landlord.landlordEmail",
        "landlord.landlordPAN",
        "landlord.landlordAadhaarLast4",
        "landlord.ownershipType",
        ...(values.landlord.landlordAddressSameAsProperty
          ? []
          : (["landlord.landlordAddress"] as FieldPath<AgreementFormData>[])),
        ...(values.landlord.ownershipType === "jointOwners"
          ? (["landlord.jointOwnerNames"] as FieldPath<AgreementFormData>[])
          : []),
      ];
    case 4:
      return [
        "tenant.tenantFullName",
        "tenant.tenantMobileNumber",
        "tenant.tenantEmail",
        "tenant.tenantPAN",
        "tenant.tenantAadhaarLast4",
        "tenant.numberOfOccupants",
        "tenant.purposeOfTenancy",
      ];
    case 5:
      return [
        "financial.monthlyRentAmount",
        "financial.securityDepositAmount",
        "financial.rentDueDate",
        ...(values.financial.rentEscalationEnabled
          ? (["financial.rentEscalationPercent"] as FieldPath<AgreementFormData>[])
          : []),
      ];
    case 6:
      return [
        "duration.startDate",
        "duration.durationInMonths",
        "duration.endDate",
        "duration.noticePeriod",
      ];
    case 7:
      return ["specialConditions", "aiClauses"];
    case 8:
      return ["contact.contactName", "contact.contactEmail", "contact.contactPhone"];
    default:
      return [];
  }
}

export function AgreementWizard() {
  const form = useForm<AgreementFormData>({
    resolver: zodResolver(agreementFormSchema) as unknown as Resolver<AgreementFormData>,
    mode: "onBlur",
    defaultValues: DEFAULT_FORM_VALUES,
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const liveValues = form.watch();
  const deferredValues = useDeferredValue(liveValues);
  const previewAgreement = buildPreparedAgreement(
    deferredValues as AgreementFormData,
  );

  const watchedPincode = form.watch("property.pincode");
  const watchedState = form.watch("property.state");
  const watchedStartDate = form.watch("duration.startDate");
  const watchedDurationInMonths = form.watch("duration.durationInMonths");

  useEffect(() => {
    if (watchedPincode.replace(/\D/g, "").length !== 6) return;
    const stateLaw = getStateLawConfig(watchedPincode, watchedState);
    if (stateLaw.name !== "Unknown" && stateLaw.name !== watchedState) {
      form.setValue("property.state", stateLaw.name, {
        shouldValidate: true,
      });
    }
  }, [form, watchedPincode, watchedState]);

  useEffect(() => {
    const endDate = calculateAgreementEndDate(
      watchedStartDate,
      Number(watchedDurationInMonths) || 0,
    );
    if (endDate && endDate !== form.getValues("duration.endDate")) {
      form.setValue("duration.endDate", endDate, { shouldValidate: true });
    }
  }, [form, watchedDurationInMonths, watchedStartDate]);

  async function goNext() {
    const valid = await form.trigger(getStepFields(currentStep, form.getValues()), {
      shouldFocus: true,
    });
    if (!valid) return;
    setCurrentStep((step) => Math.min(step + 1, FORM_STEPS.length));
  }

  function goBack() {
    setCurrentStep((step) => Math.max(step - 1, 1));
  }

  async function handleGenerateClauses() {
    const fieldsToValidate = [
      ...getStepFields(1, form.getValues()),
      ...getStepFields(2, form.getValues()),
      ...getStepFields(3, form.getValues()),
      ...getStepFields(4, form.getValues()),
      ...getStepFields(5, form.getValues()),
      ...getStepFields(6, form.getValues()),
      "specialConditions",
    ] as FieldPath<AgreementFormData>[];

    const valid = await form.trigger(fieldsToValidate, { shouldFocus: true });
    if (!valid) return;

    setIsGenerating(true);
    setGenerationError(null);

    try {
      const response = await fetch("/api/generate-clauses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form.getValues()),
      });

      const payload = (await response.json()) as GenerateClausesResponse & {
        error?: string;
        details?: string;
      };

      if (!response.ok) {
        throw new Error(
          [payload.error, payload.details].filter(Boolean).join(" ") ||
            "Unable to generate clauses right now.",
        );
      }

      form.setValue("aiClauses", payload.clauses, {
        shouldDirty: true,
        shouldValidate: true,
      });
    } catch (error) {
      setGenerationError(
        error instanceof Error
          ? error.message
          : "Unable to generate AI clauses right now.",
      );
    } finally {
      setIsGenerating(false);
    }
  }

  async function handlePayment() {
    const valid = await form.trigger(undefined, { shouldFocus: true });
    if (!valid) return;

    setPaymentError(null);
    setIsProcessingPayment(true);

    try {
      const initiateResponse = await fetch("/api/payment/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formData: form.getValues() }),
      });

      const initiatePayload = (await initiateResponse.json()) as
        | PaymentInitiateResponse
        | { error?: string };

      if (!initiateResponse.ok || !("checkoutUrl" in initiatePayload)) {
        throw new Error(
          "error" in initiatePayload && initiatePayload.error
            ? initiatePayload.error
            : "Unable to initiate payment.",
        );
      }

      window.location.assign(initiatePayload.checkoutUrl);
    } catch (error) {
      setPaymentError(
        error instanceof Error ? error.message : "Unable to start payment.",
      );
      setIsProcessingPayment(false);
    }
  }

  return (
    <div className="space-y-8">
      <Stepper currentStep={currentStep} />

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
        <Card>
          <CardHeader className="border-b border-border">
            <CardTitle>{FORM_STEPS[currentStep - 1].title}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {FORM_STEPS[currentStep - 1].description}
            </p>
          </CardHeader>
          <CardContent className="space-y-8 pt-6">
            {paymentError && currentStep !== 8 ? (
              <div className="flex items-start gap-3 rounded-2xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{paymentError}</span>
              </div>
            ) : null}

            {currentStep === 1 ? <AgreementTypeStep form={form} /> : null}
            {currentStep === 2 ? <PropertyStep form={form} /> : null}
            {currentStep === 3 ? <LandlordStep form={form} /> : null}
            {currentStep === 4 ? <TenantStep form={form} /> : null}
            {currentStep === 5 ? <FinancialStep form={form} /> : null}
            {currentStep === 6 ? <DurationStep form={form} /> : null}
            {currentStep === 7 ? (
              <SpecialClausesStep
                form={form}
                isGenerating={isGenerating}
                generationError={generationError}
                onGenerate={handleGenerateClauses}
              />
            ) : null}
            {currentStep === 8 ? (
              <PreviewPayStep
                form={form}
                agreement={previewAgreement}
                isProcessingPayment={isProcessingPayment}
                paymentError={paymentError}
                onPay={handlePayment}
              />
            ) : null}

            <div className="flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={goBack}
                disabled={currentStep === 1 || isProcessingPayment}
              >
                Back
              </Button>
              {currentStep < FORM_STEPS.length ? (
                <Button type="button" onClick={goNext}>
                  Continue
                </Button>
              ) : null}
            </div>
          </CardContent>
        </Card>

        <div className="hidden xl:block">
          <SummaryCard formData={deferredValues as AgreementFormData} />
        </div>
      </div>
    </div>
  );
}
