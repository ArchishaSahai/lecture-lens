import { chatModel } from "@/lib/openai";
import { RetrievedChunk } from "@/services/retrieval/retrieveChunks";

export async function generateAnswer(
  chunks: RetrievedChunk[],
  question: string
): Promise<string> {
  if (chunks.length === 0) {
    return "I couldn't find relevant information in the uploaded lectures.";
  }

  const context = chunks
    .map(
      (chunk, index) =>
        `[${index + 1}] ${chunk.lectureName} (${chunk.startTimeMs}-${chunk.endTimeMs} ms)\n${chunk.text}`
    )
    .join("\n\n");

  const response = await chatModel.invoke([
    {
      role: "system",
      content:
        "Treat the supplied lecture transcript context and lecture names as the only source of truth. Prioritize that retrieved evidence over any general knowledge, and never fill gaps with model prior knowledge. Answer from the retrieved context whenever it supports the question. Do not invent facts. For overview, syllabus, or module-by-module questions, organize the answer by lecture/module and cover every distinct lecture represented in the context. You may make a brief, clearly stated inference when the transcript text or filenames make it obvious, such as identifying a course topic from repeated lecture titles, and explain the evidence. Reply with 'I don't have enough information' only when neither the transcript text nor the lecture metadata supports an answer.",
    },
    {
      role: "user",
      content: `Lecture context:\n${context}\n\nQuestion: ${question}`,
    },
  ]);

  return typeof response.content === "string"
    ? response.content
    : response.content.map((part) => ("text" in part ? part.text : "")).join("");
}
