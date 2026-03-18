import { NextResponse } from "next/server";

import { generateAiClauses } from "@/lib/fastrouter";
import { clauseGenerationSchema } from "@/lib/validators";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = clauseGenerationSchema.safeParse(json);

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      const detailMessages = Object.entries(fieldErrors)
        .flatMap(([, messages]) => messages ?? [])
        .filter(Boolean)
        .join(" ");

      return NextResponse.json(
        {
          error: "Invalid clause-generation payload.",
          details: detailMessages || parsed.error.flatten().formErrors.join(" "),
          fieldErrors,
        },
        { status: 400 },
      );
    }

    const clauses = await generateAiClauses(parsed.data);

    return NextResponse.json({ clauses });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to generate clauses.",
      },
      { status: 500 },
    );
  }
}
