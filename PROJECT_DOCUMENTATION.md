# Time Management App - Documentation

This project is an AI-powered productivity application designed to help users manage tasks, schedule time blocks, and optimize their daily routines through natural language interaction.

## 🚀 Architecture

The application is built using a microservices-inspired architecture:

1.  **React Frontend**: A modern UI for task management and chat.
2.  **Express Orchestrator**: Manages authentication, database operations, and coordinates AI requests.
3.  **FastAPI AI Service**: Handles complex NLP tasks, intent classification, and schedule generation using Groq LLMs.

---

## 🛠 Tech Stack

- **Frontend**: React, Vite, Material UI (MUI), Framer Motion.
- **Backend Orchestrator**: Node.js, Express, MongoDB, Mongoose.
- **AI Backend**: Python, FastAPI, Groq (Llama 3.1 70B/8B).
- **Communication**: REST API, Axios.
- **Infrastructure**: Docker & Docker Compose.

---

## ✨ Key Features

### 1. Intelligent AI Assistant
The assistant goes beyond simple chat. It can:
- **Understand Intent**: Distinguishes between planning a new project, asking about existing tasks, or general conversation.
- **Direct Action**: Extract structured data from messages (e.g., "Remind me to call Mom at 5pm") to automatically create database records.
- **Smart Planning**: Calculates free slots in your schedule to suggest optimal times for tasks.

### 2. Task & Session Management
- **Collections**: Group tasks by project or category.
- **Time Blocks**: View and manage scheduled sessions.
- **AI Planner**: Generate a full day or week schedule from a simple prompt.

### 3. Voice Interaction
- **Speech-to-Text (STT)**: Dictate prompts directly to the AI.
- **Text-to-Speech (TTS)**: The AI can read its plans and responses back to you.

### 4. Enterprise Security
- **JWT Authentication**: Secure login and session management.

---

## 🏗 Project Structure

```text
├── api/                # Python AI Service
│   ├── main.py         # FastAPI Entry Point
│   ├── services/       # Extraction & Planning Logic
│   └── utils/          # Prompt Engineering & LLM Callers
├── backend/            # Express Orchestrator
│   ├── controllers/    # Route Logic (Users, Tasks, AI)
│   ├── models/         # Mongoose Schemas (User, Task, Session)
│   └── routes/         # Express Router Definitions
└── frontend/           # React Frontend
    ├── src/components/ # Dashboard, Chat, Auth Components
    ├── src/context/    # State Management (AuthContext)
    └── src/services/   # API Clients (Axios)
```

---

## ⚙️ Setup & Configuration

### Prerequisites
- Docker & Docker Compose
- Groq API Key


### Fast Start (Docker)
1. Clone the repository.
2. Create a `.env` file in `backend/`, `api/`, and `frontend/` using the provided templates.
3. Run `docker-compose up --build`.

### Environment Variables

| Variable | Description |
| :--- | :--- |
| `MONGO_URI` | MongoDB Connection String |
| `JWT_SECRET` | Secret key for JWT signing |
| `GROQ_API_KEY` | API Key for LLM access |

---

## 🧠 Smart Memory Management
To optimize performance and cost:
- **Conversation Slicing**: The system only preserves the last 3-5 message turns to maintain context without exceeding token limits or causing OOM.
- **In-Memory Caching**: Frequently accessed session data is cached with a FIFO eviction policy.

---

## 📝 API Endpoints

- `POST /api/ai/agent`: Primary entry for AI interactions.
- `GET /api/tasks`: Retrieve user task list.
- `POST /plan/start`: (FastAPI) Generate initial project timeline.

---
© 2026 Time Management AI App
