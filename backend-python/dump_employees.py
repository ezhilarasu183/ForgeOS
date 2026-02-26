import sqlite3
import hashlib

conn = sqlite3.connect('tracker.db')
conn.row_factory = sqlite3.Row
cursor = conn.cursor()

print("Employees in database:")
print("-" * 80)
for row in cursor.execute('SELECT id, name, email, password, role FROM employees').fetchall():
    print(f"ID: {row['id']}, Name: {row['name']}, Email: {row['email']}, Pass: {row['password']}, Role: {row['role']}")

# Check if 'admin123' password hash matches what's in DB
admin_pass = "admin123"
hashed_pass = hashlib.sha256(admin_pass.encode()).hexdigest()
print("\nVerification check:")
print(f"Hash of 'admin123': {hashed_pass}")

conn.close()
