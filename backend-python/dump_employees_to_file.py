import sqlite3
import hashlib

conn = sqlite3.connect('tracker.db')
conn.row_factory = sqlite3.Row
cursor = conn.cursor()

with open('employees_dump.txt', 'w') as f:
    f.write("Employees in database:\n")
    f.write("-" * 80 + "\n")
    for row in cursor.execute('SELECT id, name, email, password, role FROM employees').fetchall():
        f.write(f"ID: {row['id']}, Name: {row['name']}, Email: {row['email']}, Pass: {row['password']}, Role: {row['role']}\n")

    # Check if 'admin123' password hash matches what's in DB
    admin_pass = "admin123"
    hashed_pass = hashlib.sha256(admin_pass.encode()).hexdigest()
    f.write("\nVerification check:\n")
    f.write(f"Hash of 'admin123': {hashed_pass}\n")

conn.close()
