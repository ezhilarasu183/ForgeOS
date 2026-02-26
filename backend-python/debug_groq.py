import os

GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = "llama3-8b-8192"

GROQ_MEETING_SYSTEM_PROMPT = """
You are an AI assistant for a project management system. Your job is to understand user requests about scheduling meetings.

When the user says something like "send a meeting to ezhil and rithan" or "schedule a call with the team tomorrow at 3pm":
- Extract all people names mentioned
- Extract the subject/purpose if mentioned
- Extract any URL (like Google Meet link) as "meeting_link"
- Extract date and time if mentioned (convert relative dates like "tomorrow" to actual dates based on today)
- Return structured JSON only

Today's date context will be provided in the user message.

Return ONLY valid JSON:
{
  "action": "schedule_meeting",
  "attendees": ["name1", "name2"],
  "subject": "meeting subject or 'Team Meeting' if not specified",
  "start_time": "YYYY-MM-DD HH:MM",
  "meeting_link": "URL_IF_FOUND_OR_NULL"
}
"""

def test_groq(text):
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    today_str = datetime.now().strftime("%Y-%m-%d (a %A)")
    payload = {
        "model": GROQ_MODEL,
        "messages": [
            {"role": "system", "content": GROQ_MEETING_SYSTEM_PROMPT},
            {"role": "user", "content": f"Today is {today_str}.\n\nUser request: {text}"}
        ],
        "temperature": 0.1,
        "max_tokens": 512
    }
    resp = http_requests.post(GROQ_API_URL, headers=headers, json=payload, timeout=15)
    print(resp.json()["choices"][0]["message"]["content"].strip())

if __name__ == "__main__":
    test_groq("schedule a meeting rithan gautham https://meet.google.com/iwi-bkeb-ftv")
