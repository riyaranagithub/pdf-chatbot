const sessionSchema = new mongoose.Schema({
  session_id: {
    type: String,
    required: true,
    unique: true
  },

  user_email: {
    type: String,
    required: true
  },

  pdf_id: {
    type: String,
    required: true
  },

  title: {
    type: String,
    default: "New Chat"
  }

}, {
  timestamps: { createdAt: "created_at", updatedAt: false }
});

export const Session = mongoose.model("Session", sessionSchema);