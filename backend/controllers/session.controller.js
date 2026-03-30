import Session from "../models/session.model.js";

// Create a single session
export const createSession = async (req, res) => {
  try {
    const { task, user, startTime, endTime, status } = req.body;

    const session = new Session({ task, user, startTime, endTime, status });
    await session.save();
    res.status(201).json(session);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Bulk create sessions
export const createSessions = async (req, res) => {
  try {
    const sessions = req.body; // expects an array of session objects

    if (!Array.isArray(sessions) || sessions.length === 0) {
      return res.status(400).json({ message: "Provide a non-empty array of sessions" });
    }

    const created = await Session.insertMany(sessions, { ordered: false });
    res.status(201).json(created);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Get all sessions (optionally filter by ?task=<id> or ?user=<id>)
export const getSessions = async (req, res) => {
  try {
    const filter = {};
    if (req.query.task) filter.task = req.query.task;
    if (req.query.user) filter.user = req.query.user;

    const sessions = await Session.find(filter)
      .populate("task")
      .populate("user");
    res.status(200).json(sessions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update a session
export const updateSession = async (req, res) => {
  try {
    const session = await Session.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!session) return res.status(404).json({ message: "Session not found" });
    res.status(200).json(session);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete a session
export const deleteSession = async (req, res) => {
  try {
    const session = await Session.findByIdAndDelete(req.params.id);

    if (!session) return res.status(404).json({ message: "Session not found" });
    res.status(200).json({ message: "Session deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};