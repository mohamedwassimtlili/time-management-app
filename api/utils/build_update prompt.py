import json





def build_update_prompt(session: dict, user_message: str) -> str:
    current_plan_json = json.dumps(session.get("plan", []), indent=2)

    return f"""
You are a scheduling assistant.

CURRENT PLAN:
{current_plan_json}

USER REQUEST:
{user_message}

Update the plan...

PLAN
...
EXPLANATION
...
"""