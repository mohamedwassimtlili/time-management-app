# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Component Architecture

This section explains the main components that are currently working and how they interact to support the application's features.

### 1. **Authentication** (`AuthContext.jsx` & `ProtectedRoute.jsx`)
- **How it works:** 
  - The `AuthContext` provider wraps the entire application (`App.jsx`), managing the global authentication state (`user`, `token`, `loading`).
  - On initial load, it checks for a token in `localStorage` and optionally validates it with the backend (`/users/me`).
  - **Login/Logout:** The `login` function updates the state and storage, while `logout` clears them.
  - **Interaction:** 
    - Components like `Login` and `Signup` call `login()` upon successful API responses.
    - `ProtectedRoute` consumes the context to block access to private routes (`/`, `/all-tasks`), redirecting unauthenticated users to `/login`.

### 2. **Navigation & Layout** (`Calendar.jsx`)
- **How it works:**
  - Acts as the main dashboard layout for the application.
  - Features a responsive **Sidebar** (Drawer) that provides navigation between views like "Calendar" and "All Tasks".
  - Includes a **Dark/Light Mode** toggle that persists preference to `localStorage`.
- **Interaction:** 
  - Uses `react-router-dom`'s `useNavigate` for logout redirection.
  - Wraps content in a Material UI `ThemeProvider` to enforce consistent styling.

### 3. **Task Management** (`AllTasks.jsx` & `TaskForm.jsx`)
- **AllTasks Component:**
  - **Function:** Displays a list of tasks.
  - **Features:**
    - Fetches tasks from the backend (`GET /tasks`).
    - Implements **Drag-and-Drop** sorting using `@dnd-kit`.
    - Allows filtering or visual distinction based on priority (color-coded chips) and status.
  - **Interaction:** 
    - Opens `TaskForm` in a modal or separate view to create/edit tasks.
    - Calls API methods to delete or update task details.
  
- **TaskForm Component:**
  - **Function:** A reusable form for creating new tasks or editing existing ones.
  - **Features:** 
    - Fields for Title, Description, Priority, Deadline, and Status.
    - Pre-fills data when editing an existing task (`initialData` prop).
  - **Interaction:** 
    - Emits `onSave` event with form data, which the parent component (`AllTasks` or `CalendarView`) handles by making the actual API call (`POST` or `PUT`).

### 4. **Calendar Visualization** (`CalendarView.jsx`)
- **How it works:** 
  - Integrates `react-big-calendar` to visualize tasks on a monthly/weekly/daily grid.
  - Transforms task data (with `deadline` properties) into "Events" understandable by the calendar library.
- **Features:**
  - **View Switching:** Toggle between Month, Week, Day views.
  - **Date Selection:** Clicking a slot opens `DayControl` to manage tasks for that specific time.
- **Interaction:**
  - Fetches tasks independently or shares state with the context.
  - Updates the `currentDate` and `view` state based on user navigation.

### 5. **Day Management** (`DayControl.jsx`)
- **How it works:**
  - A side drawer component that appears when a specific date is clicked in the `CalendarView`.
  - Intended to show a granular list of tasks or allow quick addition of tasks for that selected date.
- **Interaction:**
  - Controlled by `CalendarView` state (`drawerOpen`, `selectedDate`).

## Scripts

- `npm run dev`: Starts the development server.
