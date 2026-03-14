// src/components/TaskForm.jsx
import React, { useState, useEffect } from "react";
import { Box, TextField, Button } from "@mui/material";
import { Select, MenuItem } from "@mui/material";
import { api } from "../services/api"; // Corrected import to use named export

export default function TaskForm({ initialData = null, onSave, onCancel }) {
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState(0);
  const [deadline, setDeadline] = useState("");
  const [status, setStatus] = useState("pending");
  const [estimation, setEstimation] = useState(0); // Added estimation
  const [collectionId, setCollectionId] = useState(""); // Added collectionId
  const [collections, setCollections] = useState([]); // List of collections for dropdown

  useEffect(() => {
    // Fetch collections for dropdown
    const fetchCollections = async () => {
        try {
            const res = await api.get("/collections");
            setCollections(res.data);
        } catch (err) {
            console.error(err);
        }
    };
    fetchCollections();

    if (initialData) {
    setTitle(initialData.title || "");
    setNotes(initialData.notes || "");
    setPriority(initialData.priority ?? 0);
    // Convert ISO datetime to datetime-local format (yyyy-MM-ddThh:mm)
    const isoDeadline = initialData.deadline || "";
    const localDeadline = isoDeadline ? new Date(isoDeadline).toISOString().slice(0, 16) : "";
    setDeadline(localDeadline);
    setStatus(initialData.status || "pending");
    setDescription(initialData.description || "");
    setEstimation(initialData.estimation || 0); // Set estimation
    setCollectionId(initialData.collectionId || ""); // Set collectionId
  } else {
    setTitle("");
    setNotes("");
    setPriority(0);
    setDeadline("");
    setStatus("pending");
    setDescription("");
    setEstimation(0);
    setCollectionId("");
  }
  }, [initialData]);

  const handleSubmit = (e) => {
  e.preventDefault();
  if (!title.trim()) return;

  onSave({
    title,
    notes,
    priority,
    deadline,
    status,
    description,
    estimation, // Include estimation
    collectionId: collectionId || null, // Include collectionId
  });
};

  return (
    <Box 
      component="form" 
      onSubmit={handleSubmit} 
      sx={{ 
        mt: 2, 
        display: "flex", 
        flexDirection: "column", 
        gap: { xs: 1.5, sm: 2 },
        px: { xs: 1, sm: 2 },
        pb: { xs: 2, sm: 0 }
      }}
    >
      <TextField 
        label="Title" 
        value={title} 
        onChange={(e) => setTitle(e.target.value)} 
        required 
        fullWidth
        size="medium"
        sx={{
          '& .MuiInputBase-root': {
            fontSize: { xs: '14px', sm: '16px' }
          }
        }}
      />
      <TextField 
        label="Description" 
        value={description} 
        onChange={(e) => setDescription(e.target.value)} 
        multiline 
        rows={{ xs: 2, sm: 3 }}
        fullWidth
        size="medium"
        sx={{
          '& .MuiInputBase-root': {
            fontSize: { xs: '14px', sm: '16px' }
          }
        }}
      />
      <TextField 
        label="Estimation (minutes)" 
        type="number"
        value={estimation} 
        onChange={(e) => setEstimation(Number(e.target.value))} 
        fullWidth
        size="medium"
        inputProps={{ min: 0 }}
      />
      <Select
        value={collectionId}
        displayEmpty
        onChange={(e) => setCollectionId(e.target.value)}
        fullWidth
        size="medium"
      >
        <MenuItem value="">
            <em>None</em>
        </MenuItem>
        {collections.map((col) => (
            <MenuItem key={col._id} value={col._id}>{col.name}</MenuItem>
        ))}
      </Select>
      <TextField 
        label="Priority" 
        value={priority} 
        onChange={(e) => {
          const value = e.target.value;
          setPriority(value === '' ? '' : Number(value));
        }}
        fullWidth
        size="medium"
        type="number"
        inputProps={{ min: 0 }}
        sx={{
          '& .MuiInputBase-root': {
            fontSize: { xs: '14px', sm: '16px' }
          }
        }}
      />      
      <TextField
        label="Deadline"
        type="datetime-local"
        value={deadline}
        onChange={(e) => setDeadline(e.target.value)}
        InputLabelProps={{ shrink: true }}
        fullWidth
        size="medium"
        sx={{
          '& .MuiInputBase-root': {
            fontSize: { xs: '14px', sm: '16px' }
          }
        }}
      />    
      <Select 
        value={status} 
        onChange={(e) => setStatus(e.target.value)}
        fullWidth
        size="medium"
        sx={{
          fontSize: { xs: '14px', sm: '16px' }
        }}
      >
        <MenuItem value="pending">Pending</MenuItem>
        <MenuItem value="in progress">In Progress</MenuItem>
        <MenuItem value="done">Done</MenuItem>
      </Select>
      <Box 
        sx={{ 
          display: "flex", 
          gap: { xs: 1, sm: 2 }, 
          justifyContent: "flex-end",
          flexDirection: { xs: 'column', sm: 'row' },
          mt: { xs: 1, sm: 0 }
        }}
      >
        <Button 
          onClick={onCancel}
          fullWidth={true}
          sx={{ 
            minHeight: { xs: 44, sm: 36 },
            fontSize: { xs: '14px', sm: '15px' }
          }}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          variant="contained"
          fullWidth={true}
          sx={{ 
            minHeight: { xs: 44, sm: 36 },
            fontSize: { xs: '14px', sm: '15px' }
          }}
        >
          Save
        </Button>
      </Box>
    </Box>
  );
}
