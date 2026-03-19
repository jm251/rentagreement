import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import {
  areAdminCredentialsValid,
  attachAdminSessionCookie,
  clearAdminSessionCookie,
} from "@/lib/admin-auth";
import { createRateLimitResponse, consumeRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

const adminSessionSchema = z.object({
  username: z.string().trim().min(1, "Username is required."),
  password: z.string().trim().min(1, "Password is required."),
});

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const parsed = adminSessionSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid login payload.",
        },
        { status: 400 },
      );
    }

    const { username, password } = parsed.data;

    if (!areAdminCredentialsValid(username, password)) {
      const rateLimit = await consumeRateLimit(request, {
        scope: "admin_login_failed",
        limit: 5,
        windowSeconds: 60 * 15,
      });

      const unauthorizedResponse = NextResponse.json(
        {
          error: "Invalid admin credentials.",
          ...(rateLimit.degraded
            ? {}
            : { remainingAttempts: Math.max(rateLimit.remaining, 0) }),
        },
        { status: 401 },
      );
      clearAdminSessionCookie(unauthorizedResponse);

      if (!rateLimit.allowed) {
        const rateLimitedResponse = createRateLimitResponse(
          "Too many failed admin login attempts. Try again later.",
          rateLimit.retryAfterSeconds,
        );
        clearAdminSessionCookie(rateLimitedResponse);
        return rateLimitedResponse;
      }

      return unauthorizedResponse;
    }

    const response = NextResponse.json({ success: true });
    attachAdminSessionCookie(response);
    return response;
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to create admin session.",
      },
      { status: 500 },
    );
  }
}
