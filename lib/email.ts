import "server-only";

import nodemailer from "nodemailer";

import { getEnv, getEnvFlag, getEnvNumber } from "@/lib/env";
import {
  createAgreementPreviewToken,
  getAgreementPdfDownloadPath,
  getAgreementPreviewPathWithToken,
} from "@/lib/security";
import { buildAbsoluteUrl } from "@/lib/utils";
import type { AgreementRecord } from "@/types/agreement";

export type AgreementEmailResult = {
  sent: boolean;
  error?: string;
};

export async function sendAgreementReadyEmail(
  agreement: AgreementRecord,
): Promise<AgreementEmailResult> {
  const smtpHost = getEnv("SMTP_HOST");
  const smtpPort = getEnvNumber("SMTP_PORT");
  const smtpUser = getEnv("SMTP_USER");
  const smtpPass = getEnv("SMTP_PASS");
  const smtpFromEmail = getEnv("SMTP_FROM_EMAIL");

  if (
    !smtpHost ||
    !smtpPort ||
    !smtpUser ||
    !smtpPass ||
    !smtpFromEmail
  ) {
    return {
      sent: false,
      error: "Email delivery is not configured on the server.",
    };
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: getEnvFlag("SMTP_SECURE", false),
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  const token = createAgreementPreviewToken(agreement.id);
  const previewUrl = buildAbsoluteUrl(
    getAgreementPreviewPathWithToken(agreement.id, token),
  );
  const pdfDownloadUrl = buildAbsoluteUrl(
    getAgreementPdfDownloadPath(agreement.id, token),
  );

  try {
    await transporter.sendMail({
      from: smtpFromEmail,
      to: agreement.contact_email,
      subject: `Your rent agreement is ready - ${agreement.agreement_number ?? agreement.id}`,
      html: `
        <div style="font-family: Georgia, serif; line-height: 1.6; color: #201913;">
          <h2 style="margin-bottom: 8px;">Your agreement is ready</h2>
          <p>Your payment was verified successfully. You can review and download the generated agreement from the links below.</p>
          <p><strong>Agreement ID:</strong> ${agreement.agreement_number ?? agreement.id}</p>
          <p><a href="${previewUrl}">Preview agreement</a></p>
          <p><a href="${pdfDownloadUrl}">Download PDF</a></p>
          <p style="margin-top: 24px; color: #6a5948;">This document is computer-generated from user inputs and should be reviewed before execution, stamping, notarization, or registration.</p>
        </div>
      `,
    });

    return { sent: true };
  } catch (error) {
    return {
      sent: false,
      error:
        error instanceof Error ? error.message : "Unable to send agreement email.",
    };
  }
}
