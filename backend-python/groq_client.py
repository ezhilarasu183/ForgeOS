import requests
import json

def call_groq(prompt: str, api_key: str = None) -> str:
    if not api_key:
        return json.dumps({"error": "No API Key provided"})

    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    # Using llama-3.3-70b-versatile as requested/planned
    payload = {
        "model": "llama-3.3-70b-versatile",
        "messages": [
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.7
    }

    try:
        response = requests.post(url, headers=headers, json=payload)
        response.raise_for_status()
        data = response.json()
        
        if "choices" in data and len(data["choices"]) > 0:
            return data["choices"][0]["message"]["content"]
        
        return "{}"
    except Exception as e:
        return json.dumps({"error": str(e)})
