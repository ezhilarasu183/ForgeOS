import requests
import json
import time

def test_chatbot():
    url = "http://localhost:8000/intent"
    payload = {"text": "Schedule a meeting with Ezhil about Project Alpha tomorrow at 2pm"}
    
    print(f"Testing Chatbot API at {url}...")
    try:
        response = requests.post(url, json=payload)
        print(f"Status Code: {response.status_code}")
        print("Response:")
        print(json.dumps(response.json(), indent=2))
        
        if response.status_code == 200:
            print("\n✅ Chatbot API test passed!")
        else:
            print("\n❌ Chatbot API test failed!")
            
    except Exception as e:
        print(f"\n❌ Error connecting to Chatbot API: {e}")

if __name__ == "__main__":
    # Wait a bit for services to start
    # time.sleep(5) 
    test_chatbot()
