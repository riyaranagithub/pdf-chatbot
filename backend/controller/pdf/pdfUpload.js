import { Router } from "express";
import Pdf from "../../models/pdfSchema.js";
import fs from "fs";
import path from "path";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { chromaStore } from "../../utils/cromaStore.js";
import { v4 as uuidv4 } from "uuid";



export const pdfUpload =async (req, res) => {
  console.log("📥 Upload request received");
  console.log("BODY:", req.body);

  try {
      const { user_email } = req.body;

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

     // 🧹 Remove empty chunks
    const cleanDocs = splitDocs.filter(
      (doc) => doc.pageContent && doc.pageContent.trim().length > 0
    );


    // 🏷️ Add metadata properly

    const pdf_id = uuidv4(); // Generate unique PDF ID

    const docsWithMetadata = cleanDocs.map((doc) => ({
      pageContent: doc.pageContent,
      metadata: {
        source: doc.metadata.source || "",
        page: doc.metadata.loc?.pageNumber || 0, // flatten
        user_email,
        file_name: req.file.originalname,
        pdf_id: pdf_id, // Add PDF ID to metadata

      },
    }));

    console.log("🏷️ Metadata added to chunks. Sample metadata:", docsWithMetadata[0]);

    if (!docsWithMetadata.length) {
      throw new Error("❌ No documents to store in Chroma");
    }

    // Vector store in Chroma
    console.log("🚀 Storing data in Chroma...");
    await chromaStore.addDocuments(docsWithMetadata);
    console.log("✅ Stored successfully in Chroma");

    //get document in chroma
    

    // 💾 Save in MongoDB
    const newUpload = new Pdf({
      user_email,
      pdf_id,
      file_name: req.file.originalname,
      size_bytes: req.file.size,
    });

    await newUpload.save();
    console.log("🗄️ Saved to MongoDB");


    // 🧹 Delete temp file
    fs.unlinkSync(filePath);
    console.log("🗑️ Temp file deleted");

    // ✅ Response
    res.status(200).json({
      message: "File uploaded successfully 🚀",
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
};
