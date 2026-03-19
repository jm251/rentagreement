import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { sendAgreementReadyEmail } from "@/lib/email";
import { fetchAgreementById } from "@/lib/supabase/agreements";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { verifyAgreementPreviewToken } from "@/lib/security";

export const runtime = "nodejs";

const agreementEmailSchema = z.object({
  token: z.string().trim().min(1, "Token is required."),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const json = await request.json();
    const parsed = agreementEmailSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid email request." },
        { status: 400 },
      );
    }

    const agreement = await fetchAgreementById(params.id);

    if (
      !agreement ||
      !verifyAgreementPreviewToken(parsed.data.token, params.id)
    ) {
      return NextResponse.json({ error: "Agreement not found." }, { status: 404 });
    }

    if (agreement.status !== "paid") {
      return NextResponse.json(
        { error: "Email delivery is only available for paid agreements." },
        { status: 409 },
      );
    }

    const emailResult = await sendAgreementReadyEmail(agreement);

    if (!emailResult.sent) {
      return NextResponse.json(
        { error: emailResult.error || "Unable to send agreement email." },
        { status: 500 },
      );
    }

    const supabase = createSupabaseAdminClient();
    await supabase
      .from("agreements")
      .update({ email_sent_at: new Date().toISOString() })
      .eq("id", agreement.id);

    return NextResponse.json({
      sent: true,
      message: `Agreement email sent to ${agreement.contact_email}.`,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to send agreement email.",
      },
      { status: 500 },
    );
  }
}
