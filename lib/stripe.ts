import "server-only";

import Stripe from "stripe";

import { getEnv } from "@/lib/env";
import { buildAbsoluteUrl } from "@/lib/utils";

type CheckoutOptions = {
  agreementId: string;
  agreementNumber: string;
  amountPaise: number;
  contactName: string;
  contactEmail: string;
};

export function getStripeClient() {
  const secretKey = getEnv("STRIPE_SECRET_KEY");
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is not configured.");
  }

  return new Stripe(secretKey, {
    maxNetworkRetries: 1,
    timeout: 20_000,
  });
}

export async function createStripeCheckoutSession(options: CheckoutOptions) {
  const stripe = getStripeClient();

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    billing_address_collection: "auto",
    customer_email: options.contactEmail,
    client_reference_id: options.agreementId,
    success_url: buildAbsoluteUrl(
      `/success?agreementId=${options.agreementId}&session_id={CHECKOUT_SESSION_ID}`,
    ),
    cancel_url: buildAbsoluteUrl(`/generate?payment=cancelled`),
    metadata: {
      agreementId: options.agreementId,
      agreementNumber: options.agreementNumber,
      contactName: options.contactName,
      contactEmail: options.contactEmail,
    },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "inr",
          unit_amount: options.amountPaise,
          product_data: {
            name: "Rent Agreement PDF",
            description: `Agreement ${options.agreementNumber}`,
          },
        },
      },
    ],
  });

  if (!session.url) {
    throw new Error("Stripe checkout session URL was not returned.");
  }

  return session;
}

export async function retrieveStripeCheckoutSession(sessionId: string) {
  const stripe = getStripeClient();
  return stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["payment_intent"],
  });
}

export function verifyStripeWebhookEvent(payload: string, signature: string) {
  const stripe = getStripeClient();
  const webhookSecret = getEnv("STRIPE_WEBHOOK_SECRET");

  if (!webhookSecret) {
    throw new Error("STRIPE_WEBHOOK_SECRET is not configured.");
  }

  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}
