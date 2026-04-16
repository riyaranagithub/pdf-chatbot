import { Router } from "express";
import uploadedPdf from "../models/uploadedPdf.js";
import Chat from "../models/Chat.js"; // if you created
import Session from "../models/Session.js"; // if you created
import { chromaStore } from "../utils/cromaStore.js";

export const pdfDelete =  async (req, res) => {
  const { pdf_id } = req.params;
  const { user_email } = req.body;

  try {
    console.log("🗑️ Delete request for PDF:", pdf_id);

    // 🔒 Safety check
    const pdf = await uploadedPdf.findOne({ _id: pdf_id, user_email });

    if (!pdf) {
      return res.status(404).json({ error: "PDF not found or unauthorized" });
    }

    // =========================
    // 🧠 1. DELETE FROM CHROMA
    // =========================

    console.log("🚀 Deleting from Chroma...");

    // Option A: delete via metadata (if supported)
    try {
      await chromaStore.delete({
        filter: {
          pdf_id: pdf_id,
        },
      });
      console.log("✅ Deleted from Chroma using metadata");
    } catch (err) {
      console.log("⚠️ Metadata delete failed, fallback to IDs");

      // Option B: fallback using IDs
      // ⚠️ only works if you used custom ids during insert
      const ids = [];

      for (let i = 0; i < 10000; i++) {
        ids.push(`${pdf_id}_${i}`);
      }

      await chromaStore.delete({ ids });
      console.log("✅ Deleted from Chroma using IDs");
    }

    // =========================
    // 🗄️ 2. DELETE FROM MONGODB
    // =========================

    await uploadedPdf.deleteOne({ _id: pdf_id });

    // Optional (if using chat system)
    await Chat.deleteMany({ pdf_id });
    await Session.deleteMany({ pdf_id });

    console.log("🗄️ Deleted from MongoDB");

    // =========================
    // ✅ RESPONSE
    // =========================

    res.status(200).json({
      message: "PDF deleted successfully 🚀",
    });

  } catch (error) {
    console.error("❌ Delete error:", error);

    res.status(500).json({
      error: "Failed to delete PDF",
      details: error.message,
    });
  }
};

