import { useState, useEffect } from "react";
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  List,
  Button,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { api } from "../services/api";
import TaskItem from "./TaskItem";
import TaskForm from "./TaskForm";
import { useAuth } from "../context/AuthContext";

// states
export default function DayControl({ open, onClose, selectedDate }) {
  const [tasks, setTasks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const { user , token } = useAuth();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

// useEffect to fetch tasks when drawer opens or selectedDate changes
  useEffect(() => {
    if (open && selectedDate) fetchTasks();
  }, [open, selectedDate]);

  const fetchTasks = async () => {
    try {
      const res = await api.get("/tasks/user", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = Array.isArray(res.data) ? res.data : [];
      const sameDay = data.filter(
        (t) =>
          new Date(t.deadline).toDateString() ===
          new Date(selectedDate).toDateString()
      );
      // Sort by priority ascending (0 is most urgent, at the top)
      const sortedTasks = sameDay.sort((a, b) => a.priority - b.priority);
      setTasks(sortedTasks);
    } catch (err) {
      console.error("Error fetching tasks Day controller listing:", err);
      setTasks([]); // Set empty array on error
    }
  };  
// Events handlers
  const handleDelete = async (id) => {
    try {
      await api.delete(`/tasks/user`, {
        data: { _id: id }
      });
      fetchTasks();
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const handleSave = async (taskData) => {
    if (!user) {
      alert("Please log in to save tasks");
      return;
    }
    
    try {
      if (editTask) {
        console.log("Updating task:", editTask._id);
        console.log("With data:", taskData);
        const body = { _id: editTask._id, ...taskData };
        console.log("Request body for update:", body);
        const res= await api.patch(`/tasks/user`, body,{
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        console.log("Response from update:", res);

      } else {
        const newTask = {
          ...taskData,
          deadline: taskData.deadline || selectedDate, 
        };
        // The token is automatically handled by the api interceptor in src/services/api.js
        await api.post("/tasks/user", newTask); 
      }
      setShowForm(false);
      setEditTask(null);
      fetchTasks();
    } catch (error) {
      console.error("Error saving task:", error);
      alert("Failed to save task. Please try again.");
    }
  };

  const calculateNewPriority = (abovePriority, belowPriority) => {
    const diff = belowPriority - abovePriority;
    if (diff === 0) {
      return abovePriority;
    } else if (diff === 1) {
      return belowPriority;
    } else if (diff > 1) {
      return abovePriority + 1;
    } else {
      return Math.floor((abovePriority + belowPriority) / 2);
    }
  };

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = tasks.findIndex((task) => task._id === active.id);
    const newIndex = tasks.findIndex((task) => task._id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const reorderedTasks = arrayMove(tasks, oldIndex, newIndex);
    setTasks(reorderedTasks);

    const movedTask = reorderedTasks[newIndex];
    let newPriority;

    if (newIndex === 0) {
      if (reorderedTasks.length === 1) {
        newPriority = 0;
      } else {
        const belowTask = reorderedTasks[1];
        if (belowTask.priority === 0) {
          newPriority = 0;
        } else {
          newPriority = Math.max(0, belowTask.priority - 1);
        }
      }
    } else if (newIndex === reorderedTasks.length - 1) {
      const aboveTask = reorderedTasks[newIndex - 1];
      newPriority = aboveTask.priority + 1;
    } else {
      const aboveTask = reorderedTasks[newIndex - 1];
      const belowTask = reorderedTasks[newIndex + 1];
      
      if (aboveTask.priority === 0 && belowTask.priority === 0) {
        newPriority = 0;
      } else if (aboveTask.priority === 0 && belowTask.priority > 0) {
        newPriority = 1;
      } else {
        newPriority = calculateNewPriority(aboveTask.priority, belowTask.priority);
        newPriority = Math.max(0, newPriority);
      }
    }

    try {
      await api.patch(`/tasks/user`, {
        _id: movedTask._id,
        priority: newPriority,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchTasks();
    } catch (error) {
      console.error("Error updating task priority:", error);
      setTasks(tasks);
    }
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  return (
    <Drawer 
      anchor="right" 
      open={open} 
      onClose={onClose}
      disableEnforceFocus={false}
      disableRestoreFocus={false}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: '100%', md: 400 },
          maxWidth: '100%'
        }
      }}
    >
      <Box sx={{ 
        width: '100%', 
        height: '100%',
        p: { xs: 2, sm: 3 },
        display: 'flex',
        flexDirection: 'column'
      }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ fontSize: { xs: '18px', sm: '20px' }, flex: 1 }}>
            Tasks — {new Date(selectedDate).toDateString()}
          </Typography>
          <IconButton 
            onClick={onClose}
            sx={{ 
              minWidth: 44, 
              minHeight: 44,
              bgcolor: 'action.hover',
              '&:hover': {
                bgcolor: 'action.selected',
              }
            }}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
        </Box>

        <Box sx={{ 
          flex: 1, 
          overflowY: 'auto', 
          mb: 2,
          display: { xs: showForm ? 'none' : 'block', md: 'block' }
        }}>
          {tasks.length > 0 ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDragCancel={handleDragCancel}
            >
              <SortableContext
                items={tasks.map((task) => task._id)}
                strategy={verticalListSortingStrategy}
              >
                <List>
                  {tasks.map((task) => (
                    <TaskItem
                      key={task._id}
                      task={task}
                      onEdit={() => {
                        console.log("Editing task:", task);
                        setEditTask(task);
                        setShowForm(true);
                      }}
                      onDelete={() => handleDelete(task._id)}
                    />
                  ))}
                </List>
              </SortableContext>
            </DndContext>
          ) : (
            <Typography sx={{ mt: 2, color: "gray", fontSize: { xs: '14px', sm: '16px' } }}>
              No tasks for this day.
            </Typography>
          )}
        </Box>

        <Button
          startIcon={<AddIcon />}
          variant="contained"
          color="primary"
          fullWidth
          sx={{ 
            minHeight: { xs: 48, sm: 44 },
            fontSize: { xs: '15px', sm: '16px' },
            mb: showForm ? 2 : 0,
            display: { xs: showForm ? 'none' : 'flex', md: 'flex' }
          }}
          onClick={() => {
            setEditTask(null);
            setShowForm(true);
          }}
        >
          Add Task
        </Button>

        {showForm && (
          <Box sx={{ 
            borderTop: { xs: 'none', md: '1px solid #e0e0e0' },
            pt: { xs: 0, md: 2 },
            maxHeight: { xs: '100%', md: 'auto' },
            overflowY: 'auto',
            flex: { xs: 1, md: 'initial' }
          }}>
            <TaskForm
              initialData={editTask}
              onSave={handleSave}
              onCancel={() => setShowForm(false)}
            />
          </Box>
        )}
      </Box>
    </Drawer>
  );
}
