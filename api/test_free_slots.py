#!/usr/bin/env python3
"""
Test script demonstrating how to use free_slots_finder as a reusable function
"""
import json
from free_slots_finder import (
    process_tasks_from_list,
    process_tasks_from_json,
    find_free_slots_simple
)


def example_1_from_dict_list():
    """Example 1: Using Python dictionary list"""
    print("="*60)
    print("Example 1: From Python Dictionary List")
    print("="*60)
    
    tasks = [
        {
            "title": "Morning Meeting",
            "start": "2026-02-20T09:00:00Z",
            "end": "2026-02-20T10:00:00Z"
        },
        {
            "title": "Lunch Break",
            "start": "2026-02-20T12:00:00Z",
            "end": "2026-02-20T13:00:00Z"
        },
        {
            "title": "Afternoon Task",
            "start": "2026-02-20T14:00:00Z",
            "end": "2026-02-20T15:30:00Z"
        },
        {
            "title": "All Morning Workshop",
            "start": "2026-02-21T08:00:00Z",
            "end": "2026-02-21T12:00:00Z"
        }
    ]
    
    # Get free slots
    free_slots = process_tasks_from_list(tasks)
    
    print("\n📤 Output:")
    print(json.dumps(free_slots, indent=2))
    print()


def example_2_from_json_string():
    """Example 2: Using JSON string"""
    print("="*60)
    print("Example 2: From JSON String")
    print("="*60)
    
    json_string = '''[
        {
            "title": "Team Standup",
            "start": "2026-02-22T09:00:00Z",
            "end": "2026-02-22T09:30:00Z"
        },
        {
            "title": "Code Review",
            "start": "2026-02-22T15:00:00Z",
            "end": "2026-02-22T16:00:00Z"
        }
    ]'''
    
    # Get free slots
    free_slots = process_tasks_from_json(json_string)
    
    print("\n📤 Output:")
    print(json.dumps(free_slots, indent=2))
    print()


def example_3_simple_wrapper():
    """Example 3: Using simple wrapper (JSON in, JSON out)"""
    print("="*60)
    print("Example 3: Simple Wrapper (JSON in, JSON out)")
    print("="*60)
    
    # This is perfect for API endpoints
    json_input = '''[
        {
            "title": "Client Meeting",
            "start": "2026-02-23T10:00:00Z",
            "end": "2026-02-23T11:30:00Z"
        }
    ]'''
    
    # Get free slots as JSON string
    json_output = find_free_slots_simple(json_input)
    
    print("\n📥 Input JSON:")
    print(json_input)
    print("\n📤 Output JSON:")
    print(json_output)
    print()


def example_4_full_day():
    """Example 4: Day with no tasks (fully free)"""
    print("="*60)
    print("Example 4: Fully Free Day")
    print("="*60)
    
    # No tasks scheduled
    tasks = []
    
    free_slots = process_tasks_from_list(tasks, verbose=False)
    
    print("\n📤 Output:")
    print(json.dumps(free_slots, indent=2))
    print("(Empty list because no dates have tasks)")
    print()


def example_5_fully_booked():
    """Example 5: Fully booked day"""
    print("="*60)
    print("Example 5: Fully Booked Day")
    print("="*60)
    
    tasks = [
        {
            "title": "All Day Event",
            "start": "2026-02-24T08:00:00Z",
            "end": "2026-02-24T18:00:00Z"
        }
    ]
    
    free_slots = process_tasks_from_list(tasks, verbose=False)
    
    print("\n📤 Output:")
    print(json.dumps(free_slots, indent=2))
    print()


def example_6_api_simulation():
    """Example 6: Simulating an API endpoint"""
    print("="*60)
    print("Example 6: API Endpoint Simulation")
    print("="*60)
    
    # Simulate receiving JSON from an API request
    def api_endpoint(request_body: str) -> str:
        """Simulate API endpoint that receives tasks and returns free slots"""
        try:
            # Process the request
            result = find_free_slots_simple(request_body)
            return result
        except Exception as e:
            return json.dumps({"error": str(e)})
    
    # Simulate API request
    request_json = '''[
        {
            "title": "Setup project environment",
            "description": "Configure development environment",
            "priority": 0,
            "start": "2026-02-20T09:08:00Z",
            "end": "2026-02-20T10:00:00Z",
            "deadline": "2026-02-02T17:00:00Z",
            "status": "in progress"
        },
        {
            "title": "Review project requirements",
            "description": "Read and analyze specifications",
            "priority": 0,
            "start": "2026-02-20T14:00:00Z",
            "end": "2026-02-20T15:30:00Z",
            "deadline": "2026-02-03T10:00:00Z",
            "status": "done"
        }
    ]'''
    
    print("\n🌐 API Request Body:")
    print(request_json[:100] + "...")
    
    # Call API endpoint
    response = api_endpoint(request_json)
    
    print("\n📡 API Response:")
    print(response)
    print()


if __name__ == "__main__":
    print("\n" + "🚀 FREE SLOTS FINDER - USAGE EXAMPLES\n")
    
    # Run all examples
    example_1_from_dict_list()
    example_2_from_json_string()
    example_3_simple_wrapper()
    example_4_full_day()
    example_5_fully_booked()
    example_6_api_simulation()
    
    print("="*60)
    print("✅ All examples completed!")
    print("="*60)
