import "server-only";

import { buildPreparedAgreement } from "@/lib/agreement";
import { sendAgreementReadyEmail } from "@/lib/email";
import { renderPdfBufferFromHtml } from "@/lib/pdf";
import { renderAgreementHtmlDocument } from "@/lib/render-agreement-html";
import { retrieveStripeCheckoutSession } from "@/lib/stripe";
import {
  createAgreementPdfSignedUrl,
  fetchAgreementById,
  uploadAgreementPdf,
} from "@/lib/supabase/agreements";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

function getPaymentIntentId(
  paymentIntent: string | { id: string } | null,
) {
  if (!paymentIntent) return null;
  return typeof paymentIntent === "string" ? paymentIntent : paymentIntent.id;
}

export async function finalizeStripePaymentForAgreement(
  agreementId: string,
  stripeSessionId: string,
) {
  const supabase = createSupabaseAdminClient();
  const agreement = await fetchAgreementById(agreementId);

  if (!agreement) {
    throw new Error("Agreement not found.");
  }

  const session = await retrieveStripeCheckoutSession(stripeSessionId);
  const sessionAgreementId =
    session.metadata?.agreementId || session.client_reference_id;

  if (sessionAgreementId !== agreement.id) {
    throw new Error("Stripe session does not match the agreement.");
  }

  if (session.payment_status !== "paid") {
    throw new Error("Stripe reports that payment has not completed.");
  }

  if (agreement.status === "paid" && agreement.pdf_path) {
    return {
      agreement,
      pdfUrl: await createAgreementPdfSignedUrl(agreement.pdf_path),
      emailSent: Boolean(agreement.email_sent_at),
      paymentId: agreement.stripe_payment_intent_id,
    };
  }

  const paidAt = session.created
    ? new Date(session.created * 1000).toISOString()
    : new Date().toISOString();
  const paymentIntentId = getPaymentIntentId(
    session.payment_intent as string | { id: string } | null,
  );

  const preparedAgreement = buildPreparedAgreement(agreement.form_data, {
    agreementId: agreement.id,
    agreementNumber: agreement.agreement_number,
    createdAt: agreement.created_at,
    paidAt,
  });
  const htmlSnapshot = renderAgreementHtmlDocument(preparedAgreement);
  const pdfBuffer = await renderPdfBufferFromHtml(htmlSnapshot);
  const storedPdf = await uploadAgreementPdf(agreement.id, pdfBuffer);

  const { error: updateError } = await supabase
    .from("agreements")
    .update({
      status: "paid",
      payment_provider: "stripe",
      paid_at: paidAt,
      stripe_checkout_session_id: session.id,
      stripe_payment_intent_id: paymentIntentId,
      stripe_payment_status: session.payment_status,
      pdf_path: storedPdf.path,
      pdf_url: storedPdf.url,
      html_snapshot: htmlSnapshot,
    })
    .eq("id", agreement.id);

  if (updateError) {
    throw new Error(updateError.message);
  }

  const updatedAgreement = await fetchAgreementById(agreement.id);
  if (!updatedAgreement) {
    throw new Error("Unable to reload updated agreement.");
  }

  let emailSent = Boolean(updatedAgreement.email_sent_at);
  if (!emailSent) {
    emailSent = await sendAgreementReadyEmail(updatedAgreement, storedPdf.url);
    if (emailSent) {
      await supabase
        .from("agreements")
        .update({ email_sent_at: new Date().toISOString() })
        .eq("id", updatedAgreement.id);
    }
  }

  const finalAgreement = await fetchAgreementById(agreement.id);

  return {
    agreement: finalAgreement ?? updatedAgreement,
    pdfUrl: storedPdf.url,
    emailSent,
    paymentId: paymentIntentId,
  };
}
