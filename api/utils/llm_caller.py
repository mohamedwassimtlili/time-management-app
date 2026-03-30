import httpx
import os

def ai_headers() -> dict:
    return {
        "Authorization": f"Bearer {os.getenv('MY_API_KEY')}",
        "Content-Type": "application/json",
    }

async def call_llm(model: str, messages: list, temperature: float, url: str) -> dict:
    payload = {
        "model": model,
        "messages": messages,
        "temperature": temperature,
    }

    async with httpx.AsyncClient(timeout=60) as client:
        try:
            print("call_llm -> POST", url)
            print("call_llm payload:\n", payload)
            response = await client.post(url, json=payload, headers=ai_headers())
        except Exception as e:
            print("call_llm network error:", repr(e))
            raise

    try:
        response.raise_for_status()
    except httpx.HTTPStatusError as e:
        # Log response content for debugging
        print("call_llm HTTP error status:", e.response.status_code)
        try:
            print("call_llm response body:", e.response.text)
        except Exception:
            pass
        raise

    try:
        return response.json()
    except Exception as e:
        print("call_llm: failed to parse JSON response:", repr(e))
        print("raw response:", response.text)
        raise