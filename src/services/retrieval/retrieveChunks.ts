import { embeddings } from "@/lib/openai";
import { pineconeIndex } from "@/lib/pinecone";
import { TranscriptChunk } from "@/types/chunk";

export interface RetrievedChunk extends TranscriptChunk {
  lectureName: string;
  score?: number;
}

interface StructuredReference {
  identifier: string;
  type: "module" | "chapter" | "lecture";
}

const OVERVIEW_PATTERN = /\b(summari[sz]e\s+(?:the\s+)?(?:course|lectures?|modules?)|summary\s+(?:of\s+)?(?:the\s+)?(?:course|lectures?|modules?)|syllabus|module\s*(?:by|[-\s])\s*module|all\s+modules?|what\s+topics?\s+(?:are\s+)?covered|outline\s+(?:the\s+)?lectures?|course\s+(?:overview|outline)|overview\s+(?:of\s+)?(?:the\s+)?course)\b/i;
const FETCH_BATCH_SIZE = 100;
const REPRESENTATIVE_CHUNKS_PER_LECTURE = 2;

function extractStructuredReference(query: string): StructuredReference | null {
  const match = query.match(/\b(module|chapter|lecture)\s*#?\s*(\d+)\b/i);

  if (!match) return null;

  return {
    type: match[1].toLowerCase() as StructuredReference["type"],
    identifier: String(Number(match[2])),
  };
}

function matchesStructuredReference(lectureName: string, reference: StructuredReference) {
  const identifierPattern = reference.identifier.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(
    `\\b${reference.type}[\\s_/-]*0*${identifierPattern}(?!\\d)`,
    "i"
  ).test(lectureName);
}

function toRetrievedChunks(matches: Awaited<ReturnType<typeof pineconeIndex.query>>["matches"]): RetrievedChunk[] {
  return (matches ?? []).flatMap((match) => {
    const metadata = match.metadata;
    if (
      !metadata ||
      typeof metadata.lectureName !== "string" ||
      typeof metadata.startTimeMs !== "number" ||
      typeof metadata.endTimeMs !== "number" ||
      typeof metadata.text !== "string"
    ) {
      return [];
    }

    return [{
      lectureName: metadata.lectureName,
      startTimeMs: metadata.startTimeMs,
      endTimeMs: metadata.endTimeMs,
      text: metadata.text,
      score: match.score,
    }];
  });
}

export function isOverviewQuestion(query: string): boolean {
  return OVERVIEW_PATTERN.test(query);
}

async function listUploadedLectureNames(): Promise<string[]> {
  const lectureNames = new Set<string>();
  let paginationToken: string | undefined;

  do {
    const page = await pineconeIndex.listPaginated({ paginationToken });
    const ids = (page.vectors ?? []).flatMap((vector) =>
      typeof vector.id === "string" ? [vector.id] : []
    );

    for (let index = 0; index < ids.length; index += FETCH_BATCH_SIZE) {
      const records = await pineconeIndex.fetch(ids.slice(index, index + FETCH_BATCH_SIZE));
      Object.values(records.records ?? {}).forEach((record) => {
        const lectureName = record.metadata?.lectureName;
        if (typeof lectureName === "string") lectureNames.add(lectureName);
      });
    }

    paginationToken = page.pagination?.next;
  } while (paginationToken);

  return [...lectureNames].sort((left, right) => left.localeCompare(right, undefined, { numeric: true }));
}

async function retrieveFromLecture(
  vector: number[],
  lectureName: string,
  topK: number
): Promise<RetrievedChunk[]> {
  const results = await pineconeIndex.query({
    vector,
    topK,
    includeMetadata: true,
    filter: { lectureName: { $eq: lectureName } },
  });

  return toRetrievedChunks(results.matches);
}

async function retrieveOverviewChunks(query: string): Promise<RetrievedChunk[]> {
  const [lectureNames, vector] = await Promise.all([
    listUploadedLectureNames(),
    embeddings.embedQuery(query),
  ]);

  const chunksByLecture = await Promise.all(
    lectureNames.map((lectureName) =>
      retrieveFromLecture(vector, lectureName, REPRESENTATIVE_CHUNKS_PER_LECTURE)
    )
  );

  // Preserve one or more representative chunks for every uploaded lecture,
  // rather than allowing a few semantically similar lectures to dominate Top-K.
  return chunksByLecture.flat();
}

export async function retrieveChunks(query: string, topK = 8): Promise<RetrievedChunk[]> {
  const normalizedQuery = query.trim();
  if (!normalizedQuery) return [];

  const structuredReference = extractStructuredReference(normalizedQuery);

  if (structuredReference) {
    const vector = await embeddings.embedQuery(normalizedQuery);
    const lectureNames = (await listUploadedLectureNames()).filter((lectureName) =>
      matchesStructuredReference(lectureName, structuredReference)
    );

    if (lectureNames.length > 0) {
      const chunks = await Promise.all(
        lectureNames.map((lectureName) => retrieveFromLecture(vector, lectureName, topK))
      );
      return chunks.flat().slice(0, topK);
    }
  }

  if (isOverviewQuestion(normalizedQuery)) {
    return retrieveOverviewChunks(normalizedQuery);
  }

  const vector = await embeddings.embedQuery(normalizedQuery);
  const results = await pineconeIndex.query({ vector, topK, includeMetadata: true });
  return toRetrievedChunks(results.matches).slice(0, topK);
}
