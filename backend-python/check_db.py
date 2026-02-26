import sqlite3

conn = sqlite3.connect('tracker.db')
c = conn.cursor()

print("Projects in database:")
print("-" * 60)
for row in c.execute('SELECT * FROM projects').fetchall():
    if len(row) >= 4:
        print(f"ID: {row[0]}, Name: {row[1]}, Owner: {row[2]}, Email: {row[3]}")
    else:
        print(f"ID: {row[0]}, Name: {row[1]}, Owner: {row[2]}, Email: MISSING")

conn.close()
