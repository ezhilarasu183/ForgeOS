import sqlite3
conn = sqlite3.connect('backend-python/tracker.db')
conn.row_factory = sqlite3.Row
rows = conn.execute("SELECT * FROM employees WHERE LOWER(name) LIKE '%agalya%' OR LOWER(role) = 'admin'").fetchall()
for r in rows:
    print(dict(r))
conn.close()
