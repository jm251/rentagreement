import Link from "next/link";
import { notFound } from "next/navigation";

import { AgreementActionBar } from "@/components/agreement/agreement-action-bar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getEnvFlag } from "@/lib/env";
import { finalizeStripePaymentForAgreement } from "@/lib/payment";
import { fetchAgreementById } from "@/lib/supabase/agreements";
import {
  createAgreementPreviewToken,
  getAgreementImageDownloadPath,
  getAgreementPdfDownloadPath,
  getAgreementPreviewPathWithToken,
} from "@/lib/security";
import { buildAbsoluteUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: { agreementId?: string; session_id?: string };
}) {
  if (!searchParams.agreementId || !searchParams.session_id) {
    notFound();
  }

  const existingAgreement = await fetchAgreementById(searchParams.agreementId);
  if (!existingAgreement) {
    notFound();
  }

  const result = await finalizeStripePaymentForAgreement(
    existingAgreement.id,
    searchParams.session_id,
  );
  const agreement = result.agreement;

  const previewToken = createAgreementPreviewToken(agreement.id);
  const previewUrl = getAgreementPreviewPathWithToken(agreement.id, previewToken);
  const pdfDownloadUrl = getAgreementPdfDownloadPath(agreement.id, previewToken);
  const imageDownloadUrl = getAgreementImageDownloadPath(agreement.id, previewToken);
  const previewAbsoluteUrl = buildAbsoluteUrl(previewUrl);
  const pdfAbsoluteUrl = buildAbsoluteUrl(pdfDownloadUrl);
  const whatsappShare =
    getEnvFlag("NEXT_PUBLIC_ENABLE_WHATSAPP_SHARE", true)
      ? `https://wa.me/?text=${encodeURIComponent(
          `Your agreement is ready. Preview: ${previewAbsoluteUrl} | PDF: ${pdfAbsoluteUrl}`,
        )}`
      : null;

  return (
    <main className="mx-auto max-w-4xl px-6 py-12 lg:px-8">
      <Card>
        <CardHeader>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
            Payment success
          </p>
          <CardTitle className="mt-3">
            Agreement {agreement.agreement_number || agreement.id} is ready.
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <SummaryItem label="Status" value={agreement.status} />
            <SummaryItem label="Payment ID" value={agreement.stripe_payment_intent_id || "Pending"} />
            <SummaryItem
              label="Email sent"
              value={result.emailSent ? "Yes" : "Not sent yet"}
            />
            <SummaryItem label="Contact email" value={agreement.contact_email} />
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href={previewUrl}>Preview agreement</Link>
            </Button>
            {whatsappShare ? (
              <Button asChild variant="outline">
                <a href={whatsappShare} target="_blank" rel="noreferrer">
                  Share on WhatsApp
                </a>
              </Button>
            ) : null}
          </div>
          <AgreementActionBar
            agreementId={agreement.id}
            token={previewToken}
            pdfDownloadUrl={pdfDownloadUrl}
            imageDownloadUrl={imageDownloadUrl}
            contactEmail={agreement.contact_email}
            initialEmailSent={result.emailSent}
          />
        </CardContent>
      </Card>
    </main>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-muted/40 p-4">
      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-2 font-medium">{value}</div>
    </div>
  );
}
