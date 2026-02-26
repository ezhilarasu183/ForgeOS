import requests

def test_login(email, password):
    url = "http://localhost:5001/api/login"
    payload = {"email": email, "password": password}
    try:
        response = requests.post(url, json=payload)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    print("Testing admin123 / admin123")
    test_login("admin123", "admin123")
    print("\nTesting Agalya / (wrong pass)")
    test_login("agalyal5.3@protosem.tech", "wrong")
