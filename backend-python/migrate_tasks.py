import sqlite3

def migrate():
    conn = sqlite3.connect('tracker.db')
    cursor = conn.cursor()
    
    columns_to_add = [
        ("assignee_email", "TEXT"),
        ("alert_sent", "INTEGER DEFAULT 0"),
        ("reminder_sent", "INTEGER DEFAULT 0"),
        ("reminded", "INTEGER DEFAULT 0")
    ]
    
    for col_name, col_type in columns_to_add:
        try:
            cursor.execute(f"ALTER TABLE tasks ADD COLUMN {col_name} {col_type}")
            print(f"Added column: {col_name}")
        except sqlite3.OperationalError as e:
            if "duplicate column name" in str(e).lower():
                print(f"Column already exists: {col_name}")
            else:
                print(f"Error adding {col_name}: {e}")
                
    conn.commit()
    conn.close()

if __name__ == '__main__':
    migrate()
