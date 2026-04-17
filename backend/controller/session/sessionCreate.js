import { v4 as uuidv4 } from "uuid";
import Session from "../../models/sessionSchema.js";

export const sessionCreate = async (req, res) => {
  try {
    console.log("request for session creare...")
    console.log(req.body)
    const { user_email, pdf_id, title } = req.body;
    

    if (!user_email || !pdf_id) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const session_id = uuidv4();

    const newSession = await Session.create({
      session_id,
      user_email,
      pdf_id,
      title: title || "New Chat"
    });

    res.status(201).json({
      message: "Session created",
      session_id: newSession.session_id
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};