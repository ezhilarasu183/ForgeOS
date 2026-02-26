import google.generativeai as genai
import os
import json

CONFIG_FILE = "email_config.json"
DEFAULT_GEMINI_KEY = "AIzaSyDr_YBsaSqLb50v38kmCLTcrUgpk80G6MU"

def load_key():
    if os.path.exists(CONFIG_FILE):
        try:
            with open(CONFIG_FILE, "r") as f:
                config = json.load(f)
                return config.get("gemini_key") or config.get("openai_key") or DEFAULT_GEMINI_KEY
        except:
            pass
    return DEFAULT_GEMINI_KEY

key = load_key()
genai.configure(api_key=key)

print(f"Using key starting with: {key[:8]}...")
print("Available models:")
try:
    models = list(genai.list_models())
    model_names = [m.name for m in models if 'generateContent' in m.supported_generation_methods]
    with open("models.json", "w") as f:
        json.dump(model_names, f, indent=2)
    print(f"Saved {len(model_names)} models to models.json")
except Exception as e:
    print(f"Error listing models: {e}")
