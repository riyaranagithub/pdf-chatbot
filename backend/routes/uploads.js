import multer from "multer";
import { Router } from "express";
import uploadedPdf from "../models/uploadedPdf.js";
import fs from "fs";
import path from "path";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { chromaStore } from "../utils/cromaStore.js";



const uploadRoutes = Router();

// Multer memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

uploadRoutes.post("/file", upload.single("file"), async (req, res) => {
  console.log("📥 Upload request received");

  try {
    const { user_email } = req.body;

    console.log("📧 User email:", user_email);
    console.log("📄 File info:", req.file?.originalname);

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    if (!user_email) {
      return res.status(400).json({ error: "Valid email is required" });
    }

    // 📁 Create uploads folder
    const uploadsDir = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
      console.log("📁 Uploads folder created");
    }

    const filePath = path.join(uploadsDir, req.file.originalname);

    // 💾 Save file
    fs.writeFileSync(filePath, req.file.buffer);
    console.log("✅ File saved at:", filePath);

    // 📖 Load PDF
    const loader = new PDFLoader(filePath);
    const docs = await loader.load();

    console.log("📚 Docs loaded:", docs.length);
    console.log("📄 First doc content preview:", docs[0]);

    if (!docs.length) {
      throw new Error("❌ PDF not loaded properly");
    }

    // ✂️ Split text
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 500,
      chunkOverlap: 100,
    });

    const splitDocs = await splitter.splitDocuments(docs);
    console.log("✂️ Total chunks created:", splitDocs.length);
    console.log("📄 First chunk content preview:", splitDocs[0]);

    // 🧠 Create embeddings
    const embeddings = new GoogleGenerativeAIEmbeddings({
      model: "gemini-embedding-2-preview",
    });

    console.log("🧠 Embeddings initialized");
    // console.log("Embedding length for chunk 0:", embeddings[0].length);

    // 🔍 Test embedding (IMPORTANT DEBUG)
    const testEmbedding = await embeddings.embedQuery("test");
    console.log("🔍 Test embedding created, length:", testEmbedding.length);

    // const reducedEmb = embeddings.slice(0, 2048);


    if (!testEmbedding || !testEmbedding.length) {
      throw new Error("❌ Embeddings not working");
    }



    // 🏷️ Add metadata properly

    const docsWithMetadata = splitDocs.map((doc) => ({
  pageContent: doc.pageContent,
  metadata: {
    source: doc.metadata.source || "",
    page: doc.metadata.loc?.pageNumber || 0, // flatten
    user_email,
    file_name: req.file.originalname,
  },
}));

    console.log("🏷️ Metadata added to chunks. Sample metadata:", docsWithMetadata[0]);

    if (!docsWithMetadata.length) {
      throw new Error("❌ No documents to store in Chroma");
    }

    // Vector store in Chroma
    console.log("🚀 Storing data in Chroma...") ;
    await chromaStore.addDocuments(docsWithMetadata);
    console.log("✅ Stored successfully in Chroma");


 






/*
    // ☁️ Store in Pinecone
    console.log("🚀 Sending data to Pinecone...");

    

    const result = await PineconeStore.fromDocuments(docsWithMetadata, embeddings, {
      pineconeIndex,
      namespace: user_email,
    });

    console.log("📊 Pinecone response:", result);

    console.log("✅ Stored successfully in Pinecone");

    */

    // 💾 Save in MongoDB
   /* const newUpload = new uploadedPdf({
      user_email,
      filename: req.file.originalname,
      size_bytes: req.file.size,
    });

    await newUpload.save();
    console.log("🗄️ Saved to MongoDB");
      */

    // 🧹 Delete temp file
    fs.unlinkSync(filePath);
    console.log("🗑️ Temp file deleted");

    // ✅ Response
    res.status(200).json({
      message: "File uploaded and processed successfully 🚀",
      file: {
        filename: req.file.originalname,
        size_bytes: req.file.size,
      },
    });

  } catch (error) {
    console.error("❌ Upload error:", error);

    res.status(500).json({
      error: "File upload failed",
      details: error.message || "Unknown server error",
    });
  }
});

export default uploadRoutes;