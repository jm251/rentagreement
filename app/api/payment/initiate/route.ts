import { NextResponse } from "next/server";

import {
  buildAgreementNumber,
  buildPreparedAgreement,
  buildRecordPayload,
  createLegacyAgreementAccessToken,
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
    const draftPayload = {
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
    };

    let insertResult = await supabase
      .from("agreements")
      .insert(draftPayload)
      .select("id")
      .single();

    if (
      insertResult.error?.message &&
      /null value in column \"access_token\"|violates not-null constraint.*access_token/i.test(
        insertResult.error.message,
      )
    ) {
      insertResult = await supabase
        .from("agreements")
        .insert({
          ...draftPayload,
          access_token: createLegacyAgreementAccessToken(),
        })
        .select("id")
        .single();
    }

    const { data: createdAgreement, error: insertError } = insertResult;

    if (insertError || !createdAgreement) {
      if (
        insertError?.message &&
        /public\.agreements|schema cache|relation .*agreements/i.test(insertError.message)
      ) {
        throw new Error(
          "Supabase agreements table is missing in the connected project. Run supabase/schema.sql and create the agreements storage bucket before retrying payment.",
        );
      }

      throw new Error(insertError?.message || "Unable to create agreement draft.");
    }

    const agreementId = createdAgreement.id as string;
    const agreementNumber = buildAgreementNumber(agreementId);

    const session = await createStripeCheckoutSession({
      agreementId,
      agreementNumber,
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
