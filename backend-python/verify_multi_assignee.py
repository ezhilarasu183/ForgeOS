
import sys
import os
import unittest
from unittest.mock import MagicMock
import sqlite3
from datetime import date

# 1. Setup Mock Streamlit BEFORE importing app
mock_st = MagicMock()
sys.modules["streamlit"] = mock_st

class MockSessionState(dict):
    """Wait for it... it's a dict AND an object!"""
    def __getattr__(self, name):
        if name in self:
            return self[name]
        raise AttributeError(f"'MockSessionState' object has no attribute '{name}'")
    def __setattr__(self, name, value):
        self[name] = value

mock_st.session_state = MockSessionState()
mock_st.radio.return_value = "📊 Dashboard"
mock_st.button.return_value = False
mock_st.chat_input.return_value = None

def mock_columns(spec):
    if isinstance(spec, int):
        return [MagicMock() for _ in range(spec)]
    elif isinstance(spec, (list, tuple)):
        return [MagicMock() for _ in range(len(spec))]
    return MagicMock()

mock_st.columns.side_effect = mock_columns

# 2. Setup In-Memory DB
# We need to replicate the DB structure roughly or let app.py create it
# app.py creates tables on import if c is available.
# So let's provide c.
conn = sqlite3.connect(":memory:")
c = conn.cursor()

# Pre-populate session_state so app.py uses our DB
mock_st.session_state["db_conn"] = conn
mock_st.session_state["db_cursor"] = c
# Config
mock_st.session_state["email_sender"] = "test_sender@gmail.com"
mock_st.session_state["email_password"] = "secret"
mock_st.session_state["gemini_key"] = "key"
mock_st.session_state["config_loaded"] = True

# 3. Import app
# Ensure we can import modules in this dir
sys.path.append(os.getcwd())

import app

# Monkey patch _send_email_thread to verify calls
# app.py defines _send_email_thread
mock_send_email = MagicMock()
app._send_email_thread = mock_send_email

def run_tests():
    print("=== START VERIFICATION ===")

    # --- Test 1: Add Project ---
    print("\n[Test 1] Adding Project...")
    app.add_project("Test Project", "Owner", "owner@example.com")
    
    # Verify Project ID is 1 (starts at 1 in sqlite autoincrement usually)
    projs = app.get_projects()
    if len(projs) == 1:
        print("✅ Project added.")
    else:
        print(f"❌ Project add failed. Count: {len(projs)}")
        return

    p_id = projs[0][0]

    # --- Test 2: Add Task with Multiple Assignees ---
    print("\n[Test 2] Adding Task with Multiple Assignees...")
    app.add_task(
        project_id=p_id,
        task="Multi Assignee Task",
        due_date="2025-12-31",
        priority="High",
        assignee="Alice, Bob",
        assignee_email="alice@example.com, bob@example.com"
    )

    # Verify DB
    row = c.execute("SELECT assignee, assignee_email FROM tasks WHERE task='Multi Assignee Task'").fetchone()
    print(f"DB Row: {row}")
    
    if row[0] == "Alice, Bob" and row[1] == "alice@example.com, bob@example.com":
        print("✅ DB Insert verified.")
    else:
        print("❌ DB Insert Failed.")

    # Verify Email Calls from add_task
    # Should be 2 calls: one for alice, one for bob
    print(f"Email calls count: {mock_send_email.call_count}")
    # Inspect arguments
    calls = mock_send_email.call_args_list
    recipients = [call[0][0] for call in calls]
    print(f"Recipients called: {recipients}")
    
    if len(recipients) == 2 and "alice@example.com" in recipients and "bob@example.com" in recipients:
        print("✅ Email Logic for Add Task verified.")
    else:
        print("❌ Email Logic for Add Task Failed.")

    # Reset mock for next test
    mock_send_email.reset_mock()

    # --- Test 3: Check Deadline Notifications ---
    print("\n[Test 3] Checking Deadline Notifications...")
    
    # Add task due TODAY
    today_str = str(date.today())
    app.add_task(
        project_id=p_id,
        task="Due Today Task",
        due_date=today_str,
        priority="High",
        assignee="Charlie, Dave",
        assignee_email="charlie@example.com, dave@example.com"
    )

    # Clear calls from add_task (we want to check check_deadline_notifications)
    mock_send_email.reset_mock()

    # Run check
    app.check_deadline_notifications()

    # Should send to: charlie, dave, AND owner (owner@example.com)
    # Total 3 calls expected
    
    print(f"Notification calls count: {mock_send_email.call_count}")
    calls = mock_send_email.call_args_list
    recipients = [call[0][0] for call in calls]
    print(f"Recipients called: {recipients}")
    
    expected = ["charlie@example.com", "dave@example.com", "owner@example.com"]
    missing = [e for e in expected if e not in recipients]
    
    if not missing:
        print("✅ Notification Logic verified (All recipients included).")
    else:
        print(f"❌ Notification Logic Failed. Missing: {missing}")

    print("\n=== END VERIFICATION ===")

if __name__ == "__main__":
    run_tests()
