// filepath: /home/mohamedwassim/dev/time-management-app/backend/controllers/collection.controller.js
import Collection from "../models/collection.js";

// Create a new collection
export const createCollection = async (req, res) => {
  try {
    const { name, description, priority } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Name is required" });
    }

    const collection = new Collection({
      name: name.trim(),
      description: description || "",
      priority: priority ?? 5,
      user: req.user.userId,
    });

    await collection.save();
    return res.status(201).json(collection);
  } catch (error) {
    console.error("Error creating collection:", error);
    return res.status(500).json({ message: error.message });
  }
};

// Get all collections for the authenticated user
export const getCollections = async (req, res) => {
  try {
    const collections = await Collection.find({ user: req.user.userId }).sort({ priority: 1, createdAt: -1 });
    return res.status(200).json(collections);
  } catch (error) {
    console.error("Error fetching collections:", error);
    return res.status(500).json({ message: error.message });
  }
};

// Get a single collection by id (limited to the authenticated user)
export const getCollectionById = async (req, res) => {
  try {
    const { id } = req.params;
    const collection = await Collection.findOne({ _id: id, user: req.user.userId });

    if (!collection) {
      return res.status(404).json({ message: "Collection not found" });
    }

    return res.status(200).json(collection);
  } catch (error) {
    console.error("Error fetching collection:", error);
    return res.status(500).json({ message: error.message });
  }
};

// Update a collection
export const updateCollection = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (updates.name && !updates.name.trim()) {
      return res.status(400).json({ message: "Name cannot be empty" });
    }

    const collection = await Collection.findOneAndUpdate(
      { _id: id, user: req.user.userId },
      updates,
      { new: true }
    );

    if (!collection) {
      return res.status(404).json({ message: "Collection not found" });
    }

    return res.status(200).json(collection);
  } catch (error) {
    console.error("Error updating collection:", error);
    return res.status(500).json({ message: error.message });
  }
};

// Delete a collection
export const deleteCollection = async (req, res) => {
  try {
    const { id } = req.params;

    const collection = await Collection.findOneAndDelete({ _id: id, user: req.user.userId });

    if (!collection) {
      return res.status(404).json({ message: "Collection not found" });
    }

    return res.status(200).json({ message: "Collection deleted successfully" });
  } catch (error) {
    console.error("Error deleting collection:", error);
    return res.status(500).json({ message: error.message });
  }
};
