import { Chroma } from "@langchain/community/vectorstores/chroma";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import "dotenv/config";

const embeddings = new GoogleGenerativeAIEmbeddings({
  model: "gemini-embedding-001",
});

export const chromaStore = new Chroma(embeddings, {
  collectionName: "pdf-docs",
  url: " http://localhost:8000",
  auth: {
    provider: "token",
    credentials: process.env.CHROMA_API_KEY,
  },
  tenant: process.env.CHROMA_TENANT,
  database: process.env.CHROMA_DATABASE,
});