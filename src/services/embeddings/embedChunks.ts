import { PineconeStore } from "@langchain/pinecone";
import { embeddings } from "@/lib/openai";
import { pineconeIndex } from "@/lib/pinecone";
import { TranscriptChunk } from "@/types/chunk";

export async function embedChunks(
  lectureName: string,
  chunks: TranscriptChunk[]
) {
  const documents = chunks.map((chunk) => ({
    pageContent: chunk.text,
    metadata: {
      lectureName,
      startTimeMs: chunk.startTimeMs,
      endTimeMs: chunk.endTimeMs,
      text: chunk.text,
    },
  }));

  await PineconeStore.fromDocuments(documents, embeddings, { pineconeIndex });
}
