from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional
from free_slots_finder import find_free_slots_from_list, format_output_simple

app = FastAPI(title="Free Time Slot Finder API")

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
