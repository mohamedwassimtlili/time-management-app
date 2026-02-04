#!/usr/bin/env python3
"""
Task Generator with Start/End Times
Generates realistic tasks with start and end times for testing the free slots finder.
"""
import json
import random
from datetime import datetime, timedelta
from typing import List, Dict, Any
import sys


# Sample task titles and descriptions for software engineering
TASK_TEMPLATES = [
    {"title": "Setup project environment", "description": "Configure development environment, install dependencies", "priority": 0},
    {"title": "Review project requirements", "description": "Read and analyze all project specifications", "priority": 0},
    {"title": "Create API documentation", "description": "Document all REST endpoints with examples", "priority": 1},
    {"title": "Implement user authentication", "description": "Create JWT token-based authentication system", "priority": 0},
    {"title": "Build task CRUD operations", "description": "Implement Create, Read, Update, Delete endpoints", "priority": 1},
    {"title": "Setup database schema", "description": "Design and implement database collections", "priority": 0},
    {"title": "Create task filtering logic", "description": "Implement filtering by status, priority, deadline", "priority": 2},
    {"title": "Write unit tests", "description": "Create comprehensive test suite", "priority": 2},
    {"title": "Setup frontend components", "description": "Create base component structure with routing", "priority": 1},
    {"title": "Implement task list view", "description": "Build component to display all tasks", "priority": 1},
    {"title": "Create task detail page", "description": "Build page to view, edit, and delete tasks", "priority": 2},
    {"title": "Build task creation form", "description": "Create form component with validation", "priority": 1},
    {"title": "Implement calendar view", "description": "Create calendar component to visualize tasks", "priority": 3},
    {"title": "Setup API integration", "description": "Create axios service for API calls", "priority": 1},
    {"title": "Add authentication UI", "description": "Create login and signup pages", "priority": 1},
    {"title": "Implement drag and drop", "description": "Add drag and drop functionality", "priority": 3},
    {"title": "Setup responsive design", "description": "Make application mobile-friendly", "priority": 2},
    {"title": "Implement error handling", "description": "Add comprehensive error handling", "priority": 2},
    {"title": "Create loading states", "description": "Add loading spinners and skeleton screens", "priority": 3},
    {"title": "Team Meeting", "description": "Weekly team sync meeting", "priority": 0},
    {"title": "Code Review Session", "description": "Review pull requests and provide feedback", "priority": 1},
    {"title": "Sprint Planning", "description": "Plan tasks for the upcoming sprint", "priority": 0},
    {"title": "Daily Standup", "description": "Daily team standup meeting", "priority": 0},
    {"title": "Performance optimization", "description": "Optimize API queries and frontend rendering", "priority": 3},
    {"title": "Implement search functionality", "description": "Add full-text search for tasks", "priority": 3},
    {"title": "Setup CI/CD pipeline", "description": "Configure automated testing and deployment", "priority": 2},
    {"title": "Write integration tests", "description": "Create tests for API and frontend integration", "priority": 2},
    {"title": "Setup logging system", "description": "Implement application logging", "priority": 2},
    {"title": "Create user profile page", "description": "Build page for users to manage their profile", "priority": 3},
    {"title": "Implement notifications", "description": "Add email/push notifications", "priority": 4},
]

STATUSES = ["pending", "in progress", "done"]

# Time slots for scheduling (hour ranges)
MORNING_SLOTS = [(8, 9), (9, 10), (10, 11), (11, 12)]
AFTERNOON_SLOTS = [(13, 14), (14, 15), (15, 16), (16, 17)]
EVENING_SLOTS = [(17, 18)]


def generate_task_duration() -> int:
    """Generate a random task duration in minutes (30 min to 3 hours)."""
    durations = [30, 60, 90, 120, 150, 180]
    weights = [5, 20, 25, 30, 15, 5]  # More likely to be 1-2 hours
    return random.choices(durations, weights=weights)[0]


def generate_start_time(date: datetime, available_slots: List[tuple]) -> datetime:
    """Generate a random start time from available slots."""
    hour, _ = random.choice(available_slots)
    minute = random.choice([0, 15, 30, 45])
    return date.replace(hour=hour, minute=minute, second=0, microsecond=0)


def generate_tasks(num_tasks: int, start_date: str = None, days_range: int = 30) -> List[Dict[str, Any]]:
    """
    Generate tasks with start and end times.
    
    Args:
        num_tasks: Number of tasks to generate
        start_date: Starting date (YYYY-MM-DD format), defaults to today
        days_range: Number of days to spread tasks across
        
    Returns:
        List of task dictionaries
    """
    if start_date:
        base_date = datetime.strptime(start_date, "%Y-%m-%d")
    else:
        base_date = datetime.now()
    
    tasks = []
    used_templates = []
    
    for i in range(num_tasks):
        # Select a task template (cycle through if needed)
        if not used_templates:
            used_templates = TASK_TEMPLATES.copy()
            random.shuffle(used_templates)
        
        template = used_templates.pop()
        
        # Generate a random date within the range
        days_offset = random.randint(0, days_range - 1)
        task_date = base_date + timedelta(days=days_offset)
        
        # Choose time slot (more morning/afternoon, less evening)
        slot_type = random.choices(
            [MORNING_SLOTS, AFTERNOON_SLOTS, EVENING_SLOTS],
            weights=[40, 50, 10]
        )[0]
        
        # Generate start time
        start_time = generate_start_time(task_date, slot_type)
        
        # Generate duration and end time
        duration_minutes = generate_task_duration()
        end_time = start_time + timedelta(minutes=duration_minutes)
        
        # Generate deadline (usually same day or a few days later)
        deadline_offset = random.choices([0, 1, 2, 3], weights=[60, 20, 15, 5])[0]
        deadline = task_date + timedelta(days=deadline_offset)
        deadline = deadline.replace(hour=17, minute=0, second=0, microsecond=0)
        
        # Create task
        task = {
            "title": template["title"],
            "description": template.get("description", ""),
            "priority": template.get("priority", random.randint(0, 4)),
            "start": start_time.strftime("%Y-%m-%dT%H:%M:%S") + "Z",
            "end": end_time.strftime("%Y-%m-%dT%H:%M:%S") + "Z",
            "deadline": deadline.strftime("%Y-%m-%dT%H:%M:%S") + "Z",
            "status": random.choice(STATUSES)
        }
        
        tasks.append(task)
    
    # Sort tasks by start time
    tasks.sort(key=lambda x: x["start"])
    
    return tasks


def save_tasks_to_file(tasks: List[Dict[str, Any]], output_file: str):
    """Save tasks to a JSON file."""
    with open(output_file, 'w') as f:
        json.dump(tasks, f, indent=2)
    print(f"✅ Generated {len(tasks)} tasks and saved to {output_file}")


def print_task_summary(tasks: List[Dict[str, Any]]):
    """Print a summary of generated tasks."""
    print("\n" + "="*60)
    print("GENERATED TASKS SUMMARY")
    print("="*60)
    
    # Group by date
    by_date = {}
    for task in tasks:
        date = task["start"].split("T")[0]
        if date not in by_date:
            by_date[date] = []
        by_date[date].append(task)
    
    print(f"\nTotal Tasks: {len(tasks)}")
    print(f"Date Range: {min(by_date.keys())} to {max(by_date.keys())}")
    print(f"Days with tasks: {len(by_date)}")
    
    print("\nTasks per day:")
    for date in sorted(by_date.keys()):
        print(f"  {date}: {len(by_date[date])} tasks")
    
    print("\nStatus Distribution:")
    status_counts = {}
    for task in tasks:
        status = task["status"]
        status_counts[status] = status_counts.get(status, 0) + 1
    for status, count in sorted(status_counts.items()):
        print(f"  {status}: {count}")
    
    print("\nPriority Distribution:")
    priority_counts = {}
    for task in tasks:
        priority = task["priority"]
        priority_counts[priority] = priority_counts.get(priority, 0) + 1
    for priority in sorted(priority_counts.keys()):
        print(f"  Priority {priority}: {priority_counts[priority]}")
    
    print("\n" + "="*60)
    
    # Show first 3 tasks as examples
    print("\nExample Tasks:")
    for i, task in enumerate(tasks[:3], 1):
        print(f"\n{i}. {task['title']}")
        print(f"   Start: {task['start']}")
        print(f"   End: {task['end']}")
        print(f"   Status: {task['status']}")


if __name__ == "__main__":
    # Parse command line arguments
    if len(sys.argv) < 2:
        print("="*60)
        print("Task Generator with Start/End Times")
        print("="*60)
        print("\nUsage: python task_generator.py <num_tasks> [start_date] [output_file]")
        print("\nArguments:")
        print("  num_tasks    - Number of tasks to generate (required)")
        print("  start_date   - Start date in YYYY-MM-DD format (optional, default: today)")
        print("  output_file  - Output JSON file (optional, default: generated_tasks.json)")
        print("\nExamples:")
        print("  python task_generator.py 50")
        print("  python task_generator.py 100 2026-02-01")
        print("  python task_generator.py 75 2026-02-01 my_tasks.json")
        sys.exit(1)
    
    # Get arguments
    num_tasks = int(sys.argv[1])
    start_date = sys.argv[2] if len(sys.argv) > 2 else None
    output_file = sys.argv[3] if len(sys.argv) > 3 else "generated_tasks.json"
    
    # Validate
    if num_tasks < 1:
        print("❌ Error: Number of tasks must be at least 1")
        sys.exit(1)
    
    if num_tasks > 500:
        print("⚠️  Warning: Generating more than 500 tasks may take a while...")
    
    # Generate tasks
    print(f"🔄 Generating {num_tasks} tasks...")
    if start_date:
        print(f"📅 Starting from: {start_date}")
    
    tasks = generate_tasks(num_tasks, start_date)
    
    # Save to file
    save_tasks_to_file(tasks, output_file)
    
    # Print summary
    print_task_summary(tasks)
    
    print(f"\n✨ Done! You can now use '{output_file}' with the free slots finder API.")
    print(f"\nTest with: curl -X POST http://localhost:8000/free-slots -H 'Content-Type: application/json' -d @{output_file}")
