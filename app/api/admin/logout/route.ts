import { NextResponse, type NextRequest } from "next/server";

import { clearAdminSessionCookie } from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/admin/login", request.url), 303);
  clearAdminSessionCookie(response);
  return response;
}
