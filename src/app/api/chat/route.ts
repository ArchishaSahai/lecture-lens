import { generateAnswer } from "@/services/llm/generateAnswer";
import { retrieveChunks } from "@/services/retrieval/retrieveChunks";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const question = body && typeof body === "object"
      ? (body as Record<string, unknown>).question
      : undefined;

    if (typeof question !== "string" || question.trim().length === 0) {
      return NextResponse.json({ error: "A question is required." }, { status: 400 });
    }

    const chunks = await retrieveChunks(question, 8);
    const answer = await generateAnswer(chunks, question);

    return NextResponse.json({ answer, sources: chunks });
  } catch (error) {
    console.error("Failed to answer chat question.", error);
    return NextResponse.json(
      { error: "Unable to answer your question right now." },
      { status: 500 }
    );
  }
}
