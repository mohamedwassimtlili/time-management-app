import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const collectionSchema = new mongoose.Schema({
  id: {
    type: String,
    default: () => uuidv4(),
    unique: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
  },
  priority: {
    type: Number,
    min: 0,
    default: 5,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

export default mongoose.model("Collection", collectionSchema);