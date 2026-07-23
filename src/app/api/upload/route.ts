import { embedChunks } from "@/services/embeddings/embedChunks";
import { TranscriptChunk } from "@/types/chunk";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

interface UploadLecture {
  lectureName: string;
  chunks: TranscriptChunk[];
}

function isTranscriptChunk(value: unknown): value is TranscriptChunk {
  if (!value || typeof value !== "object") return false;

  const chunk = value as Record<string, unknown>;
  return (
    typeof chunk.text === "string" &&
    typeof chunk.startTimeMs === "number" &&
    typeof chunk.endTimeMs === "number"
  );
}

function isUploadLecture(value: unknown): value is UploadLecture {
  if (!value || typeof value !== "object") return false;

  const lecture = value as Record<string, unknown>;
  return (
    typeof lecture.lectureName === "string" &&
    lecture.lectureName.trim().length > 0 &&
    Array.isArray(lecture.chunks) &&
    lecture.chunks.every(isTranscriptChunk)
  );
}

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();

    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid upload payload." }, { status: 400 });
    }

    const { lectures } = body as Record<string, unknown>;

    if (!Array.isArray(lectures) || !lectures.every(isUploadLecture)) {
      return NextResponse.json(
        { error: "Valid lectures and transcript chunks are required." },
        { status: 400 }
      );
    }

    await Promise.all(
      lectures.map((lecture) => embedChunks(lecture.lectureName, lecture.chunks))
    );

    return NextResponse.json({
      lectures: lectures.map((lecture) => ({
        lectureName: lecture.lectureName,
        chunkCount: lecture.chunks.length,
      })),
    });
  } catch (error) {
    console.error("Failed to embed uploaded transcript chunks.", error);
    return NextResponse.json(
      { error: "Unable to process the uploaded transcript." },
      { status: 500 }
    );
  }
}
