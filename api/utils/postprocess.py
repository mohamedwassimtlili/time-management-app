import json
from fastapi import HTTPException
import re

# Valid status values — must match both task.model.js and session.model.js
VALID_STATUSES = {"pending", "in progress", "done"}



VALID_STATUSES = {"pending", "in_progress", "done", "cancelled"}


def convert_plan_reply_to_json(reply_text: str) -> dict:
    """
    Parse and validate the AI's JSON response.

    Expected shape:
        {
          "tasks":    [ { title, description, priority, estimation, status } ],
          "sessions": [ { task_index, startTime, endTime, description, status } ],
          "explanation": "..."
        }

    Returns a dict with the same three keys, each value normalised and
    validated against the database schema.

    Raises HTTPException(500) on any structural or type error.
    """

    # ── 1. Parse JSON ─────────────────────────────────────────────────────────
    # Strip accidental markdown fences the model sometimes adds
    cleaned = re.sub(r"```(?:json)?\s*|\s*```", "", reply_text).strip()

    try:
        data = json.loads(cleaned)
    except json.JSONDecodeError as exc:
        raise HTTPException(
            status_code=500,
            detail=f"AI response is not valid JSON: {exc}"
        )

    if not isinstance(data, dict):
        raise HTTPException(status_code=500, detail="AI response must be a JSON object")

    # ── 2. Extract top-level keys ─────────────────────────────────────────────
    raw_tasks = data.get("tasks")
    raw_sessions = data.get("sessions")
    explanation = data.get("explanation", "")

    if not isinstance(raw_tasks, list) or not isinstance(raw_sessions, list):
        raise HTTPException(
            status_code=500,
            detail="AI response must contain 'tasks' and 'sessions' arrays"
        )

    # ── 3. Normalise & validate tasks ─────────────────────────────────────────
    # Schema: title*, description, priority, estimation*, status
    # (* = required)
    normalized_tasks = []
    for i, task in enumerate(raw_tasks):
        if not isinstance(task, dict):
            raise HTTPException(status_code=500, detail=f"Task {i} is not an object")

        title = str(task.get("title", "")).strip()
        if not title:
            raise HTTPException(status_code=500, detail=f"Task {i} is missing 'title'")

        try:
            estimation = int(task.get("estimation", 0))
        except (TypeError, ValueError):
            raise HTTPException(
                status_code=500,
                detail=f"Task {i} has invalid 'estimation' (must be integer minutes)"
            )
        if estimation < 0:
            raise HTTPException(
                status_code=500,
                detail=f"Task {i} has negative 'estimation'"
            )

        try:
            priority = int(task.get("priority", 5))
        except (TypeError, ValueError):
            priority = 5

        status = str(task.get("status", "pending")).strip().lower()
        if status not in VALID_STATUSES:
            status = "pending"

        normalized_tasks.append({
            "title": title,
            "description": str(task.get("description", "")).strip(),
            "priority": max(0, min(10, priority)),  # clamp to 0–10
            "estimation": estimation,
            "status": status,
        })

    # ── 4. Normalise & validate sessions ──────────────────────────────────────
    # Schema: task_index*, startTime*, endTime*, description, status
    normalized_sessions = []
    for i, session in enumerate(raw_sessions):
        if not isinstance(session, dict):
            raise HTTPException(status_code=500, detail=f"Session {i} is not an object")

        # task_index — must be a valid int referencing the tasks array
        task_index = session.get("task_index")
        if task_index is None:
            raise HTTPException(
                status_code=500,
                detail=f"Session {i} is missing 'task_index'"
            )
        try:
            task_index = int(task_index)
        except (TypeError, ValueError):
            raise HTTPException(
                status_code=500,
                detail=f"Session {i} 'task_index' must be an integer"
            )
        if task_index < 0 or task_index >= len(normalized_tasks):
            raise HTTPException(
                status_code=500,
                detail=(
                    f"Session {i} has out-of-range task_index={task_index} "
                    f"(tasks array has {len(normalized_tasks)} items)"
                )
            )

        # startTime / endTime — required, must be non-empty strings
        start_time = str(session.get("startTime", "")).strip()
        end_time = str(session.get("endTime", "")).strip()
        if not start_time or not end_time:
            raise HTTPException(
                status_code=500,
                detail=f"Session {i} is missing 'startTime' or 'endTime'"
            )

        # Basic temporal sanity check (string comparison works for ISO 8601)
        if end_time <= start_time:
            raise HTTPException(
                status_code=500,
                detail=f"Session {i} has endTime <= startTime"
            )

        status = str(session.get("status", "pending")).strip().lower()
        if status not in VALID_STATUSES:
            status = "pending"

        normalized_sessions.append({
            "task_index": task_index,
            "startTime": start_time,
            "endTime": end_time,
            "description": str(session.get("description", "")).strip(),
            "status": status,
        })

    # ── 5. Return ─────────────────────────────────────────────────────────────
    return {
        "tasks": normalized_tasks,
        "sessions": normalized_sessions,
        "explanation": str(explanation).strip(),
    }