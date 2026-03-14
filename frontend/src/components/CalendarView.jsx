// src/components/CalendarView.jsx
import { useState, useEffect, useContext } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { api } from "../services/api";
import DayControl from "./DayControl";
import { AuthContext } from "../context/AuthContext";

//localizer setup to enable date formatting in the calendar
const localizer = momentLocalizer(moment);

export default function CalendarView() {

  //states setting
  const [events, setEvents] = useState([]); //Stores the list of tasks/events to show on the calendar.
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState("month"); // default view
  const { user } = useContext(AuthContext);
  const [selectedDate, setSelectedDate] = useState(null); // ← State to control DayControl drawer
  const [drawerOpen, setDrawerOpen] = useState(false);

  // ← UseEffect & Fetch tasks when component mounts or drawer closes
  useEffect(() => {
    fetchSessions(); // Changed to fetchSessions
  }, [drawerOpen]); //fetchTasks() is called every time drawerOpen changes.

  const fetchSessions = async () => {
    try {
      const res = await api.get("/sessions"); // Changed endpoint to /sessions
      
      // Transform sessions into calendar events
      const sessionList = Array.isArray(res.data) ? res.data : [];
      const formatted = sessionList.map((session) => ({
        id: session._id,
        title: session.task ? session.task.title : "Untitled Session", // Access task title via population
        start: new Date(session.startTime),
        end: new Date(session.endTime),
        status: session.status
      }));
      setEvents(formatted);
    } catch (err) {
      console.error("Error fetching sessions CalendarView:", err);
    }
  };

  // ← Handle date clicks on calendar
  const handleSelectSlot = (slotInfo) => {
    setSelectedDate(slotInfo.start);  // Save clicked date It contains details about the selection.
    setDrawerOpen(true);              // Open DayControl drawer
  };

  const handleSelectEvent = (event) => {
    setSelectedDate(event.start);
    setDrawerOpen(true);
  };

  const eventPropGetter = (event) => {
    let backgroundColor = "#3b82f6"; // Default blue
    switch (event.status) {
      case "done":
        backgroundColor = "#10b981"; // Green
        break;
      case "in progress":
        backgroundColor = "#f59e0b"; // Amber/Yellow
        break;
      case "pending":
      default:
        backgroundColor = "#3b82f6";
        break;
    }
    return { style: { backgroundColor } };
  };

  return (
    <>
      <div className="app-container">
        <h1>📅 My Agenda</h1>
        <div className="calendar-wrapper">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            date={currentDate}
            onNavigate={(date) => setCurrentDate(date)}
            view={view} // ← Set current view
            onView={(newView) => setView(newView)} // ← Update view state on view change
            selectable
            onSelectSlot={handleSelectSlot}  // ← Connect date click handler
            onSelectEvent={handleSelectEvent}
            eventPropGetter={eventPropGetter}
            style={{ height: "600px" }}
          />
        </div>
      </div>

      {/* ← Render DayControl drawer */}
      <DayControl
      open={drawerOpen} // controls visibility
      onClose={() => setDrawerOpen(false)} // closes drawer
      selectedDate={selectedDate}
    />
    </>
  );
}