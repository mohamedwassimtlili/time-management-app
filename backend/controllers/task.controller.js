import Task from "../models/task.model.js";
import mongoose from "mongoose";

// Create a new task
export const createTask = async (req, res) => {
  console.log("🔵 CREATE TASK ENDPOINT HIT");
  console.log("📥 Request body:", req.body);
  console.log("📥 Request headers:", req.headers);
  try {
    const taskData = { ...req.body };
    // If the request has executed the auth middleware, attach user ID
    if (req.user && req.user.userId) {
      taskData.user = req.user.userId;
      console.log("msg:::::::::::::",req.user.userId)
    }

    const task = new Task(taskData); // id is auto-generated
    console.log("🟡 Task object created:", task);
    await task.save();
    console.log("✅ Created task:", task);
    res.status(201).json(task);
  } catch (error) {
    console.log("❌ Error creating task:", error.message);
    res.status(400).json({ message: error.message });
  }
};

// Get all tasks (sorted by priority: lowest first - 0 is most urgent)
export const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find().sort({ priority: 1 });
    res.status(200).json(tasks);
    console.log("✅ Retrieved tasks:");
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createUserTask = async (req, res) => {
  try {
    console.log("🔵 user ID: " , req.user.userId);
    console.log("🔵 task: : " ,req.body);
    const task = new Task({ ...req.body, user: req.user.userId }); // id is auto-generated
    console.log("🟡 User Task object created:", task);
    await task.save();
    console.log("✅ Created user task:", task);
    res.status(201).json(task);
  } catch (error) {
    console.error("❌ Error retrieving tasks for user:", error);
    res.status(500).json({ message: error.message });
  }
}

export const createBulkUserTasks = async (req, res) => {
  try {
    console.log("🔵 CREATE BULK USER TASKS ENDPOINT HIT");
    console.log("📥 req.user.userId:", req.user?.userId);
    console.log("📥 Request body:", req.body);

    if (!Array.isArray(req.body) || req.body.length === 0) {
      return res.status(400).json({ message: "Request body must be a non-empty array of tasks" });
    }

    const userId = new mongoose.Types.ObjectId(req.user.userId);

    // Attach user to each task and avoid mutating incoming objects
    const tasksToInsert = req.body.map((task) => ({
      ...task,
      user: userId,
    }));

    // Insert many tasks for the authenticated user
    const insertedTasks = await Task.insertMany(tasksToInsert);

    res.status(201).json(insertedTasks);
    console.log("✅ Created bulk user tasks. Count:", insertedTasks.length);
  } catch (error) {
    console.error("❌ Error creating bulk user tasks:", error);
    res.status(400).json({ message: error.message });
  }
};

export const getTasksByUser = async (req, res) => {
  try {
    console.log("🔵 GET TASKS BY USER ENDPOINT HIT");
    console.log("📥 req.user.userId:", req.user.userId);
    const userId = new mongoose.Types.ObjectId(req.user.userId);
    const tasks = await Task.find({ user: userId }).sort({ priority: 1 });
    res.status(200).json(tasks);
    console.log("✅ Retrieved tasks for user:", req.user.userId);

  } catch (error) {
    console.error("❌ Error retrieving tasks for user:", error);
    res.status(500).json({ message: error.message });
  }
};



export const DeleteAll = async (req, res) => {
  try {
    const result = await Task.deleteMany({});
    res.status(200).json({ message: `${result.deletedCount} tasks deleted.` });
    console.log("✅ Deleted all tasks. Count:", result.deletedCount);
  }
  catch (error) {
    res.status(500).json({ message: error.message });
  }
}


export const deleteTasksByUser = async (req, res) => {
  try {
    console.log("🔵 DELETE ALL TASKS BY USER ENDPOINT HIT");
    console.log("📥 req.user.userId:", req.user.userId);
    const userId = new mongoose.Types.ObjectId(req.user.userId);
    const result = await Task.deleteMany({ user: userId });
    
    res.status(200).json({ message: `${result.deletedCount} tasks deleted.` });
    console.log("✅ Deleted", result.deletedCount, "tasks for user:", req.user.userId);
  } catch (error) {
    console.error("❌ Error deleting tasks for user:", error);
    res.status(500).json({ message: error.message });
  }
};

// Delete all tasks of a user in a specific month
export const deleteUserTasksByMonth = async (req, res) => {
  try {
    console.log("🔵 DELETE USER TASKS BY MONTH ENDPOINT HIT");
    console.log("📥 req.user.userId:", req.user.userId);
    console.log("📥 Year:", req.params.year);
    console.log("📥 Month:", req.params.month);
    
    const userId = new mongoose.Types.ObjectId(req.user.userId);
    const year = parseInt(req.params.year);
    const month = parseInt(req.params.month); // 1-12
    
    // Validate year and month
    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
      return res.status(400).json({ message: "Invalid year or month. Month must be between 1 and 12." });
    }
    
    // Create date range for the specified month
    const startDate = new Date(year, month - 1, 1); // month - 1 because JS months are 0-indexed
    const endDate = new Date(year, month, 0, 23, 59, 59, 999); // Last day of the month
    
    console.log("📅 Date range:", { startDate, endDate });
    
    // Delete tasks where deadline is within the specified month
    const result = await Task.deleteMany({
      user: userId,
      deadline: {
        $gte: startDate,
        $lte: endDate
      }
    });
    
    res.status(200).json({ 
      message: `${result.deletedCount} tasks deleted for ${year}-${month.toString().padStart(2, '0')}`,
      deletedCount: result.deletedCount,
      month: month,
      year: year
    });
    console.log("✅ Deleted", result.deletedCount, "tasks for user:", req.user.userId, "in", year, "-", month);
  } catch (error) {
    console.error("❌ Error deleting tasks by month:", error);
    res.status(500).json({ message: error.message });
  }
};

// Delete a single task by ID (with authentication)
export const deleteUserTask = async (req, res) => {
  try {
    console.log("🔵 DELETE SINGLE TASK ENDPOINT HIT");
    console.log("📥 Task ID:", req.body._id);
    console.log("📥 User ID:", req.user.userId);
    
    const userId = new mongoose.Types.ObjectId(req.user.userId);
    const taskId = new mongoose.Types.ObjectId(req.body._id);
    
    // Delete only if the task belongs to the authenticated user
    const result = await Task.deleteOne({ _id: taskId, user: userId });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Task not found or unauthorized" });
    }
    
    res.status(200).json({ message: "Task deleted successfully" });
    console.log("✅ Deleted task:", req.body._id);
  } catch (error) {
    console.error("❌ Error deleting task:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get one task by id (UUID)
export const getTaskById = async (req, res) => {
  try {
    const task = await Task.findOne({ id: req.params.id }).sort({ priority: -1 });
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.status(200).json(task);
    console.log("✅ Retrieved task:", task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a task by id
export const updateTask = async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true });
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.status(200).json(task);
    console.log("✅ Updated task:", task);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateUserTask = async (req, res) => {
  try {
    console.log("🔵 UPDATE USER TASK ENDPOINT HIT");
    const task = await Task.findOneAndUpdate({ _id: req.body._id }, req.body, { new: true });
    console.log("🟡 Task after update attempt:", task);
    res.status(200).json(task);
    console.log("✅ Updated user task:", task);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }

};
// Delete a task by id
export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.body.id });
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.status(200).json({ message: "Task deleted successfully" });
    console.log("✅ Deleted task:", task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// routes/taskRoutes.js
export const createBulkTasks = async (req, res) => {
  try { 
    
    const tasks = await Task.insertMany(req.body);
    res.status(201).json(tasks);
    console.log("✅ Created bulk tasks:");
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

