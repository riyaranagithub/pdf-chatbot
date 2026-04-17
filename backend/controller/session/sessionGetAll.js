import Session from "../../models/sessionSchema.js";

export const sessionGetAll = async (req, res) => {
  try {
    console.log("request to get all sessions")
    console.log(req.body)
    const { user_email } = req.body;

    const sessions = await Session.find({ user_email })
      .sort({ created_at: -1 });

    res.status(200).json(sessions);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};