import { NextResponse, type NextRequest } from "next/server";

import { mapRecordToPreparedAgreement } from "@/lib/agreement";
import { renderImageBufferFromHtml } from "@/lib/pdf";
import { renderAgreementHtmlDocument } from "@/lib/render-agreement-html";
import { fetchAgreementById } from "@/lib/supabase/agreements";
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

    const preparedAgreement = mapRecordToPreparedAgreement(agreement);
    const htmlSnapshot =
      agreement.html_snapshot || renderAgreementHtmlDocument(preparedAgreement);
    const imageBuffer = await renderImageBufferFromHtml(htmlSnapshot);

    return new NextResponse(new Uint8Array(imageBuffer), {
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": `attachment; filename="${toSafeDownloadFilename(
          agreement.agreement_number || agreement.id,
          "png",
        )}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to download agreement image.",
      },
      { status: 500 },
    );
  }
}
