import sqlite3
conn = sqlite3.connect('backend-python/tracker.db')
conn.row_factory = sqlite3.Row

with open('db_report.txt', 'w') as f:
    f.write("DB AUDIT REPORT\n")
    f.write("=" * 100 + "\n\n")
    
    f.write("ALL EMPLOYEES:\n")
    rows = conn.execute("SELECT * FROM employees ORDER BY name").fetchall()
    for r in rows:
        f.write(str(dict(r)) + "\n")
    
    f.write("\nDUPLICATE NAMES:\n")
    rows = conn.execute("SELECT name, COUNT(*) as count FROM employees GROUP BY name HAVING count > 1").fetchall()
    for r in rows:
        f.write(f"Name '{r['name']}' has {r['count']} records.\n")
        
    f.write("\nDUPLICATE EMAILS:\n")
    rows = conn.execute("SELECT email, COUNT(*) as count FROM employees GROUP BY email HAVING count > 1").fetchall()
    for r in rows:
        f.write(f"Email '{r['email']}' has {r['count']} records.\n")
        
    f.write("\nTASKS WITHOUT ASSIGNEE EMAIL:\n")
    rows = conn.execute("SELECT id, task, assignee, assignee_email FROM tasks WHERE assignee_email IS NULL OR assignee_email = ''").fetchall()
    for r in rows:
        f.write(str(dict(r)) + "\n")

conn.close()
