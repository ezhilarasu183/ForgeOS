import sqlite3
conn = sqlite3.connect('backend-python/tracker.db')
conn.execute("UPDATE employees SET name='Agalya' WHERE id=11")
conn.commit()
conn.close()
print('Admin user renamed to Agalya successfully.')
