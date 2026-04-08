import { Router } from "express";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PineconeStore } from "@langchain/pinecone";
import { pineconeIndex } from "../utils/pinecone.js";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import dotenv from "dotenv";
dotenv.config();

const askRoute = Router();

const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash",
});

askRoute.post("/", async (req, res) => {
    try {
        const { question, user_email } = req.body;

        console.log("Received question:", question);
        console.log("User email:", user_email);


        if (!question) {
            return res.status(400).json({ error: "Question is required" });
        }

        const embeddings = new GoogleGenerativeAIEmbeddings({
            model: "gemini-embedding-001",
        });

        // console.log("embeddings created", embeddings);
        const vectorStore = await PineconeStore.fromExistingIndex(
            embeddings,
            {
                pineconeIndex,
                namespace: user_email,
            }
        );

        console.log("vector store created : ", vectorStore);

        const results = await vectorStore.similaritySearch(question, 3);

        console.log("vector store similarity search result : ", results);

        const context = results.map((r) => r.pageContent).join("\n");

        console.log("Retrieved context after sematic search :", context);


        //         // 🤖 Ask Gemini
        //         const response = await model.invoke(`
        // Answer ONLY from the context below.

        // Context:
        // ${context}

        // Question:
        // ${question}
        // `);

        //         console.log("Gemini response:", response);

        //         res.json({
        //             answer: response.content,
        //         });

    } catch (error) {
        console.error("Ask error:", error);
        res.status(500).json({
            error: "Failed to answer question",
        });
    }
});

export default askRoute;