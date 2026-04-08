import multer from "multer";
import { Router } from "express";

import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";

const pdfLoadRouter = Router();
const upload = multer({ storage: multer.memoryStorage() });

pdfLoadRouter.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const buffer = req.file.buffer;

    // 🔥 Load PDF directly from buffer
    const loader = new PDFLoader(buffer);
    const docs = await loader.load();

    console.log("PDF Loaded:", docs.length);

    res.json({
      message: "PDF processed successfully",
      pages: docs.length,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to process PDF" });
  }
});

export default pdfLoadRouter;