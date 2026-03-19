import { redirect } from "next/navigation";
import { cookies } from "next/headers";

import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { hasValidAdminSessionCookie } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export default function AdminLoginPage() {
  if (hasValidAdminSessionCookie(cookies())) {
    redirect("/admin");
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
      <AdminLoginForm />
    </main>
  );
}
