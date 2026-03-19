import { NextResponse } from "next/server";

import { finalizeStripePaymentForAgreement } from "@/lib/payment";
import { getAgreementPreviewPath } from "@/lib/security";
import { paymentVerifySchema } from "@/lib/validators";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = paymentVerifySchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid payment verification payload.",
          details: parsed.error.flatten().formErrors.join(" "),
        },
        { status: 400 },
      );
    }

    const result = await finalizeStripePaymentForAgreement(
      parsed.data.agreementId,
      parsed.data.stripeSessionId,
    );

    return NextResponse.json({
      success: true,
      agreementId: result.agreement.id,
      agreementNumber: result.agreement.agreement_number,
      paymentId: result.paymentId,
      pdfUrl: result.pdfUrl,
      previewUrl: getAgreementPreviewPath(result.agreement.id),
      successUrl: `/success?agreementId=${result.agreement.id}&session_id=${encodeURIComponent(parsed.data.stripeSessionId)}`,
      emailSent: result.emailSent,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to verify payment.",
      },
      { status: 500 },
    );
  }
}
