from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict
import httpx
import uuid

from free_slots_finder import generate_planning_prompt
from postprocess import convert_plan_reply_to_json

app = FastAPI(title="Free Time Slot Finder API")

OPENROUTER_API_KEY = "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"
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"




# ------------------ MODELS ------------------

class StartRequest(BaseModel):
    data: List[Dict]
    project: str
    model: str = "gpt-4o-mini"
    temperature: float = 0.7


class ChatRequest(BaseModel):
    sessionId: str
    message: str


class ChatResponse(BaseModel):
    sessionId: str
    plan: List[Dict]
    explanation: str

sessions = {}
@app.post("/plan/start", response_model=ChatResponse)
async def start_plan(req: StartRequest):

    prompt = generate_planning_prompt(req.data, req.project)

    payload = {
        "model": req.model,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": req.temperature
    }

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json"
    }

    async with httpx.AsyncClient(timeout=60) as client:
        response = await client.post(OPENROUTER_URL, json=payload, headers=headers)

    if response.status_code != 200:
        raise HTTPException(status_code=500, detail=response.text)

    data = response.json()
    ai_text = data["choices"][0]["message"]["content"]

    parsed = convert_plan_reply_to_json(ai_text)

    session_id = str(uuid.uuid4())

    sessions[session_id] = {
        "project": req.project,
        "tasks": req.data,
        "plan": parsed["plan"],
        "messages": [
            {"role": "user", "content": prompt},
            {"role": "assistant", "content": ai_text}
        ]
    }

    return ChatResponse(
        sessionId=session_id,
        plan=parsed["plan"],
        explanation=parsed["explanation"]
    )
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict
import httpx
import uuid

from free_slots_finder import generate_planning_prompt
from postprocess import convert_plan_reply_to_json

app = FastAPI(title="AI Planner API")

OPENROUTER_API_KEY = "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"
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"

sessions = {}

# ------------------ MODELS ------------------

class StartRequest(BaseModel):
    data: List[Dict]
    project: str
    model: str = "gpt-4o-mini"
    temperature: float = 0.7


class ChatRequest(BaseModel):
    sessionId: str
    message: str


class ChatResponse(BaseModel):
    sessionId: str
    plan: List[Dict]
    explanation: str


# ------------------ START PLAN ------------------

@app.post("/plan/start", response_model=ChatResponse)
async def start_plan(req: StartRequest):

    prompt = generate_planning_prompt(req.data, req.project)

    payload = {
        "model": req.model,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": req.temperature
    }

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json"
    }

    async with httpx.AsyncClient(timeout=60) as client:
        response = await client.post(OPENROUTER_URL, json=payload, headers=headers)

    if response.status_code != 200:
        raise HTTPException(status_code=500, detail=response.text)

    data = response.json()
    ai_text = data["choices"][0]["message"]["content"]

    parsed = convert_plan_reply_to_json(ai_text)

    session_id = str(uuid.uuid4())

    sessions[session_id] = {
        "project": req.project,
        "tasks": req.data,
        "plan": parsed["plan"],
        "messages": [
            {"role": "user", "content": prompt},
            {"role": "assistant", "content": ai_text}
        ]
    }

    return ChatResponse(
        sessionId=session_id,
        plan=parsed["plan"],
        explanation=parsed["explanation"]
    )


# ------------------ CHAT WITH PLAN ------------------

@app.post("/plan/chat", response_model=ChatResponse)
async def chat_with_plan(req: ChatRequest):

    if req.sessionId not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")

    session = sessions[req.sessionId]

    session["messages"].append({
        "role": "user",
        "content": req.message
    })

    payload = {
        "model": "gpt-4o-mini",
        "messages": session["messages"],
        "temperature": 0.7
    }

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json"
    }

    async with httpx.AsyncClient(timeout=60) as client:
        response = await client.post(OPENROUTER_URL, json=payload, headers=headers)

    if response.status_code != 200:
        raise HTTPException(status_code=500, detail=response.text)

    data = response.json()
    ai_text = data["choices"][0]["message"]["content"]

    session["messages"].append({
        "role": "assistant",
        "content": ai_text
    })

    parsed = convert_plan_reply_to_json(ai_text)
    session["plan"] = parsed["plan"]

    return ChatResponse(
        sessionId=req.sessionId,
        plan=parsed["plan"],
        explanation=parsed["explanation"]
    )


class ChatUpdate(BaseModel):
    session_id: str
    message: str

import json
# Request model
class UpdateRequest(BaseModel):
    sessionId: str
    message: str
    model: str = "gpt-4o-mini"
    temperature: float = 0.7

def build_update_prompt(session: dict, user_message: str) -> str:
    """
    Build a prompt for updating an existing plan based on the user's latest request.

    Args:
        session: dict containing at least 'plan' key (list of tasks)
        user_message: str containing user's latest request/change

    Returns:
        str: prompt ready to send to the AI
    """
    current_plan_json = json.dumps(session.get("plan", []), indent=2)

    prompt = f"""
You are a scheduling assistant.

CURRENT PLAN:
{current_plan_json}

USER REQUEST:
{user_message}

Update the plan according to the user's request.

Return STRICT FORMAT ONLY:

PLAN
1. Title:
   Description:
   Start:
   End:
   Priority:
   Status:
...
EXPLANATION
...
"""
    return prompt

@app.post("/plan/update", response_model=ChatResponse)
async def update_plan(req: UpdateRequest):
    # 1️⃣ Validate session
    if req.sessionId not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")

    session = sessions[req.sessionId]

    # 2️⃣ Build prompt for updating the plan
    prompt = build_update_prompt(session, req.message)

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": req.model,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": req.temperature
    }

    # 3️⃣ Send prompt to AI
    async with httpx.AsyncClient(timeout=60) as client:
        response = await client.post(OPENROUTER_URL, json=payload, headers=headers)

    if response.status_code != 200:
        raise HTTPException(status_code=500, detail=f"AI request failed: {response.text}")

    data = response.json()
    ai_text = data.get("choices", [{}])[0].get("message", {}).get("content", "")

    # 4️⃣ Parse AI output into plan JSON
    parsed = convert_plan_reply_to_json(ai_text)

    # 5️⃣ Update session
    session["plan"] = parsed["plan"]
    session.setdefault("messages", []).append({
        "role": "user",
        "content": req.message
    })
    session["messages"].append({
        "role": "assistant",
        "content": ai_text
    })

    return ChatResponse(
        sessionId=req.sessionId,
        plan=parsed["plan"],
        explanation=parsed["explanation"]
    )


