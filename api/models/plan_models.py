from pydantic import BaseModel
from typing import List, Dict, Any, Optional



class StartRequest(BaseModel):
    tasks: List[Dict]          # existing tasks (busy slots)
    project: str              # project description from the user
    model: str = "llama-3.1-8b-instant"
    temperature: float = 0.7
    startDate: str
    endDate: str


class ChatRequest(BaseModel):
    prompt: str
    # allow either a JSON string or a structured object for the current plan
    current_plan: Optional[Dict] | str = "{}"
    temperature: float = 0.7

class Prompt(BaseModel):
    prompt: str
    memory: str | None = "[]"  # ✅ optional, defaults to empty array

class UpdateRequest(BaseModel):
    sessionId: str
    message: str
    model: str = "llama-3.1-8b-instant"
    temperature: float = 0.7


# ── Mirrors task.model.js ────────────────────────────────────────────────────
class TaskSchema(BaseModel):
    title: str
    description: Optional[str] = ""
    priority: int = 5            # 0 = highest, 10 = lowest
    estimation: int              # duration in minutes
    status: str = "pending"      # "pending" | "in progress" | "done"


# ── Mirrors session.model.js ─────────────────────────────────────────────────
class SessionSchema(BaseModel):
    task_index: int              # index into the tasks array (resolved before DB insert)
    startTime: str               # ISO 8601
    endTime: str                 # ISO 8601
    description: Optional[str] = ""
    status: str = "pending"      # "pending" | "in progress" | "done"


# ── API response ─────────────────────────────────────────────────────────────
class PlanResponse(BaseModel):
    tasks: List[Dict[str, Any]]
    sessions: List[Dict[str, Any]]
    explanation: str


# Keep ChatResponse as an alias so existing routes don't break

class TestPromptRequest(BaseModel):
    tasks: List[Dict]
    project: str

    
ChatResponse = PlanResponse