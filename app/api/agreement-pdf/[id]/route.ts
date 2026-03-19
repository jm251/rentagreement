import { NextResponse, type NextRequest } from "next/server";

import { mapRecordToPreparedAgreement } from "@/lib/agreement";
import { renderPdfBufferFromHtml } from "@/lib/pdf";
import { renderAgreementHtmlDocument } from "@/lib/render-agreement-html";
import {
  downloadAgreementPdf,
  fetchAgreementById,
  uploadAgreementPdf,
} from "@/lib/supabase/agreements";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { verifyAgreementPreviewToken } from "@/lib/security";
import { toSafeDownloadFilename } from "@/lib/utils";

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const token = request.nextUrl.searchParams.get("token");
    const agreement = await fetchAgreementById(params.id);

    if (!agreement || !token || !verifyAgreementPreviewToken(token, params.id)) {
      return NextResponse.json({ error: "Agreement not found." }, { status: 404 });
    }

    let pdfBuffer: Buffer;

    if (agreement.pdf_path) {
      try {
        pdfBuffer = await downloadAgreementPdf(agreement.pdf_path);
      } catch {
        const preparedAgreement = mapRecordToPreparedAgreement(agreement);
        const htmlSnapshot =
          agreement.html_snapshot || renderAgreementHtmlDocument(preparedAgreement);
        pdfBuffer = await renderPdfBufferFromHtml(htmlSnapshot);

        if (agreement.status === "paid") {
          const storedPdf = await uploadAgreementPdf(agreement.id, pdfBuffer);
          const supabase = createSupabaseAdminClient();

          await supabase
            .from("agreements")
            .update({
              pdf_path: storedPdf.path,
              pdf_url: storedPdf.url,
              html_snapshot: htmlSnapshot,
            })
            .eq("id", agreement.id);
        }
      }
    } else {
      const preparedAgreement = mapRecordToPreparedAgreement(agreement);
      const htmlSnapshot =
        agreement.html_snapshot || renderAgreementHtmlDocument(preparedAgreement);
      pdfBuffer = await renderPdfBufferFromHtml(htmlSnapshot);

      if (agreement.status === "paid") {
        const storedPdf = await uploadAgreementPdf(agreement.id, pdfBuffer);
        const supabase = createSupabaseAdminClient();

        await supabase
          .from("agreements")
          .update({
            pdf_path: storedPdf.path,
            pdf_url: storedPdf.url,
            html_snapshot: htmlSnapshot,
          })
          .eq("id", agreement.id);
      }
    }

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${toSafeDownloadFilename(
          agreement.agreement_number || agreement.id,
          "pdf",
        )}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to download agreement PDF.",
      },
      { status: 500 },
    );
  }
}
