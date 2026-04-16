export const sessionGetAll = async (req, res) => {
  try {
    const { user_email } = req.query;

    const sessions = await Session.find({ user_email })
      .sort({ created_at: -1 });

    res.status(200).json(sessions);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};