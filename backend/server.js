import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

// Import task routes
import taskRoutes from "./routes/task.routes.js";
import dayRoutes from "./routes/days.routes.js";  
import userRoutes from "./routes/user.routes.js"; 
import sessionRoutes from "./routes/session.routes.js";
import collectionRoutes from "./routes/collection.routes.js";

dotenv.config();

const app = express();
  
// Middlewares
const PORT = process.env.PORT || 5000;  // use Render's assigned port

app.use(cors());
app.use(express.json()); // Allows parsing JSON in request body

// Routes
app.use("/api/tasks", taskRoutes); // All routes start with /api/tasks
app.use("/api/days", dayRoutes);   // All routes start with /api/days
app.use("/api/users", userRoutes); // All routes start with /api/users
app.use("/api/sessions", sessionRoutes); // Register session routes
app.use("/api/collections", collectionRoutes); // Register collection routes

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));
