
import sys
import unittest
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

class TestAssigneeUI(unittest.TestCase):
    def setUp(self):
        # Reset session state assignees
        mock_st.session_state.assignees = [{"name": "A", "email": "a@a.com"}, {"name": "B", "email": "b@b.com"}]
        mock_st.rerun.reset_mock()
        mock_st.button.reset_mock()
        mock_st.columns.reset_mock()
    
    def test_rendering(self):
        print("\nTesting Rendering...")
        # Mock button to always return False (no action)
        mock_st.button.return_value = False 
        # But we need column buttons (the Xs) to return False too.
        # columns() returns mocks, their button() method returns False by default if not set.
        
        # We need to ensure columns() returns fresh mocks each time to count properly
        # But side_effect = mock_columns does that. (Creates new MagicMock())
        
        app.render_assignees()
        
        # Verify columns called twice (once per assignee)
        self.assertEqual(mock_st.columns.call_count, 2)
        print("✅ Rendering passed.")
        
    def test_add_assignee(self):
        print("\nTesting Add Assignee...")
        # Mock global button "Add Assignee" to True
        # But st.button is mocked globally.
        # The loop (render_assignees) calls c3.button and st.button (global).
        # We want st.button to return True.
        
        # When render_assignees runs:
        # Loop i=0 to 1: c3.button called.
        # Then st.button called.
        
        # Make mock_st.button return False by default, but trigger True if label matches "Add Assignee"
        
        def button_side_effect(label, **kwargs):
            if "Add Assignee" in label:
                return True
            return False
            
        mock_st.button.side_effect = button_side_effect
        
        app.render_assignees()
        
        # Should equate to 3 assignees now
        print(f"Assignees count: {len(mock_st.session_state.assignees)}")
        self.assertEqual(len(mock_st.session_state.assignees), 3)
        mock_st.rerun.assert_called()
        print("✅ Add Assignee passed.")

    def test_remove_assignee(self):
        print("\nTesting Remove Assignee...")
        # We want to remove the second assignee (Index 1)
        # So we need the button call on the 2nd column set to return True.
        
        # Strategy: Override mock_st.columns to return specific mocks we control.
        # We want the SECOND call to columns to return a mock c3 that returns True on button().
        
        mock_c3_0 = MagicMock()
        mock_c3_0.button.return_value = False
        
        mock_c3_1 = MagicMock()
        mock_c3_1.button.return_value = True # Clicked!
        
        # Create mocks for calls
        row0 = [MagicMock(), MagicMock(), mock_c3_0]
        row1 = [MagicMock(), MagicMock(), mock_c3_1]
        
        mock_st.columns.side_effect = [row0, row1]
        
        # Ensure global add button is False
        mock_st.button.side_effect = None
        mock_st.button.return_value = False
        
        app.render_assignees()
        
        # Should have 1 assignee left (A)
        print(f"Assignees count: {len(mock_st.session_state.assignees)}")
        # Check remaining items
        remaining_names = [a["name"] for a in mock_st.session_state.assignees]
        print(f"Remaining: {remaining_names}")
        
        self.assertEqual(len(mock_st.session_state.assignees), 1)
        self.assertEqual(mock_st.session_state.assignees[0]["name"], "A")
        mock_st.rerun.assert_called()
        print("✅ Remove Assignee passed.")

if __name__ == "__main__":
    unittest.main()
