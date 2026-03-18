import "server-only";

import type { ClauseGenerationSchema } from "@/lib/validators";
import { clauseSchema } from "@/lib/validators";
import {
  safeJsonParse,
  sanitizeClauseText,
  tryExtractJsonArray,
} from "@/lib/utils";
import type { ClauseInput } from "@/types/clause";

export const CLAUSE_SYSTEM_PROMPT =
  "You are a legal drafting assistant specializing in Indian rental law. Based on the following rent agreement context, generate 3-5 specific, enforceable special clauses in formal legal language suitable for an Indian Leave & License agreement. Return only the clauses as a JSON array with fields: title (string) and text (string). No preamble, no markdown.";

type FastRouterResponse = {
  choices?: Array<{
    message?: {
      content?: string | Array<{ type?: string; text?: string }>;
    };
  }>;
  error?: {
    message?: string;
  };
};

function extractTextContent(
  content?: string | Array<{ type?: string; text?: string }>,
) {
  if (!content) return "";
  if (typeof content === "string") return content;
  return content
    .map((item) => item.text || "")
    .join("\n")
    .trim();
}

export async function generateAiClauses(input: ClauseGenerationSchema) {
  const apiKey = process.env.FASTROUTER_API_KEY_3;
  const apiUrl = process.env.FASTROUTER_API_URL;
  const model = process.env.FASTROUTER_MODEL;

  if (!apiKey || !apiUrl || !model) {
    throw new Error("FastRouter configuration is incomplete.");
  }

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      max_tokens: 1200,
      messages: [
        {
          role: "system",
          content: CLAUSE_SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: JSON.stringify(input, null, 2),
        },
      ],
    }),
    cache: "no-store",
  });

  const payload = (await response.json()) as FastRouterResponse;
  if (!response.ok) {
    throw new Error(payload.error?.message || "FastRouter request failed.");
  }

  const text = extractTextContent(payload.choices?.[0]?.message?.content);
  const jsonCandidate = tryExtractJsonArray(text);

  if (!jsonCandidate) {
    throw new Error("The AI response did not contain a valid JSON array.");
  }

  const parsed = safeJsonParse<ClauseInput[]>(jsonCandidate);
  if (!parsed) {
    throw new Error("Unable to parse the AI clause response as JSON.");
  }

  const normalized = parsed.map((clause) => ({
    title: sanitizeClauseText(clause.title),
    text: sanitizeClauseText(clause.text),
  }));

  const validated = clauseSchema.array().min(3).max(5).safeParse(normalized);
  if (!validated.success) {
    throw new Error("The AI clause response did not match the required shape.");
  }

  return validated.data;
}
