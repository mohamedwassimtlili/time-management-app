import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const sessionSchema = new mongoose.Schema({
  id: {
    type: String,
    default: () => uuidv4(),
    unique: true,
  },
  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Task",
    required: true, // session must be linked to a task
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  startTime: {
    type: Date,
    required: true,
  },
  endTime: {
    type: Date,
    required: true,
  },
  description:{
    type: String,
  },
  status: {
    type: String,
    enum: ["pending", "in progress", "done"],
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

export default mongoose.model("Session", sessionSchema);