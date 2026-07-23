import { PineconeStore } from "@langchain/pinecone";
import { embeddings } from "@/lib/openai";
import { pineconeIndex } from "@/lib/pinecone";
import { TranscriptChunk } from "@/types/chunk";

export async function embedChunks(chunks: TranscriptChunk[]) {
  const documents = chunks.map((chunk) => ({
    pageContent: chunk.text,
    metadata: {
      startTimeMs: chunk.startTimeMs,
      endTimeMs: chunk.endTimeMs,
    },
  }));

  await PineconeStore.fromDocuments(
    documents,
    embeddings,
    {
      pineconeIndex,
    }
  );
}