from fastapi import APIRouter, HTTPException
from models.plan_models import StartRequest, ChatResponse, ChatRequest, TestPromptRequest,Prompt,PlanResponse
from controllers.plan_controller import (
    start_plan_controller,
    chat_with_plan_controller,
    general_question_controller,
    detect_intent_controller,
    handle_prompt_controller
    
)
from services.plan_services import detect_intent
from utils.free_slots_finder import generate_planning_prompt
from utils.postprocess import convert_plan_reply_to_json
from utils.llm_caller import call_llm
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
MODEL = "llama-3.1-8b-instant"


@router.post("/test-ai-token")
async def test_ai_token(req:Prompt):
    print(Prompt)
    return await general_question_controller(req)


@router.post("/plan/start", response_model=PlanResponse)
async def start_plan(req: StartRequest):
    return await start_plan_controller(req)


@router.post("/plan/chat", response_model=ChatResponse)
async def chat_with_plan(req: ChatRequest):
    return await chat_with_plan_controller(req)


@router.post("/plan/intent")                # ✅ fixed slash
async def get_intent(req: Prompt):     # ✅ typed
    return await detect_intent(req.prompt)

@router.post("/plan/handle")
async def handle_prompt(req: Prompt):
    return await handle_prompt_controller(req)
    


@router.post("/test-prompt")
async def test_prompt(req: TestPromptRequest):
    try:
        prompt = generate_planning_prompt(req.tasks, req.project)

        # ✅ reuse call_llm instead of duplicating httpx logic
        response = await call_llm(
            model=MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            url=GROQ_URL
        )

        ai_text = response["choices"][0]["message"]["content"]
        parsed = convert_plan_reply_to_json(ai_text)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return {
        "prompt": prompt,
        "ans": parsed,
        "stats": {
            "characters": len(prompt),
            "lines": prompt.count("\n"),
        },
    }