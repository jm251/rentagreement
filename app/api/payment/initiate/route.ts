import { NextResponse } from "next/server";

import {
  buildAgreementNumber,
  buildPreparedAgreement,
  buildRecordPayload,
  createAgreementAccessToken,
} from "@/lib/agreement";
import { renderAgreementHtmlDocument } from "@/lib/render-agreement-html";
import { createStripeCheckoutSession } from "@/lib/stripe";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { paymentInitiateSchema } from "@/lib/validators";
import type { AgreementFormData } from "@/types/agreement";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const supabase = createSupabaseAdminClient();

  try {
    const json = await request.json();
    const parsed = paymentInitiateSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid payment initiation payload.",
          details: parsed.error.flatten().formErrors.join(" "),
        },
        { status: 400 },
      );
    }

    const formData = parsed.data.formData as AgreementFormData;
    const preparedAgreement = buildPreparedAgreement(formData);
    const accessToken = createAgreementAccessToken();

    const { data: createdAgreement, error: insertError } = await supabase
      .from("agreements")
      .insert({
        ...buildRecordPayload(formData),
        status: "draft",
        payment_provider: "stripe",
        agreement_number: null,
        stripe_checkout_session_id: null,
        stripe_payment_intent_id: null,
        stripe_payment_status: null,
        paid_at: null,
        pdf_path: null,
        pdf_url: null,
        email_sent_at: null,
        html_snapshot: renderAgreementHtmlDocument(preparedAgreement),
        access_token: accessToken,
      })
      .select("id")
      .single();

    if (insertError || !createdAgreement) {
      throw new Error(insertError?.message || "Unable to create agreement draft.");
    }

    const agreementId = createdAgreement.id as string;
    const agreementNumber = buildAgreementNumber(agreementId);

    const session = await createStripeCheckoutSession({
      agreementId,
      agreementNumber,
      accessToken,
      amountPaise: preparedAgreement.pricePaise,
      contactName: formData.contact.contactName,
      contactEmail: formData.contact.contactEmail,
    });

    const { error: updateError } = await supabase
      .from("agreements")
      .update({
        status: "payment_initiated",
        payment_provider: "stripe",
        agreement_number: agreementNumber,
        stripe_checkout_session_id: session.id,
        stripe_payment_status: session.payment_status,
      })
      .eq("id", agreementId);

    if (updateError) {
      throw new Error(updateError.message);
    }

    return NextResponse.json({
      agreementId,
      agreementNumber,
      amountPaise: preparedAgreement.pricePaise,
      sessionId: session.id,
      checkoutUrl: session.url,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to initiate payment.",
      },
      { status: 500 },
    );
  }
}
