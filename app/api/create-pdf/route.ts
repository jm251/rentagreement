import { NextResponse } from "next/server";

import { mapRecordToPreparedAgreement } from "@/lib/agreement";
import { renderPdfBufferFromHtml } from "@/lib/pdf";
import { renderAgreementHtmlDocument } from "@/lib/render-agreement-html";
import { fetchAgreementById, uploadAgreementPdf } from "@/lib/supabase/agreements";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createPdfSchema } from "@/lib/validators";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const supabase = createSupabaseAdminClient();

  try {
    const json = await request.json();
    const parsed = createPdfSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid PDF request payload.",
          details: parsed.error.flatten().formErrors.join(" "),
        },
        { status: 400 },
      );
    }

    const agreement = await fetchAgreementById(parsed.data.agreementId);
    if (!agreement) {
      return NextResponse.json(
        { error: "Agreement not found." },
        { status: 404 },
      );
    }

    if (agreement.status !== "paid") {
      return NextResponse.json(
        { error: "PDF generation is only allowed for paid agreements." },
        { status: 409 },
      );
    }

    const preparedAgreement = mapRecordToPreparedAgreement(agreement);
    const htmlSnapshot = agreement.html_snapshot || renderAgreementHtmlDocument(preparedAgreement);
    const pdfBuffer = await renderPdfBufferFromHtml(htmlSnapshot);
    const storedPdf = await uploadAgreementPdf(agreement.id, pdfBuffer);

    await supabase
      .from("agreements")
      .update({
        pdf_path: storedPdf.path,
        pdf_url: storedPdf.url,
        html_snapshot: htmlSnapshot,
      })
      .eq("id", agreement.id);

    return NextResponse.json({
      agreementId: agreement.id,
      pdfUrl: storedPdf.url,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to create PDF.",
      },
      { status: 500 },
    );
  }
}
