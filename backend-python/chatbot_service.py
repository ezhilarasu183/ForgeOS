from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import json
import os
import uvicorn
from threading import Thread

# Import from existing project files
from prompt import SYSTEM_PROMPT
from gemini_client import call_gemini
from meeting_utils import send_meeting_invite

app = FastAPI()

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

CONFIG_FILE = "email_config.json"

def load_email_config():
    if os.path.exists(CONFIG_FILE):
        try:
            with open(CONFIG_FILE, "r") as f:
                return json.load(f)
        except:
            return {}
    return {}

def build_prompt(user_input: str) -> str:
    return f"""{SYSTEM_PROMPT}

User input:
{user_input}
"""

@app.post("/intent")
async def extract_intent(data: dict):
    user_input = data.get("text", "")
    print(f"Received intent request: {user_input}")
    prompt = build_prompt(user_input)
    
    try:
        # call_gemini in this project might require api_key if not hardcoded with default
        # But looking at gemini_client.py, it uses a default if none provided.
        # We can also check config.
        config = load_email_config()
        api_key = config.get("gemini_key", "") # distinct from openai_key? checking app.py
        # app.py uses "gemini_key". email_config.json had "openai_key" but likely user meant gemini or app.py changed it.
        # Actually app.py saves "gemini_key".
        # We'll pass it if available.
        
        ai_response = call_gemini(prompt, api_key)
        print(f"Gemini response: {ai_response}")
    except Exception as e:
        print(f"Error calling Gemini: {e}")
        return {"error": str(e)}

    try:
        parsed = json.loads(ai_response)
    except json.JSONDecodeError:
        return {"error": "Invalid JSON from model", "raw": ai_response}

    if parsed.get("action") == "schedule_meeting":
        attendees = parsed.get("attendees", [])
        subject = parsed.get("subject", "Meeting")
        start_time = parsed.get("start_time", "tomorrow 10am")
        
        # Fetch credentials dynamically
        config = load_email_config()
        sender = config.get("email_sender")
        password = config.get("email_password")
        
        if sender and password:
            result = send_meeting_invite(attendees, subject, start_time, sender, password)
        else:
            result = "Failed: Email credentials not configured in Project Tracker."
            
        parsed["status"] = result
        
        if "sent" in result.lower() and "failed" not in result.lower():
            parsed["reply"] = f"✅ Sent! I've scheduled the '{subject}' meeting with {', '.join(attendees)} for {start_time}."
        else:
            parsed["reply"] = f"❌ I couldn't send the invite. Error: {result}"

    return parsed

# Serve Static Files if they exist (optional, matching PRODUCT (2))
if not os.path.exists("static"):
    os.makedirs("static")

app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
def read_root():
    if os.path.exists("static/index.html"):
        return FileResponse("static/index.html")
    return {"message": "Chatbot Service Running"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
