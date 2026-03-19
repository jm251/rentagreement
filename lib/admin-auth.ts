import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { NextRequest, NextResponse } from "next/server";

import { getEnv } from "@/lib/env";
import {
  createAdminSessionToken,
  getAdminSessionMaxAgeSeconds,
  secureCompare,
  verifyAdminSessionToken,
} from "@/lib/security";

export const ADMIN_SESSION_COOKIE_NAME = "admin_session";

type CookieStoreLike = {
  get(name: string): { value: string } | undefined;
};

function getCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: getAdminSessionMaxAgeSeconds(),
  };
}

export function areAdminCredentialsValid(username: string, password: string) {
  const expectedUsername = getEnv("ADMIN_USERNAME");
  const expectedPassword = getEnv("ADMIN_PASSWORD");

  if (!expectedUsername || !expectedPassword) {
    return false;
  }

  return (
    secureCompare(username, expectedUsername) &&
    secureCompare(password, expectedPassword)
  );
}

function getAdminSessionValueFromCookieStore(cookieStore: CookieStoreLike) {
  return cookieStore.get(ADMIN_SESSION_COOKIE_NAME)?.value || null;
}

export function hasValidAdminSessionCookie(
  cookieStore: CookieStoreLike,
) {
  const token = getAdminSessionValueFromCookieStore(cookieStore);
  return token ? Boolean(verifyAdminSessionToken(token)) : false;
}

export function hasValidAdminSessionRequest(request: NextRequest) {
  const token = request.cookies.get(ADMIN_SESSION_COOKIE_NAME)?.value;
  return token ? Boolean(verifyAdminSessionToken(token)) : false;
}

export function attachAdminSessionCookie(response: NextResponse) {
  response.cookies.set(
    ADMIN_SESSION_COOKIE_NAME,
    createAdminSessionToken(),
    getCookieOptions(),
  );
}

export function clearAdminSessionCookie(response: NextResponse) {
  response.cookies.set(ADMIN_SESSION_COOKIE_NAME, "", {
    ...getCookieOptions(),
    maxAge: 0,
  });
}

export function requireAdminPageSession() {
  const cookieStore = cookies();
  if (!hasValidAdminSessionCookie(cookieStore)) {
    redirect("/admin/login");
  }
}
