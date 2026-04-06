// routes/upload.js
import cloudinary from "../utils/cloudinary_config.js";
import multer from "multer";
import { Router } from "express";
import uploadedPdf from "../models/uploadedPdf.js";

const uploadRoutes = Router();

// Use memory storage for multer (small files, PDFs)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Helper function to validate email (simple regex)
const isValidEmail = (email) =>
  typeof email === "string" &&
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// PDF / file upload route
uploadRoutes.post("/file", upload.single("file"), async (req, res) => {
  try {
    // Check if file exists
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Check if email is provided and valid
    const userEmail = req.body.userEmail;
    console.log("Received upload request with email:", userEmail);
    if (!userEmail || !isValidEmail(userEmail)) {
      return res.status(400).json({ error: "Valid email is required" });
    }

    console.log("Uploading file for email:", userEmail);
    console.log("File info:", req.file.originalname, req.file.mimetype);

    // Convert file buffer to Base64
    const fileBase64 = req.file.buffer.toString("base64");

    // Upload to Cloudinary
    const uploaded = await cloudinary.uploader.upload(
      `data:${req.file.mimetype};base64,${fileBase64}`,
      {
        folder: "user_uploads",
        resource_type: "auto", // auto-detect PDF, image, or video
        use_filename: true,
        unique_filename: true,
        overwrite: false,
        context: `email=${userEmail}`, // store email in metadata
      }
    );

    // Save upload info to MongoDB
    const newUpload = new uploadedPdf({
      user_email: userEmail,
      cloudinary_url: uploaded.secure_url,
      cloudinary_public_id: uploaded.public_id,
      filename: req.file.originalname,
      format: uploaded.format,
      size_bytes: uploaded.bytes,
    });
    await newUpload.save();
    console.log("Upload saved to DB for email:");


    // Send response
    res.status(200).json({
      message: "File uploaded successfully",
      file: {
        url: uploaded.secure_url,
        public_id: uploaded.public_id,
        format: uploaded.format,
        resource_type: uploaded.resource_type,
        bytes: uploaded.bytes,
        email: userEmail,
      },
    });
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    res.status(500).json({
      error: "File upload failed",
      details: error.message || "Unknown server error",
    });
  }
});

export default uploadRoutes;