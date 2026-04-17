import express from "express";
import pdfSchema from "../../models/pdfSchema.js";
// GET PDFs by user email
export const pdfGet= async (req, res) => {
  try {
    const { user_email } = req.query;

    if (!user_email) {
      return res.status(400).json({ message: "Email required" });
    }

    const pdfs = await pdfSchema
      .find({ user_email: user_email })
      .select({
        filename: 1
      });

    res.json({"pdfs": pdfs , "message": "PDFs retrieved successfully"});
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export default pdfGet;