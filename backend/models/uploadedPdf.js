// models/UploadedPDF.js
import mongoose from "mongoose";

const UploadedPDFSchema = new mongoose.Schema(
  {
    user_email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    filename: {
      type: String,
      required: true,
    },

    size_bytes: {
      type: Number,
      required: true,
    },
    uploaded_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: "uploaded_pdfs", // optional: set collection name
  }
);

// Avoid recompiling model if already exists
export default mongoose.models.UploadedPDF || mongoose.model("UploadedPDF", UploadedPDFSchema);