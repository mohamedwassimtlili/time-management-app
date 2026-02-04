#!/usr/bin/env python3
"""
Time Slot Detection Script
Processes tasks and groups them into time slots by date.
Output format: { "date": [{"slot": {...}}] }
"""

import json
from datetime import datetime
from collections import defaultdict
from typing import List, Dict, Any


def parse_deadline(deadline_str: str) -> datetime:
    """Parse ISO 8601 deadline string to datetime object."""
    try:
        return datetime.fromisoformat(deadline_str.replace('Z', '+00:00'))
    except Exception as e:
        print(f"Error parsing deadline: {deadline_str}, Error: {e}")
        return None


def get_time_slot(hour: int) -> str:
    """Determine time slot based on hour (0-23)."""
    if 0 <= hour < 6:
        return "Night (00:00-06:00)"
    elif 6 <= hour < 9:
        return "Early Morning (06:00-09:00)"
    elif 9 <= hour < 12:
        return "Morning (09:00-12:00)"
    elif 12 <= hour < 14:
        return "Lunch (12:00-14:00)"
    elif 14 <= hour < 17:
        return "Afternoon (14:00-17:00)"
    elif 17 <= hour < 20:
        return "Evening (17:00-20:00)"
    else:
        return "Night (20:00-24:00)"


def create_slot_data(task: Dict[str, Any], deadline: datetime) -> Dict[str, Any]:
    """Create a slot entry from task data."""
    return {
        "title": task.get("title", ""),
        "description": task.get("description", ""),
        "priority": task.get("priority", 5),
        "deadline": deadline.isoformat(),
        "time": deadline.strftime("%H:%M"),
        "time_slot": get_time_slot(deadline.hour),
        "status": task.get("status", "pending"),
        "hour": deadline.hour,
        "minute": deadline.minute
    }


def group_tasks_by_date(tasks: List[Dict[str, Any]]) -> Dict[str, List[Dict[str, Any]]]:
    """
    Group tasks by date and create time slots.
    
    Args:
        tasks: List of task dictionaries
        
    Returns:
        Dictionary with dates as keys and list of slot objects as values
    """
    date_slots = defaultdict(list)
    
    for task in tasks:
        deadline_str = task.get("deadline")
        
        if not deadline_str:
            print(f"Warning: Task '{task.get('title', 'Unknown')}' has no deadline, skipping...")
            continue
        
        deadline = parse_deadline(deadline_str)
        
        if deadline is None:
            continue
        
        # Extract date in YYYY-MM-DD format
        date_key = deadline.strftime("%Y-%m-%d")
        
        # Create slot data
        slot = create_slot_data(task, deadline)
        
        date_slots[date_key].append(slot)
    
    # Sort slots within each date by time
    for date_key in date_slots:
        date_slots[date_key].sort(key=lambda x: (x["hour"], x["minute"]))
    
    return dict(date_slots)


def process_tasks_to_time_slots(input_file: str, output_file: str = None) -> Dict[str, List[Dict[str, Any]]]:
    """
    Process tasks from input file and generate time slots.
    
    Args:
        input_file: Path to JSON file containing tasks
        output_file: Optional path to save output JSON
        
    Returns:
        Dictionary of date-grouped time slots
    """
    try:
        # Read input tasks
        with open(input_file, 'r') as f:
            tasks = json.load(f)
        
        print(f"📥 Loaded {len(tasks)} tasks from {input_file}")
        
        # Group tasks by date
        time_slots = group_tasks_by_date(tasks)
        
        print(f"📅 Grouped into {len(time_slots)} dates")
        
        # Print summary
        for date, slots in sorted(time_slots.items()):
            print(f"  {date}: {len(slots)} tasks")
        
        # Save to output file if specified
        if output_file:
            with open(output_file, 'w') as f:
                json.dump(time_slots, f, indent=2)
            print(f"✅ Saved time slots to {output_file}")
        
        return time_slots
    
    except FileNotFoundError:
        print(f"❌ Error: File '{input_file}' not found")
        return {}
    except json.JSONDecodeError as e:
        print(f"❌ Error: Invalid JSON in '{input_file}': {e}")
        return {}
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return {}


def process_tasks_from_list(tasks: List[Dict[str, Any]]) -> Dict[str, List[Dict[str, Any]]]:
    """
    Process tasks from a list and generate time slots.
    
    Args:
        tasks: List of task dictionaries
        
    Returns:
        Dictionary of date-grouped time slots
    """
    print(f"📥 Processing {len(tasks)} tasks")
    
    time_slots = group_tasks_by_date(tasks)
    
    print(f"📅 Grouped into {len(time_slots)} dates")
    
    # Print summary
    for date, slots in sorted(time_slots.items()):
        print(f"  {date}: {len(slots)} tasks")
    
    return time_slots


def get_statistics(time_slots: Dict[str, List[Dict[str, Any]]]) -> Dict[str, Any]:
    """Generate statistics about time slots."""
    total_tasks = sum(len(slots) for slots in time_slots.values())
    
    status_count = defaultdict(int)
    priority_count = defaultdict(int)
    time_slot_count = defaultdict(int)
    
    for slots in time_slots.values():
        for slot in slots:
            status_count[slot["status"]] += 1
            priority_count[slot["priority"]] += 1
            time_slot_count[slot["time_slot"]] += 1
    
    return {
        "total_tasks": total_tasks,
        "total_dates": len(time_slots),
        "status_breakdown": dict(status_count),
        "priority_breakdown": dict(priority_count),
        "time_slot_breakdown": dict(time_slot_count)
    }


if __name__ == "__main__":
    import sys
    
    # Example usage
    if len(sys.argv) < 2:
        print("Usage: python time_slot.py <input_file.json> [output_file.json]")
        print("\nExample:")
        print("  python time_slot.py ../backend/tasks-february.json time_slots_output.json")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = sys.argv[2] if len(sys.argv) > 2 else "time_slots_output.json"
    
    # Process tasks
    time_slots = process_tasks_to_time_slots(input_file, output_file)
    
    # Print statistics
    if time_slots:
        print("\n📊 Statistics:")
        stats = get_statistics(time_slots)
        print(json.dumps(stats, indent=2))
        
        # Print sample output
        print("\n📋 Sample Output (first date):")
        first_date = sorted(time_slots.keys())[0] if time_slots else None
        if first_date:
            print(f"\n{first_date}:")
            print(json.dumps(time_slots[first_date][:3], indent=2))
            if len(time_slots[first_date]) > 3:
                print(f"  ... and {len(time_slots[first_date]) - 3} more tasks")
