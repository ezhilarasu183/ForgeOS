import google.generativeai as genai
import json
import streamlit as st

# Default key from PRODUCT codebase, used if user doesn't provide one
# Default key removed as per user request
GEMINI_API_KEY_DEFAULT = ""

def call_gemini(prompt: str, api_key: str = None) -> str:
    key_to_use = api_key if api_key else GEMINI_API_KEY_DEFAULT
    
    if not key_to_use:
        return json.dumps({"error": "No API Key provided"})

    genai.configure(api_key=key_to_use)
    
    # Using gemini-flash-latest which is in the confirmed list
    try:
        model = genai.GenerativeModel(
            model_name="gemini-flash-latest",
            generation_config={"response_mime_type": "application/json"}
        )
        
        response = model.generate_content(prompt)
        
        if not response.text:
            return "{}"
            
        return response.text
    except Exception as e:
        if "429" in str(e) or "Quota exceeded" in str(e):
            return json.dumps({"error": "Gemini API Quota Exceeded. Please try again in 1 minute or update your API key in Settings."})
        return json.dumps({"error": str(e)})
