#!/usr/bin/env python3
"""
Task Data Generator with Start and End Times
Generates realistic tasks with start/end times for testing the free slots finder.
"""

import json
import random
from datetime import datetime, timedelta
import sys

# Task templates with descriptions
TASK_TEMPLATES = [
    {"title": "Setup project environment", "description": "Configure development environment, install dependencies, and setup Docker containers"},
    {"title": "Review project requirements", "description": "Read and analyze all project specifications and acceptance criteria"},
    {"title": "Create API documentation", "description": "Document all REST endpoints with request/response examples"},
    {"title": "Implement user authentication", "description": "Create JWT token-based authentication system with login/signup endpoints"},
    {"title": "Build task CRUD operations", "description": "Implement Create, Read, Update, Delete endpoints for tasks"},
    {"title": "Setup database schema", "description": "Design and implement MongoDB collections with proper indexes"},
    {"title": "Create task filtering logic", "description": "Implement filtering by status, priority, deadline, and user"},
    {"title": "Write unit tests for backend", "description": "Create comprehensive test suite for API endpoints using Jest"},
    {"title": "Code review session", "description": "Review code implementation with team members"},
    {"title": "Setup frontend components", "description": "Create base component structure with routing and state management"},
    {"title": "Implement task list view", "description": "Build component to display all tasks with filtering and sorting options"},
    {"title": "Create task detail page", "description": "Build page to view, edit, and delete individual tasks"},
    {"title": "Build task creation form", "description": "Create form component with validation for adding new tasks"},
    {"title": "Team meeting", "description": "Weekly team sync and progress review"},
    {"title": "Sprint planning", "description": "Plan tasks and stories for the upcoming sprint"},
    {"title": "Daily standup", "description": "Quick daily sync with the team"},
    {"title": "Setup CI/CD pipeline", "description": "Configure GitHub Actions for automated testing and deployment"},
    {"title": "Performance optimization", "description": "Optimize API queries and frontend rendering"},
    {"title": "Implement search functionality", "description": "Add full-text search for tasks by title and description"},
    {"title": "Add error handling", "description": "Implement comprehensive error handling and user feedback messages"},
    {"title": "Setup monitoring", "description": "Configure application monitoring and alerting system"},
    {"title": "Create deployment guide", "description": "Write comprehensive deployment documentation"},
    {"title": "Security audit", "description": "Review application for security vulnerabilities"},
    {"title": "Database backup setup", "description": "Configure automatic MongoDB backups and recovery procedures"},
    {"title": "API rate limiting", "description": "Implement rate limiting to prevent abuse"},
    {"title": "Implement pagination", "description": "Add pagination for task lists to improve performance"},
    {"title": "Setup logging system", "description": "Implement application logging for debugging and monitoring"},
    {"title": "Create user profile page", "description": "Build page for users to view and edit their profile information"},
    {"title": "Add task notifications", "description": "Implement email/push notifications for task deadlines"},
    {"title": "Implement calendar view", "description": "Create calendar component to visualize tasks by deadline"},
]

STATUS_OPTIONS = ["pending", "in progress", "done", "cancelled"]
PRIORITY_OPTIONS = [0, 1, 2, 3, 4]

def generate_random_time_slot(date, avoid_times=None):
    """
    Generate a random time slot with start and end times.
    Returns (start_datetime, end_datetime, duration_hours)
    """
    avoid_times = avoid_times or []
    
    # Define time slots (working hours: 6 AM to 8 PM)
    time_slots = [
        (6, 12),   # Morning: 6 AM - 12 PM
        (12, 17),  # Afternoon: 12 PM - 5 PM
        (17, 20),  # Evening: 5 PM - 8 PM
    ]
    
    # Random duration between 30 minutes and 4 hours
    duration_minutes = random.choice([30, 60, 90, 120, 150, 180, 210, 240])
    duration_hours = duration_minutes / 60
    
    # Try to find a non-overlapping time slot
    max_attempts = 20
    for _ in range(max_attempts):
        # Pick a random time slot
        slot_start, slot_end = random.choice(time_slots)
        
        # Generate random start time within the slot
        hour = random.randint(slot_start, min(slot_end - 1, slot_start + 6))
        minute = random.choice([0, 15, 30, 45])
        
        start_time = datetime(date.year, date.month, date.day, hour, minute)
        end_time = start_time + timedelta(hours=duration_hours)
        
        # Check if this overlaps with existing times
        overlaps = False
        for existing_start, existing_end in avoid_times:
            if not (end_time <= existing_start or start_time >= existing_end):
                overlaps = True
                break
        
        if not overlaps and end_time.hour < 21:  # Don't go past 9 PM
            return start_time, end_time, duration_hours
    
    # If we couldn't find a non-overlapping slot, just return the last attempt
    return start_time, end_time, duration_hours


def generate_tasks(num_tasks, start_date_str="2026-02-01", days_range=30):
    """
    Generate random tasks with start and end times.
    
    Args:
        num_tasks: Number of tasks to generate
        start_date_str: Start date in format "YYYY-MM-DD"
        days_range: Number of days to spread tasks across
    
    Returns:
        List of task dictionaries
    """
    tasks = []
    start_date = datetime.strptime(start_date_str, "%Y-%m-%d")
    
    # Track used times per day to avoid too many overlaps
    day_schedules = {}
    
    for i in range(num_tasks):
        # Pick a random template
        template = random.choice(TASK_TEMPLATES)
        
        # Pick a random date within the range
        day_offset = random.randint(0, days_range - 1)
        task_date = start_date + timedelta(days=day_offset)
        date_key = task_date.strftime("%Y-%m-%d")
        
        # Get existing times for this day
        if date_key not in day_schedules:
            day_schedules[date_key] = []
        
        # Generate start and end times
        start_time, end_time, duration = generate_random_time_slot(
            task_date, 
            avoid_times=day_schedules[date_key]
        )
        
        # Add to schedule
        day_schedules[date_key].append((start_time, end_time))
        
        # Generate deadline (can be same day or future)
        deadline_offset = random.randint(0, 3)  # 0-3 days after task date
        deadline_date = task_date + timedelta(days=deadline_offset)
        deadline_hour = random.choice([17, 18, 23])  # End of work day or end of day
        deadline = datetime(deadline_date.year, deadline_date.month, deadline_date.day, deadline_hour, 0)
        
        # Build task object
        task = {
            "title": template["title"],
            "start": start_time.strftime("%Y-%m-%dT%H:%M:%SZ"),
            "end": end_time.strftime("%Y-%m-%dT%H:%M:%SZ"),
        }
        
        # Add optional fields randomly
        if random.random() > 0.3:  # 70% chance to have description
            task["description"] = template["description"]
        
        if random.random() > 0.3:  # 70% chance to have priority
            task["priority"] = random.choice(PRIORITY_OPTIONS)
        
        if random.random() > 0.2:  # 80% chance to have deadline
            task["deadline"] = deadline.strftime("%Y-%m-%dT%H:%M:%SZ")
        
        if random.random() > 0.4:  # 60% chance to have status
            # Earlier tasks more likely to be done
            if day_offset < days_range / 3:
                task["status"] = random.choice(["done", "done", "in progress", "pending"])
            elif day_offset < 2 * days_range / 3:
                task["status"] = random.choice(["in progress", "in progress", "pending", "done"])
            else:
                task["status"] = random.choice(["pending", "pending", "in progress"])
        
        tasks.append(task)
    
    # Sort tasks by start time
    tasks.sort(key=lambda x: x["start"])
    
    return tasks


def main():
    """Main function to generate and save tasks."""
    
    # Parse command line arguments
    if len(sys.argv) < 2:
        print("Usage: python task_data_generator.py <num_tasks> [start_date] [days_range] [output_file]")
        print("Example: python task_data_generator.py 50 2026-02-01 30 tasks_with_times.json")
        sys.exit(1)
    
    num_tasks = int(sys.argv[1])
    start_date = sys.argv[2] if len(sys.argv) > 2 else "2026-02-01"
    days_range = int(sys.argv[3]) if len(sys.argv) > 3 else 30
    output_file = sys.argv[4] if len(sys.argv) > 4 else "tasks_with_times.json"
    
    print(f"Generating {num_tasks} tasks...")
    print(f"Start date: {start_date}")
    print(f"Days range: {days_range}")
    print(f"Output file: {output_file}")
    
    # Generate tasks
    tasks = generate_tasks(num_tasks, start_date, days_range)
    
    # Save to file
    with open(output_file, 'w') as f:
        json.dump(tasks, f, indent=2)
    
    print(f"\n✓ Successfully generated {len(tasks)} tasks")
    print(f"✓ Saved to: {output_file}")
    
    # Show some statistics
    with_description = sum(1 for t in tasks if "description" in t)
    with_deadline = sum(1 for t in tasks if "deadline" in t)
    with_status = sum(1 for t in tasks if "status" in t)
    with_priority = sum(1 for t in tasks if "priority" in t)
    
    print(f"\nStatistics:")
    print(f"  - Tasks with description: {with_description}/{len(tasks)}")
    print(f"  - Tasks with deadline: {with_deadline}/{len(tasks)}")
    print(f"  - Tasks with status: {with_status}/{len(tasks)}")
    print(f"  - Tasks with priority: {with_priority}/{len(tasks)}")
    
    # Show sample
    print(f"\nSample tasks:")
    for task in tasks[:3]:
        print(f"  - {task['title']}: {task['start']} → {task['end']}")


if __name__ == "__main__":
    main()
