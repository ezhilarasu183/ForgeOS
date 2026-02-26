import subprocess
import time
import os
import sys

def run_services():
    print("Starting Project Tracker Services...")

    # 1. Start FastAPI Chatbot (Port 8000)
    chatbot_cmd = [sys.executable, "chatbot_service.py"]
    chatbot_process = subprocess.Popen(chatbot_cmd)
    print(f"Started Chatbot Service (PID: {chatbot_process.pid})")

    # 2. Start Streamlit App (Port 8501)
    # We use 'run' command for streamlit
    streamlit_cmd = [sys.executable, "-m", "streamlit", "run", "app.py"]
    streamlit_process = subprocess.Popen(streamlit_cmd)
    print(f"Started Streamlit App (PID: {streamlit_process.pid})")

    try:
        while True:
            time.sleep(1)
            # Check if processes are still alive
            if chatbot_process.poll() is not None:
                print("Chatbot Service exited unexpectedly.")
                break
            if streamlit_process.poll() is not None:
                print("Streamlit App exited unexpectedly.")
                break
    except KeyboardInterrupt:
        print("\nStopping services...")
        chatbot_process.terminate()
        streamlit_process.terminate()
        print("Services stopped.")

if __name__ == "__main__":
    run_services()
