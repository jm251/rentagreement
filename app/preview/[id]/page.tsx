import { notFound } from "next/navigation";

import { AgreementActionBar } from "@/components/agreement/agreement-action-bar";
import { AgreementDocument } from "@/components/agreement/agreement-document";
import { Card } from "@/components/ui/card";
import { fetchAgreementById } from "@/lib/supabase/agreements";
import { mapRecordToPreparedAgreement } from "@/lib/agreement";
import {
  getAgreementImageDownloadPath,
  getAgreementPdfDownloadPath,
  verifyAgreementPreviewToken,
} from "@/lib/security";

export const dynamic = "force-dynamic";

export default async function PreviewPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { token?: string };
}) {
  const agreement = await fetchAgreementById(params.id);

  if (
    !agreement ||
    !searchParams.token ||
    !verifyAgreementPreviewToken(searchParams.token, params.id)
  ) {
    notFound();
  }

  const preparedAgreement = mapRecordToPreparedAgreement(agreement);
  const pdfDownloadUrl = getAgreementPdfDownloadPath(agreement.id, searchParams.token);
  const imageDownloadUrl = getAgreementImageDownloadPath(
    agreement.id,
    searchParams.token,
  );

  return (
    <main className="mx-auto max-w-5xl px-6 py-10 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
            Agreement preview
          </p>
          <h1 className="font-serif text-3xl font-semibold">
            {agreement.agreement_number || agreement.id}
          </h1>
        </div>
      </div>
      <Card className="bg-transparent shadow-none">
        <AgreementDocument agreement={preparedAgreement} />
      </Card>
      <div className="mt-8">
        <AgreementActionBar
          agreementId={agreement.id}
          token={searchParams.token}
          pdfDownloadUrl={pdfDownloadUrl}
          imageDownloadUrl={imageDownloadUrl}
          contactEmail={agreement.contact_email}
          initialEmailSent={Boolean(agreement.email_sent_at)}
        />
      </div>
    </main>
  );
}
