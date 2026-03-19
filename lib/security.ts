import "server-only";

import {
  createHash,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";

import { getEnv } from "@/lib/env";

const TOKEN_VERSION = 1;
const AGREEMENT_PREVIEW_TTL_SECONDS = 60 * 60 * 24 * 7;
const ADMIN_SESSION_TTL_SECONDS = 60 * 60 * 8;

type AgreementPreviewPayload = {
  agreementId: string;
  purpose: "preview";
  exp: number;
  v: number;
};

type AdminSessionPayload = {
  sub: "admin";
  purpose: "admin-session";
  exp: number;
  v: number;
};

function base64UrlEncode(value: Buffer | string) {
  const buffer = typeof value === "string" ? Buffer.from(value, "utf8") : value;
  return buffer
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function base64UrlDecode(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4 === 0 ? 0 : 4 - (normalized.length % 4);
  return Buffer.from(`${normalized}${"=".repeat(padding)}`, "base64");
}

function getSigningSecret(namespace: string) {
  const baseSecret =
    getEnv("SUPABASE_SERVICE_ROLE_KEY") ||
    getEnv("STRIPE_SECRET_KEY") ||
    getEnv("ADMIN_PASSWORD");

  if (!baseSecret) {
    throw new Error("Server signing secret is not configured.");
  }

  return createHash("sha256")
    .update(`${namespace}:${baseSecret}`)
    .digest();
}

function createSignature(encodedPayload: string, namespace: string) {
  return createHmac("sha256", getSigningSecret(namespace))
    .update(encodedPayload)
    .digest();
}

function createSignedToken<T extends Record<string, unknown>>(
  payload: T,
  namespace: string,
) {
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = base64UrlEncode(createSignature(encodedPayload, namespace));
  return `${encodedPayload}.${signature}`;
}

function verifySignedToken<T>(
  token: string,
  namespace: string,
  validatePayload: (payload: unknown) => payload is T,
) {
  const [encodedPayload, encodedSignature] = token.split(".");
  if (!encodedPayload || !encodedSignature) {
    return null;
  }

  const expectedSignature = createSignature(encodedPayload, namespace);
  let receivedSignature: Buffer;

  try {
    receivedSignature = base64UrlDecode(encodedSignature);
  } catch {
    return null;
  }

  if (expectedSignature.length !== receivedSignature.length) {
    return null;
  }

  if (!timingSafeEqual(expectedSignature, receivedSignature)) {
    return null;
  }

  let payload: unknown;
  try {
    payload = JSON.parse(base64UrlDecode(encodedPayload).toString("utf8"));
  } catch {
    return null;
  }

  if (!validatePayload(payload)) {
    return null;
  }

  return payload;
}

function isAgreementPreviewPayload(value: unknown): value is AgreementPreviewPayload {
  if (!value || typeof value !== "object") return false;
  const payload = value as Partial<AgreementPreviewPayload>;
  return (
    typeof payload.agreementId === "string" &&
    payload.purpose === "preview" &&
    typeof payload.exp === "number" &&
    payload.v === TOKEN_VERSION
  );
}

function isAdminSessionPayload(value: unknown): value is AdminSessionPayload {
  if (!value || typeof value !== "object") return false;
  const payload = value as Partial<AdminSessionPayload>;
  return (
    payload.sub === "admin" &&
    payload.purpose === "admin-session" &&
    typeof payload.exp === "number" &&
    payload.v === TOKEN_VERSION
  );
}

function isExpired(expiryEpochSeconds: number) {
  return expiryEpochSeconds <= Math.floor(Date.now() / 1000);
}

export function createAgreementPreviewToken(agreementId: string) {
  return createSignedToken<AgreementPreviewPayload>(
    {
      agreementId,
      purpose: "preview",
      exp: Math.floor(Date.now() / 1000) + AGREEMENT_PREVIEW_TTL_SECONDS,
      v: TOKEN_VERSION,
    },
    "agreement-preview",
  );
}

export function verifyAgreementPreviewToken(
  token: string,
  agreementId: string,
) {
  const payload = verifySignedToken<AgreementPreviewPayload>(
    token,
    "agreement-preview",
    isAgreementPreviewPayload,
  );

  if (!payload || payload.agreementId !== agreementId || isExpired(payload.exp)) {
    return null;
  }

  return payload;
}

export function createAdminSessionToken() {
  return createSignedToken<AdminSessionPayload>(
    {
      sub: "admin",
      purpose: "admin-session",
      exp: Math.floor(Date.now() / 1000) + ADMIN_SESSION_TTL_SECONDS,
      v: TOKEN_VERSION,
    },
    "admin-session",
  );
}

export function verifyAdminSessionToken(token: string) {
  const payload = verifySignedToken<AdminSessionPayload>(
    token,
    "admin-session",
    isAdminSessionPayload,
  );

  if (!payload || isExpired(payload.exp)) {
    return null;
  }

  return payload;
}

export function hashIdentifier(value: string) {
  return createHash("sha256")
    .update(`identifier:${value}`)
    .digest("hex");
}

export function secureCompare(value: string, expected: string) {
  const valueDigest = createHash("sha256").update(value).digest();
  const expectedDigest = createHash("sha256").update(expected).digest();
  return timingSafeEqual(valueDigest, expectedDigest);
}

export function createCompatibilityToken() {
  return randomBytes(24).toString("hex");
}

export function getAgreementPreviewPath(agreementId: string) {
  return getAgreementPreviewPathWithToken(
    agreementId,
    createAgreementPreviewToken(agreementId),
  );
}

export function getAdminSessionMaxAgeSeconds() {
  return ADMIN_SESSION_TTL_SECONDS;
}

export function getAgreementPreviewPathWithToken(
  agreementId: string,
  token: string,
) {
  return `/preview/${agreementId}?token=${encodeURIComponent(token)}`;
}

export function getAgreementPdfDownloadPath(
  agreementId: string,
  token: string,
) {
  return `/api/agreement-pdf/${agreementId}?token=${encodeURIComponent(token)}`;
}

export function getAgreementImageDownloadPath(
  agreementId: string,
  token: string,
) {
  return `/api/agreement-image/${agreementId}?token=${encodeURIComponent(token)}`;
}
