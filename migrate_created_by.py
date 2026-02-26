import sqlite3
import os

DB_PATH = 'backend-python/tracker.db'

def migrate():
    if not os.path.exists(DB_PATH):
        print(f"Error: Database not found at {DB_PATH}")
        return

    conn = sqlite3.connect(DB_PATH)
    try:
        # Check if created_by column exists
        cursor = conn.execute("PRAGMA table_info(tasks)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'created_by' not in columns:
            print("Adding 'created_by' column to 'tasks' table...")
            conn.execute("ALTER TABLE tasks ADD COLUMN created_by TEXT")
            conn.commit()
            print("Migration successful: Added 'created_by' column.")
        else:
            print("Column 'created_by' already exists in 'tasks' table.")
            
    except Exception as e:
        print(f"Migration failed: {e}")
    finally:
        conn.close()

if __name__ == '__main__':
    migrate()
