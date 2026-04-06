import express from "express";
import env from "dotenv";
import uploadRoutes from "./routes/uploads.js";
import cors from "cors";
import connectDB from "./utils/mongodb.js"; // <-- import mongoose connection

env.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/upload", uploadRoutes);

app.get("/", (req, res) => {
  res.send("Backend running 🚀");
});

// Connect MongoDB first, then start server
connectDB()
  .then(() => {
    console.log("MongoDB connected ✅");
    app.listen(process.env.PORT || 5000, () => {
      console.log(`Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err);
    process.exit(1); // exit if MongoDB connection fails
  });