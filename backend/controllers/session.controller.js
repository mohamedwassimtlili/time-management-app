import Session from "../models/session.js";
import Task from "../models/task.model.js";

// Create a new session
export const createSession = async (req, res) => {
  try {
    const { taskId, startTime, endTime, status } = req.body;
    
    // Check if task exists and belongs to user
    const task = await Task.findOne({ _id: taskId, user: req.user.userId });
    if (!task) {
      return res.status(404).json({ message: "Task not found." });
    }

    const session = new Session({
      task: taskId,
      user: req.user.userId,
      startTime,
      endTime,
      status
    });

    await session.save();
    res.status(201).json(session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all sessions for the authenticated user
export const getSessions = async (req, res) => {
  try {
    const sessions = await Session.find({ user: req.user.userId })
      .populate('task', 'title description priority collectionId') // Populate task details
      .sort({ startTime: 1 });
    res.status(200).json(sessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a session
export const updateSession = async (req, res) => {
  try {
    const { id } = req.params;
    const session = await Session.findOneAndUpdate(
      { _id: id, user: req.user.userId },
      req.body,
      { new: true }
    );
    if (!session) {
      return res.status(404).json({ message: "Session not found." });
    }
    res.status(200).json(session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a session
export const deleteSession = async (req, res) => {
  try {
    const { id } = req.params;
    const session = await Session.findOneAndDelete({ _id: id, user: req.user.userId });
    if (!session) {
      return res.status(404).json({ message: "Session not found." });
    }
    res.status(200).json({ message: "Session deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Bulk create sessions
export const createSessions = async (req, res) => {
    try {
        const sessionsData = req.body;
         if (!Array.isArray(sessionsData) || sessionsData.length === 0) {
            return res.status(400).json({ message: "Request body must be a non-empty array of sessions" });
        }
        
        const sessions = sessionsData.map(session => ({
            ...session,
            user: req.user.userId
        }));

        const createdSessions = await Session.insertMany(sessions);
        res.status(201).json(createdSessions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
