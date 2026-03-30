import httpx
import os

def ai_headers() -> dict:
    return {
        "Authorization": f"Bearer {os.getenv('MY_API_KEY')}",
        "Content-Type": "application/json",
    }



async def call_llm(model,message,tempreture,url):

    header = ai_headers()
    payload = {
        "model": "llama-3.1-8b-instant",
        "messages": [{"role": "user", "content": message}],
        "temperature": 0.5,
    }
    async with httpx.AsyncClient(timeout=60) as client:
        response = await client.post(
            url, json=payload, headers=header
        )

    return response.json()

