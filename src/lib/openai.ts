import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";

export const embeddings = new OpenAIEmbeddings({
  apiKey: process.env.OPENAI_API_KEY!,
  model: "text-embedding-3-small",
});

export const chatModel = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
  model: "gpt-4o-mini",
  temperature: 0,
});
