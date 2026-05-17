# TaskFlow — Team Task Manager

A full-stack web application for managing projects and tasks with role-based access control.

## 🚀 Live Demo

- **Frontend:** `https://taskflow-frontend.up.railway.app`
- **Backend API:** `https://taskflow-backend.up.railway.app`

---

## ✨ Features

### Authentication
- Signup / Login with JWT
- Role-based access: **Admin** and **Member**

### Admin Can:
- Create, edit, delete Projects
- Add/remove team members to projects
- Create, assign, edit, delete Tasks
- View all tasks and team dashboard

### Member Can:
- View projects they are added to
- View their assigned tasks
- Update task status (Pending → In Progress → Completed)

### Dashboard
- Total tasks, Pending, In Progress, Completed, Overdue count
- Recent tasks overview

### Task Management
- Create tasks with title, description, assignee, due date, priority, status
- Status: `pending` | `in-progress` | `completed`
- Priority: `low` | `medium` | `high`
- Auto overdue detection

---

## 🛠 Tech Stack

| Layer      | Technology              |
|------------|-------------------------|
| Frontend   | React 18 + Vite         |
| Styling    | Tailwind CSS v3         |
| Backend    | Node.js + Express       |
| Database   | MongoDB Atlas           |
| Auth       | JWT (jsonwebtoken)      |
| Deploy     | Railway                 |

---

## 📁 Project Structure

```
taskflow/
├── backend/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── projectController.js
│   │   ├── taskController.js
│   │   └── userController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Project.js
│   │   └── Task.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── projects.js
│   │   ├── tasks.js
│   │   └── users.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
└── frontend/
    ├── src/
    │   ├── components/common/Layout.jsx
    │   ├── context/AuthContext.jsx
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Signup.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── Projects.jsx
    │   │   ├── ProjectDetail.jsx
    │   │   └── Tasks.jsx
    │   ├── utils/api.js
    │   ├── App.jsx
    │   └── main.jsx
    ├── .env.example
    └── package.json
```

---

## ⚙️ Local Setup

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (free tier works)

### 1. Clone the repo
```bash
git clone https://github.com/JyotiRaghuvanshi/taskflow.git
cd taskflow
```

### 2. Backend Setup
```bash
cd backend
cp .env.example .env
# Fill in MONGO_URI and JWT_SECRET in .env
npm install
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
cp .env.example .env
# Set VITE_API_URL=http://localhost:5000/api
npm install
npm run dev
```

App runs at: `http://localhost:5173`

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint           | Access  | Description     |
|--------|--------------------|---------|-----------------|
| POST   | /api/auth/signup   | Public  | Register user   |
| POST   | /api/auth/login    | Public  | Login user      |
| GET    | /api/auth/me       | Private | Get current user|

### Projects
| Method | Endpoint                        | Access       | Description         |
|--------|---------------------------------|--------------|---------------------|
| GET    | /api/projects                   | Private      | Get all projects    |
| POST   | /api/projects                   | Admin only   | Create project      |
| GET    | /api/projects/:id               | Private      | Get project by ID   |
| PUT    | /api/projects/:id               | Admin only   | Update project      |
| DELETE | /api/projects/:id               | Admin only   | Delete project      |
| POST   | /api/projects/:id/members       | Admin only   | Add member          |
| DELETE | /api/projects/:id/members/:uid  | Admin only   | Remove member       |

### Tasks
| Method | Endpoint                    | Access     | Description           |
|--------|-----------------------------|------------|-----------------------|
| GET    | /api/tasks                  | Private    | Get tasks             |
| GET    | /api/tasks/dashboard        | Private    | Get dashboard stats   |
| GET    | /api/tasks/project/:id      | Private    | Get tasks by project  |
| POST   | /api/tasks                  | Admin only | Create task           |
| PUT    | /api/tasks/:id              | Private    | Update task/status    |
| DELETE | /api/tasks/:id              | Admin only | Delete task           |

### Users
| Method | Endpoint          | Access     | Description      |
|--------|-------------------|------------|------------------|
| GET    | /api/users        | Admin only | Get all users    |
| GET    | /api/users/members| Admin only | Get all members  |

---

## 🚂 Railway Deployment

### Backend
1. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
2. Select your repo → choose `backend` as root directory
3. Add environment variables:
   ```
   MONGO_URI=your_mongodb_atlas_uri
   JWT_SECRET=your_secret_key
   FRONTEND_URL=https://your-frontend.up.railway.app
   ```
4. Railway auto-detects Node.js and deploys

### Frontend
1. New Service → Deploy from same GitHub repo
2. Set root directory to `frontend`
3. Add environment variable:
   ```
   VITE_API_URL=https://your-backend.up.railway.app/api
   ```
4. Build command: `npm run build`
5. Start command: `npx serve dist -p $PORT`

---

## 👤 Author

**Jyoti Raghuvanshi**  
GitHub: [@JyotiRaghuvanshi](https://github.com/JyotiRaghuvanshi)
