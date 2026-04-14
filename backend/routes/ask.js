import { Router } from "express";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { chromaStore } from "../utils/cromaStore.js";
import dotenv from "dotenv";

dotenv.config();

const askRoute = Router();

const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
});

askRoute.post("/", async (req, res) => {
  try {
    const { question, user_email } = req.body;

    if (!question) {
      return res.status(400).json({ error: "Question is required" });
    }

    // 🔍 vector search
    const results = await chromaStore.similaritySearch(
      question,
      3,
      { user_email }
    );

    const context = results.map((doc) => doc.pageContent).join("\n---\n");

    // 🧠 prompt
    const prompt = new PromptTemplate({
      template: `Answer the question based on the following context:

{context}

Question: {question}
Answer:`,
      inputVariables: ["context", "question"],
    });

    // 🔗 chain
    const chain = prompt.pipe(model).pipe(new StringOutputParser());

    // 🤖 response
    const result = await chain.invoke({
      context,
      question,
    });

    res.json({ answer: result });

  } catch (error) {
    console.error("Ask error:", error);
    res.status(500).json({ error: "Failed to answer question" });
  }
});

export default askRoute;