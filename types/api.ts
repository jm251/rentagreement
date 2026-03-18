import type { AgreementRecord } from "@/types/agreement";
import type { ClauseInput } from "@/types/clause";

export interface ApiErrorResponse {
  error: string;
  details?: string;
}

export interface GenerateClausesResponse {
  clauses: ClauseInput[];
  warning?: string;
}

export interface PaymentInitiateResponse {
  agreementId: string;
  agreementNumber: string;
  amountPaise: number;
  sessionId: string;
  checkoutUrl: string;
}

export interface PaymentVerifyResponse {
  success: boolean;
  agreementId: string;
  agreementNumber: string | null;
  paymentId: string | null;
  pdfUrl: string | null;
  previewUrl: string;
  successUrl: string;
  emailSent: boolean;
}

export interface CreatePdfResponse {
  agreementId: string;
  pdfUrl: string | null;
}

export interface AdminAgreementsResponse {
  agreements: AgreementRecord[];
}
