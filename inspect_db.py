import sqlite3
conn = sqlite3.connect('backend-python/tracker.db')
conn.row_factory = sqlite3.Row

print("Detailed Employee Report:")
print("-" * 100)
rows = conn.execute("SELECT * FROM employees ORDER BY name").fetchall()
for r in rows:
    print(dict(r))

print("\nDuplicate Name Check:")
rows = conn.execute("SELECT name, COUNT(*) as count FROM employees GROUP BY name HAVING count > 1").fetchall()
for r in rows:
    print(f"Name '{r['name']}' has {r['count']} records.")

print("\nDuplicate Email Check:")
rows = conn.execute("SELECT email, COUNT(*) as count FROM employees GROUP BY email HAVING count > 1").fetchall()
for r in rows:
    print(f"Email '{r['email']}' has {r['count']} records.")

conn.close()
