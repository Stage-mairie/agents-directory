
# 📇 City of Saint-André – Staff Directory

This project is a web application for managing city hall staff members (add, search, sort, delete).  
It uses a **HTML/CSS/JS** frontend and a **Python + SQLite** backend.

---

## 🚀 Getting Started

### 1. Create the database
Before running the application, initialize the database with:

```bash
python3 init_db.py
```

This generates a `data.db` file containing the `agents` table.

### 2. Start the server
Launch the local server with:

```bash
python3 server.py
```

Once running, open your browser at:  

👉 [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
.
├── backend
│   ├── __pycache__/
│   ├── sql/
│   ├── auth.py
│   ├── db.py
│   ├── handlers.py
│   ├── init_db.py
│   └── server.py
│
├── frontend
│   ├── css/
│   ├── images/
│   ├── js/
│   ├── agents.html
│   └── login.html
│
├── .gitattributes
├── .gitignore
└── README.md
```

---

## ⚙️ Features

- 🔐 **Role-based authentication**
  - **Admin**: can add, edit, or delete staff members.  
  - **User**: can only view staff information.
- 🔍 Search staff by first or last name  
- 🗂️ Filter by department/service  
- ➕ Add staff members via dynamic form  
- ✏️ Edit staff details (admin only)  
- 🗑️ Delete staff member by email (via modal)  
- 💡 Responsive layout with clean and simple design  

---

## ✅ Dependencies

No installation required. The project only uses:

- **Python 3** (standard libraries: `http.server`, `sqlite3`, `json`)  
- **A modern web browser**

---

## 🛠️ Customization

- `images/logo.png` → replace this file with the city hall logo  
- `style.css` → update colors, fonts, or layout as needed  

---

## 📬 Contact

For any questions, please contact the **IT Department of the City of Saint-André**.