import re
import json

def convert_plan_reply_to_json(reply_text: str):
    """
    Converts AI PLAN+EXPLANATION reply into JSON with plan and explanation.
    """
    # Split PLAN and EXPLANATION
    plan_match = re.search(r'PLAN(.*?)EXPLANATION', reply_text, re.DOTALL)
    explanation_match = re.search(r'EXPLANATION\s*(.*)', reply_text, re.DOTALL)
    
    plan_text = plan_match.group(1).strip() if plan_match else ""
    explanation = explanation_match.group(1).strip() if explanation_match else ""
    
    # Capture each numbered task block including first one
    task_blocks = re.findall(r'\d+\.\s+Title:.*?(?=\n\d+\. Title:|\Z)', plan_text, re.DOTALL)
    
    plan = []
    for block in task_blocks:
        lines = block.strip().split('\n')
        task = {}
        # First line: extract title
        title_match = re.match(r'\d+\.\s+Title:\s*(.*)', lines[0])
        task['title'] = title_match.group(1).strip() if title_match else ""
        # Other lines
        for line in lines[1:]:
            if ':' in line:
                key, val = line.split(':', 1)
                task[key.strip().lower()] = val.strip()
        plan.append(task)
    
    return {
        "plan": plan,
        "explanation": explanation
    }


# Example usage
ai_reply_text = """PLAN
1. Title: UI Design Mockups
   Description: Create initial wireframes and mockups for the new dashboard UI.
   Start: 2022-02-02T06:00:00Z
   End: 2022-02-02T07:30:00Z
   Priority: 2
   Status: not started

2. Title: Backend API Design
   Description: Outline the API endpoints required for task management functionalities.
   Start: 2022-02-02T10:00:00Z
   End: 2022-02-02T12:45:00Z
   Priority: 2
   Status: not started

3. Title: Calendar Integration Research
   Description: Investigate options for integrating a calendar feature into the dashboard.
   Start: 2022-02-02T16:15:00Z
   End: 2022-02-02T18:00:00Z
   Priority: 2
   Status: not started

EXPLANATION
This plan effectively utilizes the available free time slots to break down the project into manageable subtasks that focus on the early stages of development. Each task is designed to fit within the scheduled free time, ensuring that progress can be made without overlap with existing commitments. By focusing on UI design, backend API development, and calendar integration research, we lay a solid foundation for the feature-rich task management dashboard."""

json_output = convert_plan_reply_to_json(ai_reply_text)
print(json.dumps(json_output, indent=2))
