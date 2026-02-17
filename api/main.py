from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Dict
from free_slots_finder import generate_planning_prompt
from postprocess import convert_plan_reply_to_json
import requests

app = FastAPI(title="Free Time Slot Finder API")

OPENROUTER_API_KEY = "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"
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"


class ChatRequest(BaseModel):
    data: List[Dict]  # list of tasks
    project: str       # project description
    model: str = "gpt-4o-mini"
    temperature: float = 0.7


class ChatResponse(BaseModel):
    plan: List[Dict]
    explanation: str


@app.post("/ask", response_model=ChatResponse)
def openrouter_chat(req: ChatRequest):
    # Generate prompt
    prompt = generate_planning_prompt(req.data, req.project)

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": req.model,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": req.temperature
    }

    response = requests.post(OPENROUTER_URL, json=payload, headers=headers)

    if response.status_code != 200:
        return ChatResponse(plan=[], explanation=f"Error: {response.status_code} - {response.text}")

    data = response.json()
    ai_text = data.get("choices", [{}])[0].get("message", {}).get("content", "")

    # Parse AI output into JSON
    parsed = convert_plan_reply_to_json(ai_text)

    return ChatResponse(plan=parsed["plan"], explanation=parsed["explanation"])
