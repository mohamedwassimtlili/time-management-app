import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";

// ─── Constants ─────────────────────────────────────────────────────────────────
const ACCENT = "#534AB7";
const ACCENT_LIGHT = "#EEEDFE";
const ACCENT_MID = "#CECBF6";

// ─── Theme (matches AllTasks + Calendar pattern) ────────────────────────────────
function buildTheme(mode) {
  return createTheme({
    palette: {
      mode,
      ...(mode === "dark"
        ? { background: { default: "#0a0a0a", paper: "#1a1a1a" }, primary: { main: ACCENT } }
        : { background: { default: "#f7f7f5", paper: "#ffffff" }, primary: { main: ACCENT } }),
    },
  });
}

// ─── Dynamic styles (all colors adapt to mode) ─────────────────────────────────
function makeStyles(mode) {
  const dark = mode === "dark";
  const bg0   = dark ? "#0a0a0a" : "#f7f7f5";
  const bg1   = dark ? "#1a1a1a" : "#ffffff";
  const bg2   = dark ? "#242424" : "#f2f2f0";
  const text1 = dark ? "#f0f0f0" : "#1a1a1a";
  const text2 = dark ? "#999"    : "#666";
  const text3 = dark ? "#666"    : "#aaa";
  const bdr   = dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)";
  const bdr2  = dark ? "rgba(255,255,255,0.16)" : "rgba(0,0,0,0.2)";
  const chip  = dark ? "#2a2560" : ACCENT_LIGHT;
  const chipT = dark ? "#a09ce8" : ACCENT;
  const chipH = dark ? "#332e78" : ACCENT_MID;
  const doneBg  = dark ? "#0f2d1e" : "#eaf6ef";
  const doneBdr = dark ? "#1f5c3a" : "#b6dfc8";
  const doneTxt = dark ? "#4caf82" : "#2d8a56";
  const overlay = dark ? "rgba(0,0,0,0.6)" : "rgba(0,0,0,0.35)";

  return `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&family=DM+Serif+Display:ital@0;1&display=swap');
.dash-root*{box-sizing:border-box;}
.dash-root{
  font-family:'DM Sans',sans-serif;color:${text1};background:${bg0};
  padding:0 1.5rem 5rem;max-width:960px;margin:0 auto;min-height:100vh;
  transition:background 0.2s,color 0.2s;
}
.dash-header{
  display:flex;align-items:center;justify-content:space-between;
  padding:2rem 0 1.25rem;border-bottom:0.5px solid ${bdr};margin-bottom:1.75rem;
}
.dash-greeting{
  font-family:'DM Serif Display',serif;font-size:28px;font-weight:400;
  line-height:1.2;font-style:italic;margin:0 0 4px;color:${text1};
}
.dash-date{font-size:13px;color:${text2};margin:0;}
.dash-header-right{display:flex;align-items:center;gap:8px;}
.dash-avatar{
  width:38px;height:38px;border-radius:50%;background:${chip};color:${chipT};
  font-size:13px;font-weight:500;display:flex;align-items:center;justify-content:center;flex-shrink:0;
}
.btn-logout{
  display:flex;align-items:center;gap:6px;padding:7px 14px;border-radius:10px;
  border:0.5px solid ${bdr2};background:transparent;color:${text2};
  font-family:'DM Sans',sans-serif;font-size:13px;cursor:pointer;transition:border-color 0.15s,color 0.15s;
}
.btn-logout:hover{border-color:${ACCENT};color:${ACCENT};}
.btn-theme{
  width:36px;height:36px;border-radius:50%;border:0.5px solid ${bdr};
  background:${bg1};color:${text1};display:flex;align-items:center;justify-content:center;
  cursor:pointer;font-size:17px;line-height:1;transition:border-color 0.15s;
}
.btn-theme:hover{border-color:${bdr2};}
.ai-box{
  background:${bg1};border:0.5px solid ${bdr};border-radius:14px;
  padding:1.25rem 1.5rem;margin-bottom:1.75rem;transition:background 0.2s,border-color 0.2s;
}
.ai-label{
  font-size:11px;font-weight:500;letter-spacing:0.08em;text-transform:uppercase;
  color:${chipT};margin:0 0 10px;
}
.ai-input-row{display:flex;gap:10px;align-items:center;}
.ai-input{
  flex:1;background:${bg2};border:0.5px solid ${bdr};border-radius:10px;
  padding:10px 14px;font-family:'DM Sans',sans-serif;font-size:14px;color:${text1};
  outline:none;transition:border-color 0.15s;
}
.ai-input:focus{border-color:${ACCENT};}
.ai-input::placeholder{color:${text3};}
.btn-plan{
  background:${ACCENT};color:#fff;border:none;border-radius:10px;
  padding:10px 20px;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:500;
  cursor:pointer;white-space:nowrap;transition:opacity 0.15s;
}
.btn-plan:hover{opacity:0.88;}
.chip-row{display:flex;gap:8px;margin-top:10px;flex-wrap:wrap;}
.chip{
  background:${chip};color:${chipT};border:none;border-radius:99px;
  padding:5px 12px;font-family:'DM Sans',sans-serif;font-size:12px;cursor:pointer;
  transition:background 0.15s;
}
.chip:hover{background:${chipH};}
.dash-grid{display:grid;grid-template-columns:minmax(0,1fr) 280px;gap:2rem;}
@media(max-width:680px){.dash-grid{grid-template-columns:1fr;}}
.section-label{
  font-size:11px;font-weight:500;letter-spacing:0.08em;text-transform:uppercase;
  color:${text2};margin:0;
}
.section-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:0.875rem;}
.section-divider{margin:1.5rem 0 1.25rem;border:none;border-top:0.5px solid ${bdr};}
.view-link{font-size:13px;color:${ACCENT};text-decoration:none;}
.view-link:hover{text-decoration:underline;}
.session-card{
  display:flex;align-items:center;gap:14px;background:${bg1};border:0.5px solid ${bdr};
  border-radius:14px;padding:14px 16px;margin-bottom:8px;transition:border-color 0.15s,background 0.2s;
}
.session-card:hover{border-color:${bdr2};}
.session-time{min-width:68px;text-align:center;}
.time-main{font-size:14px;font-weight:500;color:${text1};margin:0;}
.time-end{font-size:12px;color:${text3};margin:0;}
.time-sep{width:0.5px;height:32px;background:${bdr};flex-shrink:0;}
.session-info{flex:1;}
.session-title{font-size:14px;font-weight:500;margin:0 0 2px;color:${text1};}
.session-sub{font-size:12px;color:${text2};margin:0;}
.btn-done{
  width:30px;height:30px;border-radius:50%;background:${doneBg};border:0.5px solid ${doneBdr};
  color:${doneTxt};display:flex;align-items:center;justify-content:center;cursor:pointer;
  font-size:14px;flex-shrink:0;
}
.btn-edit-sm{
  font-size:12px;padding:5px 10px;border-radius:8px;border:0.5px solid ${bdr};
  background:transparent;color:${text2};cursor:pointer;font-family:'DM Sans',sans-serif;
  transition:border-color 0.15s;
}
.btn-edit-sm:hover{border-color:${bdr2};}
.task-item{
  display:flex;align-items:center;justify-content:space-between;padding:12px 14px;
  border-radius:10px;border:0.5px solid ${bdr};margin-bottom:6px;background:${bg1};gap:12px;
  transition:background 0.2s,border-color 0.2s;
}
.task-title{font-size:14px;font-weight:400;margin:0 0 4px;color:${text1};}
.task-meta{display:flex;gap:6px;align-items:center;flex-wrap:wrap;}
.badge{font-size:11px;padding:3px 8px;border-radius:99px;border:0.5px solid ${bdr};color:${text2};background:${bg2};}
.badge-coll{background:${chip};color:${chipT};border-color:${chipH};}
.btn-schedule{
  font-size:12px;padding:6px 14px;border-radius:8px;border:0.5px solid ${ACCENT};
  color:${ACCENT};background:transparent;cursor:pointer;font-family:'DM Sans',sans-serif;
  white-space:nowrap;flex-shrink:0;transition:background 0.15s,color 0.15s;
}
.btn-schedule:hover{background:${ACCENT};color:#fff;}
.empty-state{
  padding:2rem;text-align:center;color:${text3};font-size:14px;
  background:${bg2};border-radius:12px;border:0.5px dashed ${bdr};
}
.sidebar{display:flex;flex-direction:column;}
.stat-cards{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:1.5rem;}
.stat-card{background:${bg2};border-radius:10px;padding:14px;text-align:center;transition:background 0.2s;}
.stat-num{font-size:26px;font-weight:500;color:${text1};line-height:1.1;}
.stat-lbl{font-size:11px;color:${text2};margin-top:2px;}
.coll-card{
  background:${bg1};border:0.5px solid ${bdr};border-radius:12px;padding:12px 14px;
  margin-bottom:8px;text-decoration:none;display:block;transition:border-color 0.15s,background 0.2s;
}
.coll-card:hover{border-color:${bdr2};}
.coll-name{font-size:14px;font-weight:500;color:${text1};margin:0 0 2px;}
.coll-desc{font-size:12px;color:${text2};margin:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.btn-add-coll{
  width:100%;padding:10px;border-radius:10px;border:0.5px dashed ${bdr2};background:transparent;
  color:${text2};font-family:'DM Sans',sans-serif;font-size:13px;cursor:pointer;
  display:flex;align-items:center;justify-content:center;gap:6px;
  transition:border-color 0.15s,color 0.15s;
}
.btn-add-coll:hover{border-color:${ACCENT};color:${ACCENT};}
.modal-overlay{
  position:fixed;inset:0;background:${overlay};
  display:flex;align-items:center;justify-content:center;z-index:200;
}
.modal-box{
  background:${bg1};border:0.5px solid ${bdr};border-radius:16px;
  padding:1.5rem;width:360px;max-width:92vw;
}
.modal-title{font-size:16px;font-weight:500;margin:0 0 1rem;color:${text1};}
.field-label{font-size:12px;color:${text2};margin-bottom:5px;display:block;}
.field-input{
  width:100%;background:${bg2};border:0.5px solid ${bdr};border-radius:10px;
  padding:9px 12px;font-family:'DM Sans',sans-serif;font-size:14px;color:${text1};
  outline:none;margin-bottom:12px;transition:border-color 0.15s;
}
.field-input:focus{border-color:${ACCENT};}
.modal-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:4px;}
.btn-cancel{
  padding:8px 16px;border-radius:8px;border:0.5px solid ${bdr};background:transparent;
  color:${text2};font-family:'DM Sans',sans-serif;font-size:13px;cursor:pointer;
}
.btn-create{
  padding:8px 18px;border-radius:8px;border:none;background:${ACCENT};color:#fff;
  font-family:'DM Sans',sans-serif;font-size:13px;font-weight:500;cursor:pointer;
}
.btn-create:hover{opacity:0.88;}
`;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────
function fmt(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}
const TODAY_STR = new Date().toLocaleDateString("en-US", {
  weekday: "long", month: "long", day: "numeric",
});

// ─── Main component ────────────────────────────────────────────────────────────
export default function Home() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Sync with the same localStorage key used by AllTasks & Calendar
  const [mode, setMode] = useState(() => localStorage.getItem("theme-mode") || "light");

  const [collections, setCollections] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [unscheduledTasks, setUnscheduledTasks] = useState([]);
  const [aiPrompt, setAiPrompt] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newCollName, setNewCollName] = useState("");
  const [newCollDesc, setNewCollDesc] = useState("");

  const theme  = useMemo(() => buildTheme(mode), [mode]);
  const styles = useMemo(() => makeStyles(mode), [mode]);

  const toggleTheme = () => {
    const next = mode === "light" ? "dark" : "light";
    setMode(next);
    localStorage.setItem("theme-mode", next);
  };

  const handleLogout = () => { logout(); navigate("/login"); };

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  useEffect(() => {
    // Only fetch if user is logged in
    if (!user) return;
    fetchData();
  }, [user]); // user is the dep

  const fetchData = async () => {
    setLoading(true);
    try {
      const [colRes, sessRes, taskRes] = await Promise.all([
        api.get("/collections"),
        api.get("/sessions"), // My newly modified session list
        api.get("/tasks/user"), // Use correct endpoint for tasks
      ]);
      setCollections(colRes.data || []);
      
      const allSessions = sessRes.data || [];
      const upcomingSessions = allSessions.filter(s => new Date(s.endTime) > new Date());
      setSessions(upcomingSessions.slice(0, 5));

      const allTasks = taskRes.data || [];
      const scheduledTaskIds = new Set(allSessions.map((s) => s.task?._id).filter(id => id));
      const unscheduled = allTasks.filter((t) => !scheduledTaskIds.has(t._id));
      
      setUnscheduledTasks(unscheduled.slice(0, 5));
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAiPlan = () => {
    if (!aiPrompt.trim()) return;
    console.log("Sending prompt to AI:", aiPrompt);
    alert("AI Planning feature coming soon!");
    setAiPrompt("");
  };

  const handleCreateCollection = async () => {
    if (!newCollName.trim()) return;
    try {
      await api.post("/collections", { name: newCollName, description: newCollDesc });
      setModalOpen(false);
      setNewCollName("");
      setNewCollDesc("");
      const res = await api.get("/collections");
      setCollections(res.data);
    } catch (err) {
      console.error("Error creating collection:", err);
    }
  };

  const handleMarkSessionDone = (id) => console.log("Mark session done:", id);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <style>{styles}</style>

      <div className="dash-root">

        {/* ── Header ── */}
        <div className="dash-header">
          <div>
            <p className="dash-greeting">
              {getGreeting()}{user?.name ? `, ${user.name.split(" ")[0]}.` : "."}
            </p>
            <p className="dash-date">{TODAY_STR}</p>
          </div>
          <div className="dash-header-right">
            <button className="btn-logout" onClick={handleLogout}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Logout
            </button>
            <button className="btn-theme" onClick={toggleTheme} title="Toggle theme">
              {mode === "dark" ? "☀" : "☾"}
            </button>
            <div className="dash-avatar">{initials}</div>
          </div>
        </div>

        {/* ── AI Planner ── */}
        <div className="ai-box">
          <p className="ai-label">AI Planner</p>
          <div className="ai-input-row">
            <input
              className="ai-input"
              placeholder="e.g. Schedule my tasks for this week…"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAiPlan()}
            />
            <button className="btn-plan" onClick={handleAiPlan}>Plan</button>
          </div>
          <div className="chip-row">
            {["Plan my university work", "Organize MVP tasks", "Suggest a daily schedule"].map((s) => (
              <button key={s} className="chip" onClick={() => setAiPrompt(s)}>{s}</button>
            ))}
          </div>
        </div>

        {/* ── Main grid ── */}
        <div className="dash-grid">

          {/* Left column */}
          <div>
            <div className="section-header">
              <p className="section-label">Today's sessions</p>
              <Link className="view-link" to="/calendar-view">View calendar</Link>
            </div>

            {loading ? (
              <div className="empty-state">Loading…</div>
            ) : sessions.length === 0 ? (
              <div className="empty-state">No sessions scheduled for today.</div>
            ) : sessions.map((s) => (
              <div className="session-card" key={s._id}>
                <div className="session-time">
                  <p className="time-main">{fmt(s.startTime)}</p>
                  <p className="time-end">{fmt(s.endTime)}</p>
                </div>
                <div className="time-sep" />
                <div className="session-info">
                  <p className="session-title">{s.task?.title || "Untitled Task"}</p>
                  <p className="session-sub">
                    {s.task?.collectionId ? `Collection: ${s.task.collectionId}` : "No collection"}
                  </p>
                </div>
                <button className="btn-done" onClick={() => handleMarkSessionDone(s._id)}>✓</button>
                <button className="btn-edit-sm">Edit</button>
              </div>
            ))}

            <hr className="section-divider" />

            <div className="section-header">
              <p className="section-label">Tasks to schedule</p>
              <Link className="view-link" to="/all-tasks">View all</Link>
            </div>

            {!loading && unscheduledTasks.length === 0 ? (
              <div className="empty-state">All tasks are scheduled!</div>
            ) : unscheduledTasks.map((t) => (
              <div className="task-item" key={t._id}>
                <div>
                  <p className="task-title">{t.title}</p>
                  <div className="task-meta">
                    <span className="badge">{t.estimation} min</span>
                    {t.collectionId && <span className="badge badge-coll">{t.collectionId}</span>}
                  </div>
                </div>
                <button className="btn-schedule">Schedule</button>
              </div>
            ))}
          </div>

          {/* Sidebar */}
          <div className="sidebar">
            <div className="stat-cards">
              {[
                { num: sessions.length,       lbl: "Sessions today" },
                { num: unscheduledTasks.length, lbl: "To schedule"   },
                { num: collections.length,      lbl: "Collections"   },
                { num: "—",                     lbl: "Week streak"   },
              ].map(({ num, lbl }) => (
                <div className="stat-card" key={lbl}>
                  <div className="stat-num">{num}</div>
                  <div className="stat-lbl">{lbl}</div>
                </div>
              ))}
            </div>

            <div className="section-header" style={{ marginBottom: "0.75rem" }}>
              <p className="section-label">Collections</p>
            </div>

            {collections.map((c) => (
              <Link className="coll-card" to={`/collections/${c._id}`} key={c._id}>
                <p className="coll-name">{c.name}</p>
                <p className="coll-desc">{c.description}</p>
              </Link>
            ))}

            <button className="btn-add-coll" onClick={() => setModalOpen(true)}>
              <span style={{ fontSize: 16 }}>+</span> New collection
            </button>
          </div>
        </div>

        {/* ── Create Collection Modal ── */}
        {modalOpen && (
          <div className="modal-overlay" onClick={() => setModalOpen(false)}>
            <div className="modal-box" onClick={(e) => e.stopPropagation()}>
              <p className="modal-title">New collection</p>
              <label className="field-label">Name</label>
              <input
                className="field-input"
                autoFocus
                placeholder="e.g. University"
                value={newCollName}
                onChange={(e) => setNewCollName(e.target.value)}
              />
              <label className="field-label">Description</label>
              <input
                className="field-input"
                placeholder="Optional description…"
                value={newCollDesc}
                onChange={(e) => setNewCollDesc(e.target.value)}
              />
              <div className="modal-actions">
                <button className="btn-cancel" onClick={() => setModalOpen(false)}>Cancel</button>
                <button className="btn-create" onClick={handleCreateCollection}>Create</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </ThemeProvider>
  );
}
