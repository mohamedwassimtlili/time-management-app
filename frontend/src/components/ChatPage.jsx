import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import { useAuth } from "../context/AuthContext";

// ─── Constants ─────────────────────────────────────────────────────────────────
const ACCENT = "#534AB7";

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

function makeStyles(mode) {
  const dark = mode === "dark";
  const bg0        = dark ? "#0a0a0a" : "#f7f7f5";
  const bg1        = dark ? "#1a1a1a" : "#ffffff";
  const bg2        = dark ? "#242424" : "#f2f2f0";
  const text1      = dark ? "#f0f0f0" : "#1a1a1a";
  const text2      = dark ? "#999"    : "#666";
  const text3      = dark ? "#666"    : "#aaa";
  const bdr        = dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)";
  const bdr2       = dark ? "rgba(255,255,255,0.16)" : "rgba(0,0,0,0.2)";
  const chip       = dark ? "#2a2560" : "#EEEDFE";
  const userBubble = dark ? "#3b3380" : ACCENT;
  const aiBubble   = dark ? "#1e1e1e" : "#ffffff";
  const aiBdr      = dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";
  const codeBlock  = dark ? "#0d0d0d" : "#f0eff8";
  const codeBdr    = dark ? "rgba(255,255,255,0.06)" : "rgba(83,74,183,0.15)";

  return `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&family=DM+Serif+Display:ital@0;1&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}

.chat-root{
  font-family:'DM Sans',sans-serif;
  background:${bg0};color:${text1};
  height:100vh;display:flex;flex-direction:column;
  transition:background 0.2s,color 0.2s;
}

/* Header */
.chat-header{
  display:flex;align-items:center;justify-content:space-between;
  padding:0 1.5rem;height:58px;
  border-bottom:0.5px solid ${bdr};background:${bg1};
  flex-shrink:0;position:sticky;top:0;z-index:10;
}
.chat-header-left{display:flex;align-items:center;gap:12px;}
.btn-back{
  display:flex;align-items:center;gap:6px;padding:6px 12px;border-radius:8px;
  border:0.5px solid ${bdr};background:transparent;color:${text2};
  font-family:'DM Sans',sans-serif;font-size:13px;cursor:pointer;
  transition:border-color 0.15s,color 0.15s;
}
.btn-back:hover{border-color:${bdr2};color:${text1};}
.agent-icon{
  width:30px;height:30px;border-radius:50%;background:${chip};
  display:flex;align-items:center;justify-content:center;font-size:15px;
}
.agent-name{font-size:14px;font-weight:500;color:${text1};}
.agent-status{font-size:11px;color:#4ade80;display:flex;align-items:center;gap:4px;}
.agent-status::before{content:'';width:6px;height:6px;border-radius:50%;background:#4ade80;display:inline-block;}
.chat-header-right{display:flex;align-items:center;gap:8px;}
.btn-theme{
  width:34px;height:34px;border-radius:50%;border:0.5px solid ${bdr};
  background:transparent;color:${text1};display:flex;align-items:center;
  justify-content:center;cursor:pointer;font-size:16px;transition:border-color 0.15s;
}
.btn-theme:hover{border-color:${bdr2};}
.btn-clear{
  padding:6px 12px;border-radius:8px;border:0.5px solid ${bdr};
  background:transparent;color:${text2};font-family:'DM Sans',sans-serif;
  font-size:12px;cursor:pointer;transition:border-color 0.15s,color 0.15s;
}
.btn-clear:hover{border-color:#f87171;color:#f87171;}

/* Messages */
.chat-messages{
  flex:1;overflow-y:auto;padding:1.5rem 0;
  display:flex;flex-direction:column;gap:0;scroll-behavior:smooth;
}
.chat-messages::-webkit-scrollbar{width:4px;}
.chat-messages::-webkit-scrollbar-thumb{background:${bdr2};border-radius:99px;}

.msg-group{
  display:flex;flex-direction:column;
  padding:0.35rem 1.5rem;
  max-width:820px;width:100%;margin:0 auto;
}
.msg-group.user{align-items:flex-end;}
.msg-group.ai{align-items:flex-start;}
.msg-sender{
  font-size:11px;color:${text3};margin-bottom:5px;
  letter-spacing:0.04em;font-weight:500;text-transform:uppercase;
}
.msg-group.user .msg-sender{text-align:right;}
.msg-bubble{
  max-width:72%;padding:11px 16px;border-radius:14px;
  font-size:14px;line-height:1.65;
  animation:fadeUp 0.2s ease;
}
@keyframes fadeUp{from{opacity:0;transform:translateY(6px);}to{opacity:1;transform:none;}}
.msg-bubble.user{
  background:${userBubble};color:#fff;
  border-radius:14px 14px 4px 14px;
}
.msg-bubble.ai{
  background:${aiBubble};border:0.5px solid ${aiBdr};color:${text1};
  border-radius:14px 14px 14px 4px;
}
.msg-bubble.ai p{margin:0 0 0.6em;}
.msg-bubble.ai p:last-child{margin-bottom:0;}
.msg-bubble.ai strong{font-weight:600;}
.msg-bubble.ai em{font-style:italic;}
.msg-bubble.ai ul,.msg-bubble.ai ol{padding-left:1.4em;margin:0.4em 0;}
.msg-bubble.ai li{margin-bottom:0.25em;}
.msg-bubble.ai code{
  font-family:'JetBrains Mono','Fira Code',monospace;font-size:0.8em;
  background:${codeBlock};border:0.5px solid ${codeBdr};padding:1px 5px;border-radius:4px;
}
.msg-bubble.ai pre{
  background:${codeBlock};border:0.5px solid ${codeBdr};
  border-radius:10px;padding:12px 14px;overflow-x:auto;margin:0.6em 0;
}
.msg-bubble.ai pre code{background:none;border:none;padding:0;font-size:0.8em;line-height:1.6;}
.msg-bubble.ai h1,.msg-bubble.ai h2,.msg-bubble.ai h3{
  font-family:'DM Serif Display',serif;font-weight:400;margin:0.6em 0 0.3em;
}
.msg-time{font-size:11px;color:${text3};margin-top:4px;padding:0 2px;}

/* Typing indicator */
.typing-bubble{
  display:flex;align-items:center;gap:5px;
  background:${aiBubble};border:0.5px solid ${aiBdr};
  padding:12px 16px;border-radius:14px 14px 14px 4px;width:fit-content;
}
.typing-dot{
  width:7px;height:7px;border-radius:50%;background:${text3};
  animation:bounce 1.2s infinite;
}
.typing-dot:nth-child(2){animation-delay:0.2s;}
.typing-dot:nth-child(3){animation-delay:0.4s;}
@keyframes bounce{0%,60%,100%{transform:translateY(0);}30%{transform:translateY(-5px);}}

/* Empty state */
.chat-empty{
  flex:1;display:flex;flex-direction:column;align-items:center;
  justify-content:center;gap:1rem;padding:2rem;
}
.chat-empty-icon{
  width:56px;height:56px;border-radius:50%;background:${chip};
  display:flex;align-items:center;justify-content:center;font-size:26px;
}
.chat-empty-title{
  font-family:'DM Serif Display',serif;font-size:22px;font-weight:400;
  font-style:italic;color:${text1};text-align:center;
}
.chat-empty-sub{
  font-size:13px;color:${text2};text-align:center;max-width:320px;line-height:1.6;
}
.suggestion-chips{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-top:0.5rem;}
.sugg-chip{
  background:${bg2};color:${text2};border:0.5px solid ${bdr};
  border-radius:99px;padding:7px 14px;font-size:13px;
  font-family:'DM Sans',sans-serif;cursor:pointer;
  transition:border-color 0.15s,color 0.15s,background 0.15s;
}
.sugg-chip:hover{border-color:${ACCENT};color:${ACCENT};background:${chip};}

/* Input area */
.chat-input-area{
  border-top:0.5px solid ${bdr};background:${bg1};
  padding:1rem 1.5rem 1.25rem;flex-shrink:0;
}
.chat-input-inner{max-width:820px;margin:0 auto;display:flex;gap:10px;align-items:flex-end;}
.chat-textarea{
  flex:1;background:${bg2};border:0.5px solid ${bdr};border-radius:12px;
  padding:10px 14px;font-family:'DM Sans',sans-serif;font-size:14px;
  color:${text1};outline:none;resize:none;line-height:1.5;
  min-height:42px;max-height:160px;overflow-y:auto;transition:border-color 0.15s;
}
.chat-textarea:focus{border-color:${ACCENT};}
.chat-textarea::placeholder{color:${text3};}
.btn-send{
  width:42px;height:42px;border-radius:10px;border:none;
  background:${ACCENT};color:#fff;
  display:flex;align-items:center;justify-content:center;
  cursor:pointer;flex-shrink:0;transition:opacity 0.15s,transform 0.1s;
}
.btn-send:hover{opacity:0.88;}
.btn-send:active{transform:scale(0.94);}
.btn-send:disabled{opacity:0.38;cursor:not-allowed;}
.chat-hint{
  max-width:820px;margin:6px auto 0;
  font-size:11px;color:${text3};text-align:center;
}
`;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────
function timeFmt(d) {
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function renderMarkdown(text) {
  return text
    .replace(/```([\s\S]*?)```/g, "<pre><code>$1</code></pre>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/(<li>[\s\S]+?<\/li>)/g, "<ul>$1</ul>")
    .replace(/\n\n/g, "</p><p>")
    .replace(/^(?!<[hup\/]|<li|<pre)(.+)$/gm, "<p>$1</p>")
    .replace(/<p><\/p>/g, "");
}

function SendIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13"/>
      <polygon points="22 2 15 22 11 13 2 9 22 2"/>
    </svg>
  );
}

function BackIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6"/>
    </svg>
  );
}

const SUGGESTIONS = [
  "Plan my university work",
  "Organize my MVP tasks",
  "Suggest a daily schedule",
  "What should I focus on today?",
];

// ─── Component ─────────────────────────────────────────────────────────────────
export default function ChatPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [mode, setMode]       = useState(() => localStorage.getItem("theme-mode") || "light");
  const [messages, setMessages] = useState([]);
  const [input, setInput]     = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const theme  = useMemo(() => buildTheme(mode), [mode]);
  const styles = useMemo(() => makeStyles(mode), [mode]);
  const bottomRef   = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Fire initial prompt if navigated from Home with state
  useEffect(() => {
    const p = location.state?.prompt;
    if (p) sendMessage(p);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleTheme = () => {
    const next = mode === "light" ? "dark" : "light";
    setMode(next);
    localStorage.setItem("theme-mode", next);
  };

  const sendMessage = async (overrideText) => {
    const trimmed = (overrideText ?? input).trim();
    if (!trimmed || isTyping) return;

    const userMsg = { role: "user", content: trimmed, time: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "42px";
    setIsTyping(true);

    try {
      const history = [...messages, userMsg].map((m) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content,
      }));

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: `You are a smart productivity and planning assistant built into a task management dashboard.
You help users plan their work, schedule tasks, manage collections, and stay productive.
The user's name is ${user?.name || "there"}. Be concise, friendly, and actionable.`,
          messages: history,
        }),
      });

      const data = await res.json();
      const reply =
        data.content?.find((b) => b.type === "text")?.text ||
        "Sorry, I couldn't generate a response.";

      setMessages((prev) => [...prev, { role: "assistant", content: reply, time: new Date() }]);
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Something went wrong. Please try again.", time: new Date() },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleInput = (e) => {
    setInput(e.target.value);
    const el = textareaRef.current;
    if (el) {
      el.style.height = "42px";
      el.style.height = Math.min(el.scrollHeight, 160) + "px";
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <style>{styles}</style>

      <div className="chat-root">

        {/* Header */}
        <div className="chat-header">
          <div className="chat-header-left">
            <button className="btn-back" onClick={() => navigate(-1)}>
              <BackIcon /> Back
            </button>
            <div className="agent-icon">🤖</div>
            <div>
              <div className="agent-name">AI Planner</div>
              <div className="agent-status">Online</div>
            </div>
          </div>
          <div className="chat-header-right">
            {messages.length > 0 && (
              <button className="btn-clear" onClick={() => setMessages([])}>Clear chat</button>
            )}
            <button className="btn-theme" onClick={toggleTheme} title="Toggle theme">
              {mode === "dark" ? "☀" : "☾"}
            </button>
          </div>
        </div>

        {/* Messages / Empty state */}
        {messages.length === 0 && !isTyping ? (
          <div className="chat-empty">
            <div className="chat-empty-icon">🤖</div>
            <div className="chat-empty-title">
              How can I help you{user?.name ? `, ${user.name.split(" ")[0]}` : ""}?
            </div>
            <p className="chat-empty-sub">
              Ask me to plan your week, schedule tasks, organize collections, or anything productivity-related.
            </p>
            <div className="suggestion-chips">
              {SUGGESTIONS.map((s) => (
                <button key={s} className="sugg-chip" onClick={() => sendMessage(s)}>{s}</button>
              ))}
            </div>
          </div>
        ) : (
          <div className="chat-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`msg-group ${msg.role === "user" ? "user" : "ai"}`}>
                <div className="msg-sender">
                  {msg.role === "user" ? (user?.name?.split(" ")[0] || "You") : "AI Planner"}
                </div>
                {msg.role === "assistant" ? (
                  <div
                    className="msg-bubble ai"
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
                  />
                ) : (
                  <div className="msg-bubble user">{msg.content}</div>
                )}
                <div className="msg-time">{timeFmt(msg.time)}</div>
              </div>
            ))}

            {isTyping && (
              <div className="msg-group ai">
                <div className="msg-sender">AI Planner</div>
                <div className="typing-bubble">
                  <div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}

        {/* Input */}
        <div className="chat-input-area">
          <div className="chat-input-inner">
            <textarea
              ref={textareaRef}
              className="chat-textarea"
              rows={1}
              placeholder="Ask me anything about your tasks…"
              value={input}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
            />
            <button
              className="btn-send"
              onClick={() => sendMessage()}
              disabled={!input.trim() || isTyping}
              title="Send (Enter)"
            >
              <SendIcon />
            </button>
          </div>
          <p className="chat-hint">Enter to send · Shift+Enter for new line</p>
        </div>

      </div>
    </ThemeProvider>
  );
}