
import sys
import unittest
from unittest.mock import MagicMock
import sqlite3

# 1. Setup Mock Streamlit BEFORE importing app
mock_st = MagicMock()
sys.modules["streamlit"] = mock_st
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
c = conn.cursor()
mock_st.session_state["db_conn"] = conn
mock_st.session_state["db_cursor"] = c
mock_st.session_state["email_sender"] = "test"
mock_st.session_state["email_password"] = "test"
mock_st.session_state["gemini_key"] = "test"
mock_st.session_state["config_loaded"] = True

import app

class TestProjectEdit(unittest.TestCase):
    def test_update_project(self):
        print("\nTesting Update Project...")
        
        # Add project
        app.add_project("Original Name", "Original Owner", "orig@test.com")
        
        # Get ID
        projs = app.get_projects()
        p_id = projs[0][0]
        
        # Update
        app.update_project_details(p_id, "New Name", "New Owner", "new@test.com")
        
        # Verify
        updated = c.execute("SELECT name, owner, email FROM projects WHERE id=?", (p_id,)).fetchone()
        
        self.assertEqual(updated[0], "New Name")
        self.assertEqual(updated[1], "New Owner")
        self.assertEqual(updated[2], "new@test.com")
        print("✅ Backend Project Update passed.")

if __name__ == "__main__":
    unittest.main()
