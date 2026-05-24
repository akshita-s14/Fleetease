# 🚛 FleetEase — Fleet Management System

A full-stack fleet management system built with React and Node.js, containerized with Docker, and deployed via an automated CI/CD pipeline using GitHub Actions.

---

## 🚀 Live Demo
**[Click here to view the live deployed application!](https://fleetease-tau.vercel.app/)**
*(Frontend deployed on Vercel, Backend hosted on Render, Database securely managed via Neon.tech Serverless Postgres).*

---

## 📁 Project Structure
```
Fleetease/
├── fleetease-backend/        # Node.js REST API
│   ├── .env.example          # Environment variable template
│   └── Dockerfile            # Backend container config
├── fleetease-frontend/
│   └── web/                  # React application
│       ├── src/
│       │   ├── components/
│       │   ├── pages/
│       │   └── utils/
│       └── Dockerfile        # Multi-stage build (nginx)
├── docker-compose.yml        # Orchestrates all services
└── .github/
    └── workflows/
        └── deploy.yml        # CI/CD pipeline
```

---

## 🏗️ DevOps Infrastructure

### 🐳 Containerization
- **Backend** — Node.js app containerized with Docker
- **Frontend** — Multi-stage Docker build: React app compiled in Node, served via lightweight **nginx**
- **Health Checks** — Docker health checks configured on both services to ensure containers are running correctly before traffic is served
- **Orchestration** — `docker-compose.yml` spins up the full stack with a single command

### ⚙️ CI/CD Pipeline (GitHub Actions)
Automated pipeline triggers on every push to `main`:

```
Push to main
     │
     ▼
┌─────────────────────┐
│   Checkout Code     │  ✅
└─────────────────────┘
     │
     ▼
┌─────────────────────┐
│   Setup Node.js 18  │  ✅
└─────────────────────┘
     │
     ▼
┌─────────────────────┐
│ Install Backend Deps│  ✅
└─────────────────────┘
     │
     ▼
┌─────────────────────┐
│Install Frontend Deps│  ✅
└─────────────────────┘
     │
     ▼
┌─────────────────────┐
│   Build Frontend    │  ✅
└─────────────────────┘
```

### 🔐 Secrets Management
Sensitive credentials are **never committed** to the repository.
Copy `.env.example` to `.env` and fill in your values:

```bash
cp fleetease-backend/.env.example fleetease-backend/.env
```

---

## 🚀 Run Locally with Docker

**Prerequisites:** [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.

```bash
# 1. Clone the repository
git clone https://github.com/akshita-s14/Fleetease.git
cd Fleetease

# 2. Set up environment variables
cp fleetease-backend/.env.example fleetease-backend/.env

# 3. Build and start all services
docker-compose up --build

# 4. Open in browser
# Frontend → http://localhost:3000
# Backend  → http://localhost:5000
```

To stop:
```bash
docker-compose down
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js |
| Backend | Node.js + Express |
| Database | PostgreSQL |
| Containerization | Docker + Docker Compose |
| Web Server | nginx (production frontend) |
| CI/CD | GitHub Actions |
| Version Control | Git + GitHub |

---

## ✨ Features

- 🚗 **Vehicle Management** — Add, update, and track fleet vehicles
- 👨‍✈️ **Driver Management** — Manage driver profiles and assignments
- 📊 **Dashboard** — Real-time fleet overview and analytics
- 🔐 **Authentication** — Secure login with JWT
- 📱 **Responsive UI** — Works across desktop and mobile

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m "Add your feature"`
4. Push to branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 👩‍💻 Author

**Akshita** — [GitHub](https://github.com/akshita-s14)
