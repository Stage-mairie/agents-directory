# 📇 City of Saint-André – Staff Directory

This project is a web application for managing city hall staff members (add, search, sort, delete).
It uses a HTML/CSS/JS frontend and a Python Flask + MySQL backend.

---

## Getting Started

1. Install dependencies:  
pip install flask flask-mysqldb

2. Configure the database:  
Create a MySQL database and update your credentials in backend/db.py:  
DB_CONFIG = {
    "host": "localhost",
    "user": "root",
    "password": "your_password",
    "database": "name_of_your_db"
}

3. Start the server:  
python3 backend/server.py

Open your browser at: http://localhost:5000

---

## Project Structure
```
.
├── backend
│   ├── __pycache__/
│   ├── auth.py (authentication: login, role check)
│   ├── db.py (database connection and queries)
│   ├── init_db.py (creates MySQL tables)
│   └── server.py (Flask app)
├── frontend
│   ├── css/
│   ├── images/ (logos, default avatars)
│   ├── js/
│   ├── photos/ (staff profile pictures)
│   └── agents.html
├── .gitattributes
├── .gitignore
└── README.md

```
---

## Features

- Role-based authentication
  - Admin: can add, edit, or delete staff members
  - User: can only view staff information
- Search staff by first or last name
- Search staff by phone number (mobile, landline, or internal extension)
- Filter by department/service
- Add staff members via dynamic form
- Edit staff details (admin only)
- Delete staff member by email (via modal)
- Profile pictures for staff
- Copy phone numbers or emails easily via one-click buttons
- Responsive layout with clean and simple design

---

## Dependencies

- Python 3
- Flask (pip install flask flask-mysqldb)
- MySQL (or MariaDB)
- A modern web browser

---

## Customization

- images/logo.png → replace with your city hall logo
- photos/ → add staff profile pictures (optional)
- style.css → update colors, fonts, or layout as needed

---

