#!/usr/bin/env python3
"""
Free Time Slot Finder - Reusable Function
Finds available time slots between scheduled tasks.
Accepts JSON input and returns free time slots.
"""
import json
from datetime import datetime, time, timedelta
from collections import defaultdict
from typing import List, Dict, Any
import sys

# Working hours configuration
WORK_START_HOUR = 6   # 06:00
WORK_END_HOUR = 18    # 18:00 (6 PM)


def parse_iso(ts: str) -> datetime:
    """Parse ISO 8601 datetime string."""
    try:
        # Handle both 'Z' and timezone formats
        if ts.endswith('Z'):
            ts = ts.replace('Z', '+00:00')
        return datetime.fromisoformat(ts)
    except Exception as e:
        print(f"Error parsing datetime: {ts}, Error: {e}")
        return None


def group_by_day(slots: List[Dict[str, Any]]) -> Dict:
    """Group tasks by day."""
    grouped = defaultdict(list)

    for slot in slots:
        start_str = slot.get("start")
        end_str = slot.get("end")
        
        if not start_str or not end_str:
            continue
            
        start = parse_iso(start_str)
        end = parse_iso(end_str)
        
        if start and end:
            grouped[start.date()].append((start, end, slot.get("title", "")))

    return grouped


def compute_free_slots(busy_slots: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Compute free time slots from busy slots.
    
    Args:
        busy_slots: List of tasks with 'start' and 'end' times
        
    Returns:
        List of free time slots with 'start', 'end', and 'available' fields
    """
    free_slots = []
    busy_by_day = group_by_day(busy_slots)

    for day, intervals in sorted(busy_by_day.items()):
        # Sort busy slots by start time
        intervals.sort(key=lambda x: x[0])

        # Get timezone from first interval
        tz = intervals[0][0].tzinfo if intervals else None
        
        # Define working hours for this day
        work_start = datetime.combine(day, time(WORK_START_HOUR, 0), tzinfo=tz)
        work_end = datetime.combine(day, time(WORK_END_HOUR, 0), tzinfo=tz)

        cursor = work_start

        for start, end, title in intervals:
            # If there's a gap between cursor and task start
            if start > cursor:
                free_slots.append({
                    "date": day.isoformat(),
                    "start": cursor.isoformat(),
                    "end": start.isoformat(),
                    "duration_minutes": int((start - cursor).total_seconds() / 60),
                    "available": True
                })
            # Move cursor to end of current task
            cursor = max(cursor, end)

        # Check for remaining free time at end of day
        if cursor < work_end:
            free_slots.append({
                "date": day.isoformat(),
                "start": cursor.isoformat(),
                "end": work_end.isoformat(),
                "duration_minutes": int((work_end - cursor).total_seconds() / 60),
                "available": True
            })

    return free_slots





def find_free_slots_from_list(tasks: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Function that accepts a Python list and returns free slots as a list.
    
    Args:
        tasks: List of task dictionaries
        
    Returns:
        List of free time slot dictionaries
    """
    return compute_free_slots(tasks)


def format_output_simple(free_slots: List[Dict[str, Any]]) -> List[List]:
    """
    Format output in simple format: [[date, [slots]], ...]
    
    Returns:
        List of [date, slots] pairs
    """
    by_date = defaultdict(list)
    
    for slot in free_slots:
        date = slot["date"]
        start_dt = parse_iso(slot["start"])
        end_dt = parse_iso(slot["end"])
        
        by_date[date].append({
            "start": start_dt.strftime("%H:%M"),
            "end": end_dt.strftime("%H:%M")
        })
    
    result = []
    for date in sorted(by_date.keys()):
        slots = by_date[date]
        
        # Check if entire day is free (roughly work hours)
        if len(slots) == 1:
            duration = slots[0]
            if duration["start"] == f"{WORK_START_HOUR:02d}:00" and duration["end"] == f"{WORK_END_HOUR:02d}:00":
                result.append([date, ["all"]])
                continue
        
        result.append([date, slots])
    
    return result


# Example usage and testing
if __name__ == "__main__":
    # Example tasks with start and end times
    def load_tasks_from_arg(arg: str):
        """
        Try to load tasks from:
        - a raw JSON string,
        - '-' meaning read JSON from stdin,
        - a filepath containing JSON.
        Exits the program on failure.
        """
        # Try parse as JSON string
        try:
            data = json.loads(arg)
            if isinstance(data, list):
                return data
        except Exception:
            pass

        # Read from stdin if '-' provided
        if arg == "-":
            try:
                data = json.load(sys.stdin)
                if isinstance(data, list):
                    return data
            except Exception as e:
                print(f"Failed to read JSON from stdin: {e}")
                sys.exit(1)

        # Try to open as file path
        try:
            with open(arg, "r", encoding="utf-8") as f:
                data = json.load(f)
                if isinstance(data, list):
                    return data
        except Exception as e:
            print(f"Failed to load JSON from file '{arg}': {e}")
            sys.exit(1)

        print("Argument did not contain a JSON list of tasks.")
        sys.exit(1)


    if len(sys.argv) > 1:
        example_tasks = load_tasks_from_arg(sys.argv[1])
    else:
        example_tasks = [
          {
            "title": "Setup project environment",
            "description": "Configure development environment, install dependencies, and setup Docker containers",
            "priority": 0,
            "start": "2026-02-02T09:00:00Z",
            "end": "2026-02-02T10:30:00Z",
            "deadline": "2026-02-02T09:00:00Z",
            "status": "done"
          },
          {
            "title": "Review project requirements",
            "description": "Read and analyze all project specifications and acceptance criteria",
            "priority": 0,
            "start": "2026-02-02T14:00:00Z",
            "end": "2026-02-02T15:00:00Z",
            "deadline": "2026-02-03T10:00:00Z",
            "status": "done"
          },
          {
            "title": "Create API documentation",
            "description": "Document all REST endpoints with request/response examples",
            "priority": 1,
            "start": "2026-02-05T09:00:00Z",
            "end": "2026-02-05T12:00:00Z",
            "deadline": "2026-02-05T17:00:00Z",
            "status": "in progress"
          },
          {
            "title": "Team Meeting",
            "description": "Weekly sync meeting",
            "priority": 0,
            "start": "2026-02-05T14:00:00Z",
            "end": "2026-02-05T15:30:00Z",
            "deadline": "2026-02-05T15:30:00Z",
            "status": "pending"
          },
          {
            "title": "Implement user authentication",
            "description": "Create JWT token-based authentication system",
            "priority": 0,
            "start": "2026-02-07T10:00:00Z",
            "end": "2026-02-07T13:00:00Z",
            "deadline": "2026-02-07T17:00:00Z",
            "status": "in progress"
          }
        ]




    
    print("="*60)
    print("FREE TIME SLOT FINDER - TEST")
    print("="*60)
    
    # Test with list
    print("\n📋 Input Tasks:")
    for task in example_tasks:
        print(f"  • {task['title']}: {task['start']} - {task['end']}")
    
    # Find free slots
    free_slots = find_free_slots_from_list(example_tasks)
    
    print(f"\n⏰ Found {len(free_slots)} Free Time Slots:\n")
    print(json.dumps(free_slots, indent=2))
    
    # Simple format
    print("\n📅 Simple Format Output:")
    simple_format = format_output_simple(free_slots)
    print(json.dumps(simple_format, indent=2))
