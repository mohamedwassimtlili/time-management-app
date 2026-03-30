import httpx
import uuid
import json
import os
from models.plan_models import ChatResponse
from utils.free_slots_finder import generate_planning_prompt, build_messages
from utils.postprocess import convert_plan_reply_to_json
from utils.llm_caller import call_llm
from utils.prompt import get_intent_system_prompt
import datetime
OPENROUTER_API_KEY = os.getenv("MY_API_KEY")
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
MODEL="llama-3.1-8b-instant"
current_year = datetime.datetime.now().year
INTENT_SYSTEM_PROMPT = get_intent_system_prompt(current_year)


#send a prompt to llm

async def general_question(req):
    messages = [
        {"role": "system", "content": "You are a helpful planning assistant."},
        {"role": "user", "content": req.prompt}
    ]
    response = await call_llm(MODEL, messages=messages, temperature=0.5, url=GROQ_URL)
    return {"answer": response["choices"][0]["message"]["content"]}

       
#generate a plan based on time constraints and the project description
async def start_plan_service(req):
    """
    1. Compute free slots from the user's existing tasks.
    2. Ask the AI to decompose `req.project` into tasks + sessions.
    3. Validate and normalise the response.
    4. Store in session and return.
    """
    #generate prompt 
    #def generate_planning_prompt(tasks: list, project_desc: str, start_date: str = None, end_date: str = None) -> str:
    print(req)
    prompt = generate_planning_prompt(req.tasks, req.project,start_date=req.startDate,end_date=req.endDate)
    #get ai response 
    # call_llm expects a `messages` list; build a single-user message from the prompt
    response = await call_llm(
        MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=req.temperature,
        url=GROQ_URL,
    )
   
    print(response)
    ai_text = response["choices"][0]["message"]["content"]
    parsed = convert_plan_reply_to_json(ai_text)   # tasks + sessions + explanation
    

    return ChatResponse(
        tasks=parsed["tasks"],
        sessions=parsed["sessions"],
        explanation=parsed["explanation"],
    )



async def chat_with_plan_service(req):
    # support either a JSON string or a structured object for current_plan
    current_plan = {"tasks": [], "sessions": []}
    try:
        if isinstance(req.current_plan, str):
            current_plan = json.loads(req.current_plan)
        elif isinstance(req.current_plan, dict) or isinstance(req.current_plan, list):
            current_plan = req.current_plan
    except (json.JSONDecodeError, TypeError):
        current_plan = {"tasks": [], "sessions": []}

    messages = build_messages(
        prompt=req.prompt,
        current_plan=current_plan,
    )

    response = await call_llm(MODEL, messages=messages, temperature=0.7, url=GROQ_URL)
    ai_text = response["choices"][0]["message"]["content"]
    parsed = convert_plan_reply_to_json(ai_text)

    return ChatResponse(
        tasks=parsed["tasks"],
        sessions=parsed["sessions"],
        explanation=parsed["explanation"],
    )


async def detect_intent(prompt: str) -> dict:
    """
    Detects the intent of a user prompt.
    Returns a dict with keys: intent, confidence, reason
    """
    messages = [
        {"role": "system", "content": INTENT_SYSTEM_PROMPT},
        {"role": "user", "content": prompt}
    ]

    response = await call_llm(
        model=MODEL,
        messages=messages,
        temperature=0.0,  # deterministic for classification
        url=GROQ_URL
    )

    raw = response["choices"][0]["message"]["content"]

    try:
        result = json.loads(raw)
    except json.JSONDecodeError:
        # Fallback if model doesn't respect the format
        result = {
            "intent": "general_question",
            "confidence": 0.0,
            "reason": "Failed to parse model response"
        }

    # Validate the intent value
    valid_intents = {"generate_plan", "generate_plan_no_dates", "modify_plan", "plan_question", "general_question"}

    if result.get("intent") not in valid_intents:
        result["intent"] = "general_question"

    return result