import "server-only";

import { getEnv } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { AgreementRecord } from "@/types/agreement";

function getBucketName() {
  return getEnv("SUPABASE_STORAGE_BUCKET") || "agreements";
}

export async function fetchAgreementById(id: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("agreements")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return null;
  }

  return data as AgreementRecord;
}

export async function listAgreements() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("agreements")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    throw error;
  }

  return data as AgreementRecord[];
}

export async function uploadAgreementPdf(agreementId: string, pdfBuffer: Buffer) {
  const supabase = createSupabaseAdminClient();
  const bucket = getBucketName();
  const path = `${agreementId}/agreement.pdf`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, pdfBuffer, {
      upsert: true,
      contentType: "application/pdf",
    });

  if (error) {
    throw error;
  }

  const signedUrl = await createAgreementPdfSignedUrl(path);

  return {
    path,
    url: signedUrl,
  };
}

export async function createAgreementPdfSignedUrl(path: string) {
  const supabase = createSupabaseAdminClient();
  const bucket = getBucketName();

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, 60 * 60 * 24 * 7);

  if (error) {
    throw error;
  }

  return data.signedUrl;
}

export async function downloadAgreementPdf(path: string) {
  const supabase = createSupabaseAdminClient();
  const bucket = getBucketName();

  const { data, error } = await supabase.storage.from(bucket).download(path);

  if (error) {
    throw error;
  }

  return Buffer.from(await data.arrayBuffer());
}
