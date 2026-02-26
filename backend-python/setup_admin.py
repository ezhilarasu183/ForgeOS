import sqlite3
import hashlib

conn = sqlite3.connect('tracker.db')
cursor = conn.cursor()

admin_email = "admin123"
admin_pass = "admin123"
hashed_pass = hashlib.sha256(admin_pass.encode()).hexdigest()

# Check if user exists
user = cursor.execute("SELECT * FROM employees WHERE email=?", (admin_email,)).fetchone()

if user:
    print(f"Updating existing user {admin_email}")
    cursor.execute("UPDATE employees SET password=?, role='Admin' WHERE email=?", (hashed_pass, admin_email))
else:
    print(f"Creating new admin user {admin_email}")
    cursor.execute(
        "INSERT INTO employees (name, email, password, role, username) VALUES (?,?,?,?,?)",
        ("Admin User", admin_email, hashed_pass, "Admin", admin_email)
    )

conn.commit()
conn.close()
print("Database updated successfully.")
