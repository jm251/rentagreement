import type { Metadata } from "next";

import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Rent Agreement Generator India",
  description:
    "Generate a computer-drafted Indian rent agreement with AI-assisted clauses, Stripe checkout, Supabase persistence, SMTP email delivery, and PDF download.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen">{children}</div>
      </body>
    </html>
  );
}
