import sqlite3

def get_schema():
    conn = sqlite3.connect('tracker.db')
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()
    
    for table_name in tables:
        table_name = table_name[0]
        print(f"\nTable: {table_name}")
        print("-" * (7 + len(table_name)))
        cursor.execute(f"PRAGMA table_info({table_name});")
        columns = cursor.fetchall()
        for col in columns:
            print(f"  {col[1]} ({col[2]})")
            
    conn.close()

if __name__ == "__main__":
    get_schema()
