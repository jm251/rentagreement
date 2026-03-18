import { AlertCircle, Loader2, ShieldCheck } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";

import { AgreementDocument } from "@/components/agreement/agreement-document";
import { FormField } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { APP_DISCLAIMER } from "@/data/constants";
import { formatCurrencyInr } from "@/lib/utils";
import type { AgreementFormData, PreparedAgreement } from "@/types/agreement";

export function PreviewPayStep({
  form,
  agreement,
  isProcessingPayment,
  paymentError,
  onPay,
}: {
  form: UseFormReturn<AgreementFormData>;
  agreement: PreparedAgreement;
  isProcessingPayment: boolean;
  paymentError: string | null;
  onPay: () => Promise<void>;
}) {
  return (
    <div className="space-y-8">
      <div className="grid gap-6 rounded-3xl border border-border bg-white p-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-secondary">
            <ShieldCheck className="h-5 w-5" />
            <h3 className="font-semibold">Purchaser contact</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Use this contact for payment receipt, preview link, and PDF delivery.
          </p>
          <FormField
            id="contactName"
            label="Primary contact name"
            error={form.formState.errors.contact?.contactName?.message}
          >
            <Input id="contactName" {...form.register("contact.contactName")} />
          </FormField>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              id="contactEmail"
              label="Primary contact email"
              error={form.formState.errors.contact?.contactEmail?.message}
            >
              <Input
                id="contactEmail"
                type="email"
                {...form.register("contact.contactEmail")}
              />
            </FormField>
            <FormField
              id="contactPhone"
              label="Primary contact mobile"
              error={form.formState.errors.contact?.contactPhone?.message}
            >
              <Input
                id="contactPhone"
                inputMode="numeric"
                maxLength={10}
                {...form.register("contact.contactPhone")}
              />
            </FormField>
          </div>
        </div>
        <div className="rounded-3xl bg-secondary p-6 text-secondary-foreground">
          <div className="text-sm font-semibold uppercase tracking-[0.2em]">
            Final price
          </div>
          <div className="mt-3 font-serif text-4xl font-semibold">
            {formatCurrencyInr(agreement.priceInr)}
          </div>
          <p className="mt-3 text-sm text-secondary-foreground/80">
            Payment is collected through a hosted Stripe Checkout page using the Stripe test credentials currently configured.
          </p>
          {paymentError ? (
            <div className="mt-4 flex gap-2 rounded-2xl bg-white/10 p-3 text-sm">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{paymentError}</span>
            </div>
          ) : null}
          <Button
            type="button"
            variant="outline"
            className="mt-6 w-full border-white/40 bg-white text-secondary hover:bg-white/90"
            onClick={onPay}
            disabled={isProcessingPayment}
          >
            {isProcessingPayment ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Redirecting to checkout
              </>
            ) : (
              "Pay & Download PDF"
            )}
          </Button>
          <p className="mt-4 text-xs text-secondary-foreground/70">{APP_DISCLAIMER}</p>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-serif text-2xl font-semibold">Agreement preview</h3>
        <AgreementDocument agreement={agreement} />
      </div>
    </div>
  );
}
