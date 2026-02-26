import sqlite3
import hashlib

def dump_db():
    conn = sqlite3.connect('tracker.db')
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    print("TABLE: employees")
    rows = cursor.execute("SELECT * FROM employees").fetchall()
    for row in rows:
        print(dict(row))
    
    print("\nTABLE: projects")
    rows = cursor.execute("SELECT * FROM projects").fetchall()
    for row in rows:
        print(dict(row))
        
    conn.close()

if __name__ == "__main__":
    dump_db()
