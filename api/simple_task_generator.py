#!/usr/bin/env python3
"""
Simple Task Generator
Generates tasks between specified dates and saves to JSON file.

Usage:
    python3 simple_task_generator.py [num_tasks] [start_date] [end_date] [output_file]

Examples:
    python3 simple_task_generator.py                           # 20 tasks, 2022-02-02 to 2022-02-08
    python3 simple_task_generator.py 50                        # 50 tasks, default dates
    python3 simple_task_generator.py 30 2026-02-01 2026-02-15  # 30 tasks, custom dates
"""

import json
import random
from datetime import datetime, timedelta
import sys

# Default values
DEFAULT_NUM_TASKS = 20
DEFAULT_START_DATE = "2022-02-02"
DEFAULT_END_DATE = "2022-02-08"
DEFAULT_OUTPUT_FILE = "tasks_with_times.json"

# Task templates
TASK_TEMPLATES = [
    {"title": "Setup development environment", "description": "Install and configure all required tools"},
    {"title": "Review code changes", "description": "Code review for recent pull requests"},
    {"title": "Team standup meeting", "description": "Daily team sync"},
    {"title": "Write unit tests", "description": "Create comprehensive test coverage"},
    {"title": "Database optimization", "description": "Optimize slow queries and add indexes"},
    {"title": "Update documentation", "description": "Update API docs and README"},
    {"title": "Bug fix - Login issue", "description": "Fix authentication bug reported by users"},
    {"title": "Implement new feature", "description": "Add requested functionality"},
    {"title": "Deploy to staging", "description": "Deploy latest changes to staging environment"},
    {"title": "Client presentation", "description": "Present progress to stakeholders"},
    {"title": "Research new technologies", "description": "Evaluate potential tech stack upgrades"},
    {"title": "Performance testing", "description": "Load testing and performance analysis"},
    {"title": "Security audit", "description": "Review application for security vulnerabilities"},
    {"title": "Refactor legacy code", "description": "Improve code quality and maintainability"},
    {"title": "Design system updates", "description": "Update UI components and styles"},
    {"title": "API integration", "description": "Integrate third-party services"},
    {"title": "User feedback review", "description": "Analyze and prioritize user feedback"},
    {"title": "Sprint planning", "description": "Plan tasks for next sprint"},
    {"title": "Database backup", "description": "Verify backup procedures"},
    {"title": "Monitor system health", "description": "Check logs and system metrics"},
    {"title": "Write blog post", "description": "Technical article for company blog"},
    {"title": "Mentor junior developer", "description": "Pair programming session"},
    {"title": "Update dependencies", "description": "Update npm/pip packages"},
    {"title": "Create data visualization", "description": "Build dashboard charts"},
    {"title": "Mobile responsiveness", "description": "Fix mobile UI issues"},
]

STATUS_OPTIONS = ["pending", "in progress", "done"]
PRIORITY_OPTIONS = [0, 1, 2, 3, 4]


def generate_task_time(base_date, time_slot="random"):
    """
    Generate start and end times for a task on the given date.
    
    Args:
        base_date: datetime object for the task date
        time_slot: "morning", "afternoon", "evening", or "random"
    
    Returns:
        (start_datetime, end_datetime)
    """
    if time_slot == "random":
        time_slot = random.choice(["morning", "afternoon", "evening"])
    
    # Define time ranges for each slot
    if time_slot == "morning":
        start_hour = random.randint(6, 10)
    elif time_slot == "afternoon":
        start_hour = random.randint(12, 15)
    else:  # evening
        start_hour = random.randint(16, 18)
    
    start_minute = random.choice([0, 15, 30, 45])
    
    # Task duration: 30 min to 3 hours
    duration_minutes = random.choice([30, 45, 60, 90, 120, 150, 180])
    
    start_time = base_date.replace(hour=start_hour, minute=start_minute, second=0, microsecond=0)
    end_time = start_time + timedelta(minutes=duration_minutes)
    
    return start_time, end_time


def generate_tasks(num_tasks, start_date_str, end_date_str):
    """
    Generate tasks between start_date and end_date.
    
    Args:
        num_tasks: Number of tasks to generate
        start_date_str: Start date in "YYYY-MM-DD" format
        end_date_str: End date in "YYYY-MM-DD" format
    
    Returns:
        List of task dictionaries
    """
    start_date = datetime.strptime(start_date_str, "%Y-%m-%d")
    end_date = datetime.strptime(end_date_str, "%Y-%m-%d")
    
    # Calculate number of days in the range
    date_range = (end_date - start_date).days + 1
    
    if date_range < 1:
        print("Error: End date must be after start date")
        sys.exit(1)
    
    tasks = []
    
    for i in range(num_tasks):
        # Pick a random template
        template = random.choice(TASK_TEMPLATES)
        
        # Pick a random day within the date range
        random_day_offset = random.randint(0, date_range - 1)
        task_date = start_date + timedelta(days=random_day_offset)
        
        # Generate start and end times
        start_time, end_time = generate_task_time(task_date)
        
        # Generate deadline (1-3 days after start)
        deadline_offset = random.randint(0, 3)
        deadline = (start_time + timedelta(days=deadline_offset)).replace(hour=17, minute=0)
        
        # Create task
        task = {
            "title": template["title"],
            "description": template["description"],
            "start": start_time.strftime("%Y-%m-%dT%H:%M:%SZ"),
            "end": end_time.strftime("%Y-%m-%dT%H:%M:%SZ"),
            "deadline": deadline.strftime("%Y-%m-%dT%H:%M:%SZ"),
            "priority": random.choice(PRIORITY_OPTIONS),
            "status": random.choice(STATUS_OPTIONS)
        }
        
        tasks.append(task)
    
    # Sort tasks by start time
    tasks.sort(key=lambda x: x["start"])
    
    return tasks


def main():
    """Main function to parse arguments and generate tasks."""
    
    # Parse command line arguments
    num_tasks = int(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_NUM_TASKS
    start_date = sys.argv[2] if len(sys.argv) > 2 else DEFAULT_START_DATE
    end_date = sys.argv[3] if len(sys.argv) > 3 else DEFAULT_END_DATE
    output_file = sys.argv[4] if len(sys.argv) > 4 else DEFAULT_OUTPUT_FILE
    
    print("=" * 60)
    print("TASK GENERATOR")
    print("=" * 60)
    print(f"\n📝 Configuration:")
    print(f"  Number of tasks: {num_tasks}")
    print(f"  Start date: {start_date}")
    print(f"  End date: {end_date}")
    print(f"  Output file: {output_file}")
    
    # Validate dates
    try:
        datetime.strptime(start_date, "%Y-%m-%d")
        datetime.strptime(end_date, "%Y-%m-%d")
    except ValueError as e:
        print(f"\n❌ Error: Invalid date format. Use YYYY-MM-DD")
        print(f"   {e}")
        sys.exit(1)
    
    # Generate tasks
    print(f"\n⏳ Generating {num_tasks} tasks...")
    tasks = generate_tasks(num_tasks, start_date, end_date)
    
    # Save to JSON file
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(tasks, f, indent=2, ensure_ascii=False)
    
    print(f"✅ Successfully generated {len(tasks)} tasks!")
    print(f"📁 Saved to: {output_file}")
    
    # Show statistics
    statuses = {}
    priorities = {}
    for task in tasks:
        status = task.get("status", "unknown")
        priority = task.get("priority", -1)
        statuses[status] = statuses.get(status, 0) + 1
        priorities[priority] = priorities.get(priority, 0) + 1
    
    print(f"\n📊 Statistics:")
    print(f"  Status breakdown:")
    for status, count in sorted(statuses.items()):
        print(f"    - {status}: {count}")
    print(f"  Priority breakdown:")
    for priority, count in sorted(priorities.items()):
        print(f"    - Priority {priority}: {count}")
    
    # Show sample tasks
    print(f"\n📋 Sample tasks (first 3):")
    for task in tasks[:3]:
        print(f"  • {task['title']}")
        print(f"    {task['start']} → {task['end']}")
        print(f"    Status: {task['status']}, Priority: {task['priority']}")
    
    print("\n" + "=" * 60)
    print("✨ Done!")


if __name__ == "__main__":
    main()
