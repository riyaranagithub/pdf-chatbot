import express from "express";
import uploadedPdf from "../models/uploadedPdf.js";

const PdfRoutes = express.Router();

// GET PDFs by user email
PdfRoutes.get("/get_pdfs", async (req, res) => {
  try {
    const { user_email } = req.query;
    console.log("Received request for PDFs with email:", user_email);

    const all = await uploadedPdf.find();
console.log("ALL DATA:", all);

    if (!user_email) {
      return res.status(400).json({ message: "Email required" });
    }

    const files = await uploadedPdf.find({ user_email: user_email }).select("filename");
    console.log("Fetched PDFs:", files);

    res.json({ files });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

export default PdfRoutes;