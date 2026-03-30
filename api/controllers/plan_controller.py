from fastapi import HTTPException
from models.plan_models import StartRequest, ChatRequest, Prompt
from services.plan_services import (
    start_plan_service,
    chat_with_plan_service,
    general_question,
    detect_intent
)


    
async def general_question_controller(req:Prompt):
    try:
        return await general_question(req)
    except KeyError:
        raise HTTPException(status_code=404, detail="Session not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


async def start_plan_controller(req: StartRequest):
    try:
        print("d")
        return await start_plan_service(req)
    except KeyError:
        raise HTTPException(status_code=404, detail="Session not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


async def chat_with_plan_controller(req: ChatRequest):
    try:
        return await chat_with_plan_service(req)
    except KeyError:
        raise HTTPException(status_code=404, detail="Session not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    



async def detect_intent_controller(req: Prompt):
    try:
        return await detect_intent(req.prompt)
    except KeyError:
        raise HTTPException(status_code=404, detail="Session not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


async def handle_prompt_controller(req: Prompt):
    """
    Master controller — detects intent from the user prompt
    and dispatches to the appropriate service.
    """
    try:
        # Step 1: detect intent
        intent_result = await detect_intent(req.prompt)
        intent = intent_result.get("intent")

        # Step 2: dispatch based on intent
        if intent == "general_question":
            return await general_question(req)

        elif intent == "generate_plan_no_dates":
            return {
                "intent": "generate_plan_no_dates",
                "message": (
                    "It looks like you want to create a plan! "
                    "Could you please provide both a start date and an end date? "
                    "For example: 'Plan my project from March 1 to April 15'."
                )
            }

        elif intent == "generate_plan":
            # Dates are already extracted by detect_intent
            start_date = intent_result.get("start_date")
            end_date = intent_result.get("end_date")

            # Build a StartRequest from the prompt + extracted dates
            plan_req = StartRequest(
                project=req.prompt,
                startDate=start_date,
                endDate=end_date,
                tasks=getattr(req, "tasks", []),
                temperature=getattr(req, "temperature", 0.7),
            )
            return await start_plan_service(plan_req)

        elif intent == "modify_plan":
            chat_req = ChatRequest(
                prompt=req.prompt,
                current_plan=getattr(req, "current_plan", "{}"),
            )
            return await chat_with_plan_service(chat_req)
        else:
            # Unknown intent — fallback to general question
            return await general_question(req)

    except HTTPException:
        raise
    except KeyError:
        raise HTTPException(status_code=404, detail="Session not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


"""async def start_plan_controller(req: StartRequest):
    try:
        return await start_plan_service(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
        
    async def chat_with_plan_controller(req: ChatRequest):
    try:
        return await chat_with_plan_service(req)
    except KeyError:
        raise HTTPException(status_code=404, detail="Session not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))    
        """





