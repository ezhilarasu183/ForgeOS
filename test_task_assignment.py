import requests
import json

base_url = "http://localhost:5000/api"

# 1. Create a task assigned to someone else, but created by 'admin@demo.com'
task_data = {
    "title": "Assigned by Admin to Employee",
    "dueDate": "2026-12-31",
    "priority": "High",
    "assignee": "Some Employee",
    "project_id": 1003,
    "created_by": "admin@demo.com"
}

print("Creating task assigned to someone else...")
resp = requests.post(f"{base_url}/tasks", json=task_data)
if resp.ok:
    print("Task created successfully.")
else:
    print(f"Failed to create task: {resp.text}")
    exit(1)

# 2. Fetch stats for 'admin@demo.com' and verify the task is present
print("\nFetching stats for admin@demo.com...")
stats_resp = requests.get(f"{base_url}/stats/employee?email=admin@demo.com")
if stats_resp.ok:
    data = stats_resp.json()
    tasks = data.get('tasks', [])
    found = any(t['task'] == "Assigned by Admin to Employee" for t in tasks)
    if found:
        print("✅ SUCCESS: Task assigned by Admin found in Admin's stats.")
    else:
        print("❌ FAILURE: Task NOT found in Admin's stats.")
else:
    print(f"Failed to fetch stats: {stats_resp.text}")
