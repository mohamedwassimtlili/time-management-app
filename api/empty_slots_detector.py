#!/usr/bin/env python3
"""
Empty Time Slot Detection Script
Analyzes tasks and identifies empty time slots for each day.
"""
import json
from datetime import datetime
from collections import defaultdict


def parse_deadline(deadline_str):
    """Parse ISO 8601 deadline string to datetime object."""
    try:
        return datetime.fromisoformat(deadline_str.replace('Z', '+00:00'))
    except Exception as e:
        print(f"Error parsing deadline: {deadline_str}, Error: {e}")
        return None


# Define all possible time slots in a day
ALL_TIME_SLOTS = [
    {"name": "Night", "range": "00:00-06:00", "start": 0, "end": 6},
    {"name": "Early Morning", "range": "06:00-09:00", "start": 6, "end": 9},
    {"name": "Morning", "range": "09:00-12:00", "start": 9, "end": 12},
    {"name": "Lunch", "range": "12:00-14:00", "start": 12, "end": 14},
    {"name": "Afternoon", "range": "14:00-17:00", "start": 14, "end": 17},
    {"name": "Evening", "range": "17:00-20:00", "start": 17, "end": 20},
    {"name": "Late Evening", "range": "20:00-24:00", "start": 20, "end": 24},
]


def get_time_slot_info(hour):
    """Get time slot info based on hour (0-23)."""
    for slot in ALL_TIME_SLOTS:
        if slot["start"] <= hour < slot["end"]:
            return slot.copy()
    return None


def get_slot_key(slot):
    """Generate a unique key for a time slot."""
    return f"{slot['name']} ({slot['range']})"


def analyze_tasks_for_empty_slots(tasks):
    """Analyze tasks and identify occupied and empty time slots for each date."""
    date_data = defaultdict(lambda: {"occupied_slots": set(), "tasks": []})
    
    for task in tasks:
        deadline_str = task.get("deadline")
        
        if not deadline_str:
            continue
        
        deadline = parse_deadline(deadline_str)
        
        if deadline is None:
            continue
        
        date_key = deadline.strftime("%Y-%m-%d")
        slot_info = get_time_slot_info(deadline.hour)
        
        if slot_info:
            slot_key = get_slot_key(slot_info)
            date_data[date_key]["occupied_slots"].add(slot_key)
            
            task_info = {
                "title": task.get("title", ""),
                "description": task.get("description", ""),
                "priority": task.get("priority", 5),
                "deadline": deadline.isoformat(),
                "time": deadline.strftime("%H:%M"),
                "time_slot": slot_key,
                "status": task.get("status", "pending"),
            }
            date_data[date_key]["tasks"].append(task_info)
    
    result = {}
    for date_key, data in sorted(date_data.items()):
        all_slot_keys = set(get_slot_key(slot) for slot in ALL_TIME_SLOTS)
        empty_slots = all_slot_keys - data["occupied_slots"]
        
        data["tasks"].sort(key=lambda x: x["deadline"])
        
        result[date_key] = {
            "date": date_key,
            "total_time_slots": len(ALL_TIME_SLOTS),
            "occupied_slots": sorted(list(data["occupied_slots"])),
            "empty_slots": sorted(list(empty_slots)),
            "occupied_count": len(data["occupied_slots"]),
            "empty_count": len(empty_slots),
            "tasks": data["tasks"]
        }
    
    return result


if __name__ == "__main__":
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python empty_slots_detector.py <input_file.json> [output_file.json]")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = sys.argv[2] if len(sys.argv) > 2 else "empty_slots_output.json"
    
    with open(input_file, 'r') as f:
        tasks = json.load(f)
    
    print(f"📥 Loaded {len(tasks)} tasks")
    
    analysis = analyze_tasks_for_empty_slots(tasks)
    
    output_data = {"dates": analysis}
    
    with open(output_file, 'w') as f:
        json.dump(output_data, f, indent=2)
    
    print(f"✅ Saved to {output_file}")
    print(f"📅 Analyzed {len(analysis)} dates")
    
    if analysis:
        first_date = sorted(analysis.keys())[0]
        day_info = analysis[first_date]
        print(f"\n�� Sample: {first_date}")
        print(f"   Occupied: {day_info['occupied_count']}/{day_info['total_time_slots']}")
        print(f"   Empty: {day_info['empty_count']}/{day_info['total_time_slots']}")
        print(f"   Empty Slots: {', '.join(day_info['empty_slots'][:3])}")
