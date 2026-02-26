
import sys
from unittest.mock import MagicMock
import sqlite3

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
mock_st.rerun = MagicMock()

# Setup in-memory DB so import doesn't fail
conn = sqlite3.connect(":memory:")
mock_st.session_state["db_conn"] = conn
mock_st.session_state["db_cursor"] = conn.cursor()
mock_st.session_state["email_sender"] = "test"
mock_st.session_state["email_password"] = "test"
mock_st.session_state["gemini_key"] = "test"
mock_st.session_state["config_loaded"] = True

import app

# --- TEST LOGIC ---

# Test 1: Rendering
def test_1():
    print("Testing Rendering...")
    mock_st.session_state.assignees = [{"name": "A", "email": "a"}, {"name": "B", "email": "b"}]
    mock_st.columns.reset_mock()
    app.render_assignees()
    print(f"Columns call count: {mock_st.columns.call_count}")
    if mock_st.columns.call_count == 2:
        print("PASS Rendering")
    else:
        print("FAIL Rendering")

# Test 2: Add Assignee
def test_2():
    print("\nTesting Add Assignee...")
    mock_st.session_state.assignees = [{"name": "A", "email": "a"}]
    
    # Mock global Add button
    def button_side_effect(label, **kwargs):
        if "Add Assignee" in label:
            return True
        return False
        
    mock_st.button.side_effect = button_side_effect
    
    app.render_assignees()
    print(f"Assignees count: {len(mock_st.session_state.assignees)}")
    if len(mock_st.session_state.assignees) == 2:
         print("PASS Add Assignee")
    else:
         print("FAIL Add Assignee")

# Test 3: Remove Assignee (Index 0 for simplicity)
def test_3():
    print("\nTesting Remove Assignee...")
    mock_st.session_state.assignees = [{"name": "A", "email": "a"}, {"name": "B", "email": "b"}]
    
    # We want to delete index 0 (A)
    # mock_st.columns returns row mocks.
    # We need the FIRST row's 3rd column button to return True.
    
    mock_c3_0 = MagicMock()
    mock_c3_0.button.return_value = True # Clicked remove on A
    
    mock_c3_1 = MagicMock()
    mock_c3_1.button.return_value = False
    
    row0 = [MagicMock(), MagicMock(), mock_c3_0]
    row1 = [MagicMock(), MagicMock(), mock_c3_1]
    
    mock_st.columns.side_effect = [row0, row1]
    mock_st.button.side_effect = None
    mock_st.button.return_value = False
    
    app.render_assignees()
    
    print(f"Assignees count: {len(mock_st.session_state.assignees)}")
    if len(mock_st.session_state.assignees) == 1:
        print(f"Remaining: {mock_st.session_state.assignees[0]['name']}")
        if mock_st.session_state.assignees[0]["name"] == "B":
             print("PASS Remove Assignee")
        else:
             print("FAIL Remove Assignee (Wrong item removed)")
    else:
        print("FAIL Remove Assignee (Count mismatch)")

# Run tests
test_1()
test_2()
test_3()
