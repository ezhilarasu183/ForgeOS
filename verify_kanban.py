import requests
import json

BASE_URL = "http://localhost:5000/api"

def verify_kanban():
    print("Testing Kanban Task Assignment...")
    
    # 1. Get a project
    proj_resp = requests.get(f"{BASE_URL}/projects")
    projects = proj_resp.json()
    if not projects:
        print("No projects found.")
        return
    project = projects[0]
    proj_id = project['id']
    print(f"Using Project: {project['name']} (ID: {proj_id})")

    # 2. Get an employee
    emp_resp = requests.get(f"{BASE_URL}/users/employees")
    employees = emp_resp.json()
    if not employees:
        print("No employees found.")
        return
    employee = employees[0]
    print(f"Target Employee: {employee['name']}")

    # 3. Create a task for this project assigned to this employee
    task_data = {
        "title": f"Kanban Test Task {int(time.time())}",
        "dueDate": "2026-12-31",
        "priority": "High",
        "assignee": employee['name'],
        "status": "todo",
        "project_id": proj_id
    }
    
    create_resp = requests.post(f"{BASE_URL}/tasks", json=task_data)
    if create_resp.status_code == 201:
        print("Task created successfully via API")
        task_id = create_resp.json()['id']
    else:
        print(f"Failed to create task: {create_resp.text}")
        return

    # 4. Verify task appears in project-specific tasks
    tasks_resp = requests.get(f"{BASE_URL}/tasks?project_id={proj_id}")
    proj_tasks = tasks_resp.json()
    found_in_proj = any(t['id'] == task_id for t in proj_tasks)
    if found_in_proj:
        print("Task correctly visible in project filter")
    else:
        print("Task NOT found in project filter")

    # 5. Verify task appears in employee's tasks
    emp_tasks_resp = requests.get(f"{BASE_URL}/stats/employee?email={employee['email']}&name={employee['name']}")
    emp_tasks = emp_tasks_resp.json()['tasks']
    found_in_emp = any(t['id'] == task_id for t in emp_tasks)
    if found_in_emp:
        print("Task correctly visible in employee panel")
    else:
        print("Task NOT found in employee panel")

if __name__ == "__main__":
    import time
    verify_kanban()
