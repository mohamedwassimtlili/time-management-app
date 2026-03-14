// src/components/TaskItem.jsx
import React from "react";
import { ListItem, ListItemText, IconButton, ListItemSecondaryAction, Typography } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export default function TaskItem({ task, onEdit, onDelete }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    position: 'relative' // helper for dragging
  };

  return (
    <ListItem
      ref={setNodeRef}
      style={style}
      sx={{
        bgcolor: 'background.paper',
        mb: 1,
        borderRadius: 1,
        border: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        alignItems: 'center',
        paddingRight: 12, // Make info for action buttons
        '&:hover': {
          bgcolor: 'action.hover',
        }
      }}
    >
      <IconButton
        {...attributes}
        {...listeners}
        sx={{ 
          cursor: "grab", 
          "&:active": { cursor: "grabbing" }, 
          mr: 1,
          touchAction: 'none'
        }}
        size="small"
      >
        <DragIndicatorIcon fontSize="small" />
      </IconButton>
      
      <ListItemText
        primary={
            <Typography variant="subtitle1" component="div" sx={{ fontWeight: 500, lineHeight: 1.2 }}>
                {task.title}
            </Typography>
        }
        secondary={
            <Typography variant="caption" color="text.secondary">
                {task.deadline ? new Date(task.deadline).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'No time'}
            </Typography>
        }
        sx={{ my: 0 }}
      />

      <ListItemSecondaryAction>
      <IconButton edge="end" aria-label="edit" onClick={onEdit} sx={{ mr: 1 }}>
        <EditIcon fontSize="small"/>
      </IconButton>
      <IconButton edge="end" aria-label="delete" onClick={onDelete}>
        <DeleteIcon fontSize="small"/>
      </IconButton>
      </ListItemSecondaryAction>
    </ListItem>
  );
}
