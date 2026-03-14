import { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  Button,
  IconButton,
  ThemeProvider,
  createTheme,
  CssBaseline,
  Card,
  CardContent,
  Chip,
} from "@mui/material";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
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
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../services/api";
import TaskForm from "./TaskForm";
import { useAuth } from "../context/AuthContext";

// Sortable Task Card Component
function SortableTaskCard({ task, onEdit, onDelete }) {
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
  };

  const getPriorityColor = (priority) => {
    if (priority <= 2) return "error";
    if (priority <= 4) return "warning";
    return "info";
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      sx={{
        mb: 2,
        '&:hover': {
          boxShadow: 6,
        }
      }}
    >
      <CardContent>
        <Box display="flex" alignItems="flex-start" gap={1}>
          <IconButton
            {...attributes}
            {...listeners}
            sx={{
              cursor: "grab",
              "&:active": { cursor: "grabbing" },
              touchAction: 'none',
              minWidth: { xs: 36, sm: 40 },
              minHeight: { xs: 36, sm: 40 },
              p: { xs: 0.5, sm: 1 }
            }}
            size="small"
          >
            <DragIndicatorIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
          </IconButton>
          
          <Box flex={1} minWidth={0}>
            <Typography 
              variant="h6" 
              gutterBottom
              sx={{ 
                fontSize: { xs: '16px', sm: '18px', md: '20px' },
                wordBreak: 'break-word'
              }}
            >
              {task.title}
            </Typography>
            
            {task.description && (
              <Typography 
                variant="body2" 
                color="text.secondary" 
                sx={{ 
                  mb: 1,
                  fontSize: { xs: '13px', sm: '14px' },
                  wordBreak: 'break-word'
                }}
              >
                {task.description}
              </Typography>
            )}
            
            <Box 
              display="flex" 
              gap={1} 
              flexWrap="wrap" 
              alignItems="center"
              sx={{ mb: 1 }}
            >
              <Chip 
                label={`Priority: ${task.priority}`} 
                color={getPriorityColor(task.priority)} 
                size="small"
                sx={{ fontSize: { xs: '11px', sm: '13px' } }}
              />
              <Chip 
                label={task.status} 
                variant="outlined" 
                size="small"
                sx={{ fontSize: { xs: '11px', sm: '13px' } }}
              />
            </Box>
            
            {task.deadline && (
              <Typography 
                variant="caption" 
                color="text.secondary"
                sx={{ 
                  display: 'block',
                  fontSize: { xs: '11px', sm: '12px' }
                }}
              >
                Due: {new Date(task.deadline).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
              </Typography>
            )}
            {task.estimation > 0 && (
              <Typography 
                variant="caption" 
                color="text.secondary"
                sx={{ 
                  display: 'block',
                  fontSize: { xs: '11px', sm: '12px' }
                }}
              >
                Est: {task.estimation} min
              </Typography>
            )}
          </Box>
          
          <Box 
            display="flex" 
            flexDirection={{ xs: 'column', sm: 'row' }}
            gap={{ xs: 0.5, sm: 1 }}
            sx={{
              flexShrink: 0,
              ml: { xs: 0.5, sm: 1 }
            }}
          >
            <IconButton 
              onClick={onEdit} 
              color="primary"
              size="small"
              sx={{
                minWidth: { xs: 36, sm: 40 },
                minHeight: { xs: 36, sm: 40 },
                p: { xs: 0.5, sm: 1 }
              }}
              aria-label="edit task"
            >
              <EditIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
            </IconButton>
            <IconButton 
              onClick={onDelete} 
              color="error"
              size="small"
              sx={{
                minWidth: { xs: 36, sm: 40 },
                minHeight: { xs: 36, sm: 40 },
                p: { xs: 0.5, sm: 1 }
              }}
              aria-label="delete task"
            >
              <DeleteIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
            </IconButton>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

// Main AllTasks Component
export default function AllTasks() {
  const navigate = useNavigate();
  const { collectionId } = useParams(); // Get collectionId from URL params
  const { user, token } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [mode, setMode] = useState(() => {
    const saved = localStorage.getItem('theme-mode');
    return saved || 'light';
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...(mode === 'dark'
            ? {
                background: {
                  default: '#0a0a0a',
                  paper: '#1a1a1a',
                },
                primary: {
                  main: '#3b82f6',
                },
              }
            : {
                background: {
                  default: '#f5f5f5',
                  paper: '#ffffff',
                },
                primary: {
                  main: '#3b82f6',
                },
              }),
        },
      }),
    [mode]
  );

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      let url = "/tasks";
      if (collectionId) {
        // If viewing a specific collection, filter tasks. 
        // Note: Backend might need a query param or a specific route like /collections/:id/tasks
        // For now assuming filtering on client or a query param
        // If you updated backend to support query params: url = `/tasks?collectionId=${collectionId}`
        // Or if you want to filter client side:
      }
      const res = await api.get(url, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      let fetchedTasks = res.data;
      if (collectionId) {
        fetchedTasks = fetchedTasks.filter(t => t.collectionId === collectionId);
      }
      const sortedTasks = fetchedTasks.sort((a, b) => a.priority - b.priority);
      setTasks(sortedTasks);
    } catch (err) {
      console.error("Error fetching tasks:", err);
      setTasks([]);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    
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
        const body = { _id: editTask._id, ...taskData };
        await api.patch(`/tasks/user`, body, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      } else {
        const newTask = {
          ...taskData,
          user: user._id
        };
        if (collectionId) {
          newTask.collectionId = collectionId;
        }
        await api.post("/tasks/user", newTask, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
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

  const toggleTheme = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    localStorage.setItem('theme-mode', newMode);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box 
        sx={{ 
          minHeight: '100vh',
          p: { xs: 2, sm: 3, md: 4 },
          position: 'relative'
        }}
      >
        <IconButton
          onClick={toggleTheme}
          sx={{
            position: 'fixed',
            top: { xs: 8, sm: 16 },
            right: { xs: 8, sm: 16 },
            zIndex: 1300,
            bgcolor: 'background.paper',
            boxShadow: 2,
            minWidth: 44,
            minHeight: 44,
            '&:hover': {
              bgcolor: 'action.hover',
            },
          }}
        >
          {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>

        <Box 
          sx={{ 
            maxWidth: 900, 
            mx: 'auto',
            pt: { xs: 2, sm: 0 }
          }}
        >
          <Box 
            display="flex" 
            justifyContent="space-between" 
            alignItems="center" 
            sx={{ 
              mb: 3,
              flexDirection: { xs: 'column', sm: 'row' },
              gap: { xs: 2, sm: 0 }
            }}
          >
            <Box display="flex" alignItems="center" gap={1}>
              <IconButton 
                onClick={() => navigate("/")}
                sx={{
                  minWidth: 44,
                  minHeight: 44
                }}
                aria-label="back to calendar"
              >
                <ArrowBackIcon />
              </IconButton>
              <Typography 
                variant="h4" 
                sx={{ 
                  fontSize: { xs: '24px', sm: '28px', md: '34px' }
                }}
              >
                All Tasks
              </Typography>
            </Box>
            <Button
              startIcon={<AddIcon />}
              variant="contained"
              onClick={() => {
                setEditTask(null);
                setShowForm(true);
              }}
              sx={{
                minHeight: { xs: 44, sm: 40 },
                fontSize: { xs: '14px', sm: '15px' },
                width: { xs: '100%', sm: 'auto' }
              }}
            >
              Add Task
            </Button>
          </Box>

          {showForm && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <TaskForm 
                  initialData={editTask}
                  onSave={handleSave}
                  onCancel={() => {
                    setShowForm(false);
                    setEditTask(null);
                  }}
                />
              </CardContent>
            </Card>
          )}

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
                {tasks.map((task) => (
                  <SortableTaskCard
                    key={task._id}
                    task={task}
                    onEdit={() => {
                      setEditTask(task);
                      setShowForm(true);
                    }}
                    onDelete={() => handleDelete(task._id)}
                  />
                ))}
              </SortableContext>
            </DndContext>
          ) : (
            <Card>
              <CardContent>
                <Typography 
                  color="text.secondary" 
                  textAlign="center"
                  sx={{ 
                    py: 4,
                    fontSize: { xs: '14px', sm: '16px' }
                  }}
                >
                  No tasks yet. Click "Add Task" to create one.
                </Typography>
              </CardContent>
            </Card>
          )}
        </Box>
      </Box>
    </ThemeProvider>
  );
}
