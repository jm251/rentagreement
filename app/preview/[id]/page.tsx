import Link from "next/link";
import { notFound } from "next/navigation";

import { AgreementDocument } from "@/components/agreement/agreement-document";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createAgreementPdfSignedUrl, fetchAgreementById } from "@/lib/supabase/agreements";
import { mapRecordToPreparedAgreement } from "@/lib/agreement";

export const dynamic = "force-dynamic";

export default async function PreviewPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { token?: string };
}) {
  const agreement = await fetchAgreementById(params.id);

  if (!agreement || searchParams.token !== agreement.access_token) {
    notFound();
  }

  const preparedAgreement = mapRecordToPreparedAgreement(agreement);
  const pdfUrl = agreement.pdf_path
    ? await createAgreementPdfSignedUrl(agreement.pdf_path)
    : null;

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
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="outline">
            <Link href={`/success?agreementId=${agreement.id}&token=${agreement.access_token}`}>
              Success page
            </Link>
          </Button>
          {pdfUrl ? (
            <Button asChild>
              <a href={pdfUrl} target="_blank" rel="noreferrer">
                Download PDF
              </a>
            </Button>
          ) : null}
        </div>
      </div>
      <Card className="bg-transparent shadow-none">
        <AgreementDocument agreement={preparedAgreement} />
      </Card>
    </main>
  );
}
