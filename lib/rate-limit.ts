import "server-only";

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { hashIdentifier } from "@/lib/security";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type ConsumeRateLimitRow = {
  allowed: boolean;
  remaining: number;
  retry_after_seconds: number;
};

function getClientIpAddress(request: Pick<Request, "headers">) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const first = forwardedFor.split(",")[0]?.trim();
    if (first) return first;
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  const vercelForwardedFor = request.headers.get("x-vercel-forwarded-for");
  if (vercelForwardedFor) return vercelForwardedFor.trim();

  return "unknown";
}

function isMissingRateLimitInfrastructureError(message: string) {
  return /consume_rate_limit|rate_limit_counters|schema cache|function .* does not exist|relation .* does not exist/i.test(
    message,
  );
}

export async function consumeRateLimit(
  request: NextRequest,
  options: {
    scope: string;
    limit: number;
    windowSeconds: number;
  },
) {
  const supabase = createSupabaseAdminClient();
  const identifierHash = hashIdentifier(getClientIpAddress(request));

  const { data, error } = await supabase.rpc("consume_rate_limit", {
    scope: options.scope,
    identifier_hash: identifierHash,
    limit_count: options.limit,
    window_seconds: options.windowSeconds,
  });

  if (error) {
    if (isMissingRateLimitInfrastructureError(error.message)) {
      return {
        allowed: true,
        remaining: options.limit,
        retryAfterSeconds: 0,
        degraded: true,
      };
    }

    throw error;
  }

  const row = Array.isArray(data)
    ? (data[0] as ConsumeRateLimitRow | undefined)
    : (data as ConsumeRateLimitRow | null);

  if (!row) {
    return {
      allowed: true,
      remaining: options.limit,
      retryAfterSeconds: 0,
      degraded: true,
    };
  }

  return {
    allowed: row.allowed,
    remaining: row.remaining,
    retryAfterSeconds: row.retry_after_seconds,
    degraded: false,
  };
}

export function createRateLimitResponse(
  message: string,
  retryAfterSeconds: number,
) {
  return NextResponse.json(
    {
      error: message,
      retryAfterSeconds,
    },
    {
      status: 429,
      headers: {
        "Retry-After": String(Math.max(retryAfterSeconds, 1)),
      },
    },
  );
}
