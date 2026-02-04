from fastapi import FastAPI, BackgroundTasks
from pydantic import BaseModel
from typing import List, Optional
from free_slots_finder import find_free_slots_from_list, format_output_simple
import json
import asyncio
from concurrent.futures import ThreadPoolExecutor

# Try to import ollama with proper error handling
OLLAMA_AVAILABLE = False
try:
    import ollama
    OLLAMA_AVAILABLE = True
except ImportError:
    print("⚠️  Ollama not installed. AI features disabled.")
except Exception as e:
    print(f"⚠️  Ollama import error: {e}")

app = FastAPI(title="Free Time Slot Finder API")

# Thread pool for blocking ollama calls
executor = ThreadPoolExecutor(max_workers=2)

# Pydantic model for validation
class Task(BaseModel):
    title: str
    start: str
    end: str
    description: Optional[str] = ""
    priority: Optional[int] = 0
    deadline: Optional[str] = ""
    status: Optional[str] = "pending"


@app.get("/")
def root():
    """
    Root endpoint - API information
    """
    return {
        "message": "Free Time Slot Finder API",
        "version": "1.0.0",
        "endpoints": {
            "POST /free-slots": "Get free time slots from a list of tasks"
        }
    }

@app.post("/Test")
def test_endpoint(payload: dict):
    """
    Read JSON body into a dict and return it.
    Send any JSON and it will be available in `payload`.
    """
    return {"received": payload}

@app.post("/free-slots")
def get_free_slots(tasks: List[Task]):
    """
    Accepts a list of tasks (with start and end times) and returns free time slots in simple JSON format.
    """
    # Convert Pydantic models to dicts (Pydantic v2 uses model_dump())
    tasks_dict = [task.model_dump() for task in tasks]

    # Compute free slots
    free_slots = find_free_slots_from_list(tasks_dict)
    
    # Format in simple date-slot format
    simple_format = format_output_simple(free_slots)
    return {"free_slots": simple_format}


@app.post("/free-slots-with-ai")
async def get_free_slots_with_ai(tasks: List[Task]):
    """
    Accepts a list of tasks and returns free time slots with AI-powered explanations.
    Uses async to avoid blocking the API.
    """
    if not OLLAMA_AVAILABLE:
        return {
            "error": "Ollama not available",
            "message": "Install with: pip install ollama",
            "free_slots": None
        }
    
    # Convert Pydantic models to dicts
    tasks_dict = [task.model_dump() for task in tasks]
    
    # Compute free slots
    free_slots = find_free_slots_from_list(tasks_dict)
    simple_format = format_output_simple(free_slots)
    
    # Run ollama in a thread pool to avoid blocking
    def call_ollama():
        try:
            prompt = f"""You are a time management assistant.

Free time slots (JSON):
{json.dumps(simple_format, indent=2)}

Project description:
Develop a RESTful API for a task management application using FastAPI and Pydantic.

Explain the free slots and suggest how to allocate project work. Be concise."""
            
            response = ollama.chat(
                model="phi3",
                messages=[
                    {"role": "system", "content": "You are a helpful scheduling assistant."},
                    {"role": "user", "content": prompt}
                ]
            )
            return response["message"]["content"]
        except Exception as e:
            return f"Error calling Ollama: {str(e)}"
    
    # Run in thread pool to avoid blocking
    loop = asyncio.get_event_loop()
    ai_explanation = await loop.run_in_executor(executor, call_ollama)
    
    return {
        "free_slots": simple_format,
        "ai_explanation": ai_explanation
    }

@app.post("/free-slots-with-ai-background")
def get_free_slots_with_ai_background(tasks: List[Task], background_tasks: BackgroundTasks):
    """
    Returns free slots immediately and processes AI explanation in the background.
    AI output is written to ./response.txt and ./response.json
    """
    # Convert tasks to dicts
    tasks_dict = [task.model_dump() for task in tasks]

    # Compute free slots
    free_slots = find_free_slots_from_list(tasks_dict)
    simple_format = format_output_simple(free_slots)

    def process_ai_in_background(simple_format):
        if not OLLAMA_AVAILABLE:
            return

        try:
            # --- Prompt for both text and JSON output ---
            prompt_text = (
                f"Explain these free time slots in human-readable text:\n"
                f"{json.dumps(simple_format, indent=2)}"
            )

            prompt_json = (
                "Based on these free time slots, return a JSON array with this structure:\n"
                "{\n"
                '  "date": "YYYY-MM-DD",\n'
                '  "slots": [\n'
                '    {"start": "HH:MM", "end": "HH:MM", "suggested_tasks": ["task1", "task2"]}\n'
                "  ]\n"
                "}\n"
                "Only return valid JSON without extra text.\n"
                f"{json.dumps(simple_format, indent=2)}"
            )

            # --- Human-readable text ---
            response_text = ollama.chat(
                model="phi3",
                messages=[
                    {"role": "system", "content": "You are a scheduling assistant."},
                    {"role": "user", "content": prompt_text}
                ]
            )
            with open("./response.txt", "w", encoding="utf-8") as f:
                f.write(response_text["message"]["content"])
            print("=== AI text response written to ./response.txt ===")

            # --- Structured JSON ---
            response_json = ollama.chat(
                model="phi3",
                messages=[
                    {"role": "system", "content": "You are a scheduling assistant."},
                    {"role": "user", "content": prompt_json}
                ]
            )

            # Validate JSON
            try:
                ai_json = json.loads(response_json["message"]["content"])
            except json.JSONDecodeError:
                print("AI did not return valid JSON. Saving raw text instead.")
                ai_json = {"error": "Invalid JSON", "raw": response_json["message"]["content"]}

            with open("./response.json", "w", encoding="utf-8") as f:
                json.dump(ai_json, f, indent=2)
            print("=== AI JSON response written to ./response.json ===")

        except Exception as e:
            print(f"Background AI error: {e}")

    # Launch background task
    background_tasks.add_task(process_ai_in_background, simple_format)

    return {
        "free_slots": simple_format,
        "message": "AI explanation is being processed in background. Check ./response.txt for text and ./response.json for structured JSON."
    }