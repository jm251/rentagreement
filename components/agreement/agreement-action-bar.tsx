"use client";

import { useState, useTransition } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

type AgreementActionBarProps = {
  agreementId: string;
  token: string;
  previewUrl?: string;
  pdfDownloadUrl: string;
  imageDownloadUrl: string;
  contactEmail: string;
  initialEmailSent: boolean;
};

export function AgreementActionBar({
  agreementId,
  token,
  previewUrl,
  pdfDownloadUrl,
  imageDownloadUrl,
  contactEmail,
  initialEmailSent,
}: AgreementActionBarProps) {
  const [isPending, startTransition] = useTransition();
  const [emailSent, setEmailSent] = useState(initialEmailSent);
  const [emailMessage, setEmailMessage] = useState(
    initialEmailSent ? `Email already sent to ${contactEmail}.` : "",
  );

  function handleEmailSend() {
    startTransition(async () => {
      setEmailMessage("");

      try {
        const response = await fetch(`/api/agreement-email/${agreementId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });

        const result = (await response.json()) as {
          error?: string;
          message?: string;
        };

        if (!response.ok) {
          throw new Error(result.error || "Unable to send agreement email.");
        }

        setEmailSent(true);
        setEmailMessage(result.message || `Email sent to ${contactEmail}.`);
      } catch (error) {
        setEmailMessage(
          error instanceof Error ? error.message : "Unable to send agreement email.",
        );
      }
    });
  }

  return (
    <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-wrap gap-3">
        {previewUrl ? (
          <Button asChild>
            <Link href={previewUrl}>Preview agreement</Link>
          </Button>
        ) : null}
        <Button asChild variant="outline">
          <a href={pdfDownloadUrl}>Download PDF</a>
        </Button>
        <Button asChild variant="outline">
          <a href={imageDownloadUrl}>Download image</a>
        </Button>
        <Button
          type="button"
          variant={emailSent ? "secondary" : "outline"}
          onClick={handleEmailSend}
          disabled={isPending}
        >
          {isPending ? "Sending..." : emailSent ? "Email again" : "Send email"}
        </Button>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">
        {emailMessage ||
          `Send the agreement to ${contactEmail} or download a local copy now.`}
      </p>
    </div>
  );
}
