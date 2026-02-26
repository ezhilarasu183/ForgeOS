# AI Project Management System Redesign

This project is organized into two main parts: a **Next.js frontend** and an **Express backend skeleton**. The legacy Python logic has been moved to a separate directory for reference and utility use.

## Prerequisites
- **Node.js**: Version 18 or higher.
- **npm**: Installed with Node.js.

---

## 1. Running the Frontend (Next.js)

The frontend is a modern UI-only demo built with Next.js 14 and Tailwind CSS.

1.  **Navigate to the frontend directory**:
    ```bash
    cd frontend
    ```
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Start the development server**:
    ```bash
    npm run dev
    ```
4.  **Open in Browser**:
    Go to [http://localhost:3000](http://localhost:3000). You will be redirected to the Login page.

---

## 2. Running the Backend (Express)

The backend is a Node.js server that provides the API endpoints (currently placeholders for demo purposes).

1.  **Navigate to the backend directory**:
    ```bash
    cd backend
    ```
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Start the server**:
    ```bash
    npm start
    ```
    *Or use `npm run dev` if you have nodemon installed.*
4.  **Verification**:
    The API will be running on [http://localhost:5000](http://localhost:5000).

---

## 3. Legacy Python Backend (Reference)

The legacy Python code is located in `backend-python`. This contains the core AI logic and database interactions from the previous Streamlit version.

- To run standard Python scripts, navigate to `backend-python` and use `python <filename>.py`.
- **Note**: The Streamlit UI has been removed; these scripts now serve as utility functions.

---

## Folder Structure
- `/frontend`: Next.js application, components, and pages.
- `/backend`: Node.js Express server, models, and routes.
- `/backend-python`: Legacy Python scripts and trackers.
- `/uploads`: Directory for file attachments (used by the python scripts).
