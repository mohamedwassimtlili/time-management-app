# 📚 Component Architecture Documentation

## 🏗️ Component Hierarchy

```
App.jsx
  └── CalendarView.jsx
        └── DayControl.jsx (Drawer)
              ├── TaskItem.jsx (List of tasks)
              └── TaskForm.jsx (Create/Edit form)
```

---

## 📦 Component Descriptions

### **1. App.jsx** (Root Component)
**Purpose:** Application entry point  
**Responsibilities:**
- Renders CalendarView component
- Provides centering layout

**Props:** None

---

### **2. CalendarView.jsx** (Main Calendar)
**Purpose:** Display monthly calendar and handle date selection  
**Responsibilities:**
- Renders react-big-calendar component
- Manages calendar navigation (month/year switching)
- Handles date clicks → opens DayControl drawer
- Fetches tasks from backend API
- Transforms tasks into calendar events

**State:**
- `events` - Array of calendar events (tasks)
- `currentDate` - Currently displayed month
- `selectedDate` - Date clicked by user
- `drawerOpen` - Controls DayControl drawer visibility

**Key Functions:**
- `handleSelectSlot(slotInfo)` - Opens drawer when date is clicked
- `fetchTasks()` - Gets all tasks from backend

**API Calls:**
- `GET /api/tasks` - Fetch all tasks

---

### **3. DayControl.jsx** (Side Drawer)
**Purpose:** Manage tasks for a specific day  
**Responsibilities:**
- Displays tasks for selected date
- Controls TaskForm visibility
- Handles task creation and updates
- Manages edit mode state

**Props:**
- `open` (boolean) - Controls drawer visibility
- `onClose` (function) - Callback to close drawer
- `selectedDate` (Date) - The selected calendar date

**State:**
- `tasks` - Array of tasks for selected date
- `showForm` - Controls TaskForm visibility
- `editTask` - Stores task being edited (null for create mode)

**Key Functions:**
- `fetchTasks()` - Filters tasks by selected date
- `handleSave(task)` - Creates or updates task
- `handleDelete(id)` - Deletes task

**API Calls:**
- `GET /api/tasks` - Fetch all tasks (then filters by date)
- `POST /api/tasks` - Create new task
- `PATCH /api/tasks/:id` - Update existing task
- `DELETE /api/tasks/:id` - Delete task

---

### **4. TaskForm.jsx** (Form Component)
**Purpose:** Input form for creating/editing tasks  
**Responsibilities:**
- Displays input fields for task properties
- Pre-fills fields when editing
- Validates and submits task data
- Does NOT handle API calls (delegates to parent)

**Props:**
- `initialData` (object) - Task to edit (null for create mode)
- `onSave` (function) - Callback with task data when Save clicked
- `onCancel` (function) - Callback when Cancel clicked

**State:**
- `title` - Task title
- `description` - Task description
- `priority` - Priority number (0-∞, default 5)
- `deadline` - Deadline date/time
- `status` - Task status (pending/in progress/done)

**Key Functions:**
- `handleSubmit()` - Packages form data and calls onSave

**Important:** Only sends editable fields (no IDs)

---

### **5. TaskItem.jsx** (List Item Component)
**Purpose:** Display individual task in a list  
**Responsibilities:**
- Shows task title, priority, and status
- Provides Edit and Delete buttons

**Props:**
- `task` (object) - Task data to display
- `onEdit` (function) - Callback when Edit clicked
- `onDelete` (function) - Callback when Delete clicked

---

## 🔄 Data Flow Examples

### **Creating a New Task:**
```
1. User clicks date in CalendarView
   → CalendarView sets selectedDate and opens DayControl

2. User clicks "Add Task" in DayControl
   → DayControl sets showForm=true, editTask=null

3. User fills TaskForm and clicks "Save"
   → TaskForm calls onSave({ title, description, ... })
   → DayControl.handleSave receives data
   → DayControl makes POST /api/tasks

4. DayControl closes form and refreshes tasks
   → CalendarView refreshes (on drawer close)
```

### **Editing an Existing Task:**
```
1. User clicks "Edit" on TaskItem
   → DayControl sets editTask=task, showForm=true

2. TaskForm receives initialData=editTask
   → Form fields pre-fill with task data

3. User modifies and clicks "Save"
   → TaskForm calls onSave({ title, description, ... })
   → DayControl.handleSave receives data
   → DayControl makes PATCH /api/tasks/:_id
   → Uses editTask._id from state (NOT from form data)

4. DayControl closes form and refreshes tasks
```

### **Deleting a Task:**
```
1. User clicks "Delete" on TaskItem
   → TaskItem calls onDelete(task._id)
   → DayControl.handleDelete receives id
   → DayControl makes DELETE /api/tasks/:id

2. DayControl refreshes task list
```

---

## 🔑 Key Design Patterns

### **1. Controlled Components**
All form inputs are controlled by React state (TaskForm)

### **2. Prop Drilling**
Callbacks passed down: CalendarView → DayControl → TaskForm

### **3. Single Responsibility**
- TaskForm: Only handles UI, no API calls
- DayControl: Manages business logic and API calls
- TaskItem: Pure presentation component

### **4. ID Management**
- Frontend uses MongoDB `_id` for all operations
- Custom `id` (UUID) field exists in model but not used
- IDs passed in URL params, NEVER in request body

### **5. State Hoisting**
- CalendarView manages drawer open/close state
- DayControl manages form open/close state
- TaskForm is fully controlled by parent

---

## 🌐 API Service

### **api.js**
Axios instance configured for backend communication

**Base URL:** `http://localhost:5000/api`

**Endpoints Used:**
- `GET /tasks` - Fetch all tasks
- `POST /tasks` - Create task
- `PATCH /tasks/:id` - Update task (uses MongoDB _id)
- `DELETE /tasks/:id` - Delete task (uses MongoDB _id)

---

## 📝 Task Data Model

```javascript
{
  _id: "507f1f77bcf86cd799439011",    // MongoDB ObjectId
  id: "550e8400-e29b-41d4-a716...",   // Custom UUID (not used in operations)
  title: "Complete project",           // Required
  description: "Finish documentation", // Optional
  priority: 5,                         // 0 = highest, default = 5
  deadline: "2025-11-13T10:00:00Z",   // ISO date string
  status: "pending",                   // pending | in progress | done
  createdAt: "2025-11-12T08:30:00Z"   // Auto-generated
}
```

---

## 🎨 UI Libraries

- **Material-UI (@mui/material)** - UI components (Drawer, Button, TextField, etc.)
- **react-big-calendar** - Calendar component
- **moment.js** - Date handling for calendar
- **@emotion/react & @emotion/styled** - Styling (required by MUI)

---

## 🚀 Quick Reference

**To add a new field to tasks:**
1. Update backend: `models/task.model.js`
2. Update frontend: `components/TaskForm.jsx` (add input field)
3. Update display: `components/TaskItem.jsx` (show new field)

**To change API endpoint:**
1. Update: `services/api.js` (baseURL)

**To modify calendar behavior:**
1. Update: `components/CalendarView.jsx`
