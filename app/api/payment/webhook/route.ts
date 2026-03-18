import { NextResponse } from "next/server";

import { finalizeStripePaymentForAgreement } from "@/lib/payment";
import { verifyStripeWebhookEvent } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const signature = request.headers.get("stripe-signature");
    if (!signature) {
      return NextResponse.json({ error: "Missing Stripe signature." }, { status: 400 });
    }

    const payload = await request.text();
    const event = verifyStripeWebhookEvent(payload, signature);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const agreementId =
        session.metadata?.agreementId || session.client_reference_id;

      if (agreementId && session.id) {
        await finalizeStripePaymentForAgreement(agreementId, session.id);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to process Stripe webhook.",
      },
      { status: 400 },
    );
  }
}
