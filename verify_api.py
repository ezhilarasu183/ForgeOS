import requests
import json

BASE_URL = "http://localhost:5000"

def test_endpoint(name, method, path, data=None, params=None):
    print(f"Testing {name} ({method} {path})...", end=" ")
    try:
        if method == "GET":
            response = requests.get(f"{BASE_URL}{path}", params=params)
        else:
            response = requests.post(f"{BASE_URL}{path}", json=data)
        
        if response.status_code in [200, 201]:
            print("OK")
            return response.json()
        else:
            print(f"FAILED ({response.status_code})")
            print(response.text)
            return None
    except Exception as e:
        print(f"ERROR: {e}")
        return None

def run_tests():
    # 1. Login
    login_data = {"email": "rithangautham@gmail.com", "password": "admin123"}
    user = test_endpoint("Login", "POST", "/api/login", data=login_data)
    
    # 2. Employees
    test_endpoint("Get Employees", "GET", "/api/users/employees")
    
    # 3. Projects
    test_endpoint("Get Projects", "GET", "/api/projects")
    
    # 4. Tasks
    test_endpoint("Get Tasks", "GET", "/api/tasks")
    
    # 5. Stats Admin
    test_endpoint("Admin Stats", "GET", "/api/stats/admin")
    
    # 6. Stats Employee
    test_endpoint("Employee Stats", "GET", "/api/stats/employee", params={"email": "rithangautham@gmail.com"})
    
    # 7. Activity
    test_endpoint("Activity Logs", "GET", "/api/activity")
    
    # 8. AI Chat (Mocking if key missing)
    test_endpoint("AI Chat", "POST", "/api/ai/chat", data={"message": "Hello"})
    
    # 9. AI Task Intent
    test_endpoint("AI Task Intent", "POST", "/api/ai/task-intent", data={"text": "Add a task for coding"})

if __name__ == "__main__":
    run_tests()
