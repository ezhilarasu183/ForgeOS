import sqlite3
conn = sqlite3.connect('backend-python/tracker.db')
conn.row_factory = sqlite3.Row
rows = conn.execute('SELECT id, name, email, role FROM employees').fetchall()
for r in rows:
    print(dict(r))
conn.close()
