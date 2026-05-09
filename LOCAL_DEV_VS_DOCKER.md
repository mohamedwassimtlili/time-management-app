# Local Development vs Docker Testing Guide

Since this application will be deployed as **two separate Docker containers on Render** (one Web Service for Express, one for FastAPI), it is important to understand the two different ways you can run and test this application locally.

---

## 1. Native Local Development (Hot Reloading/Fast Feedback)

Use this method when you are actively writing code. It uses native tools (`nodemon`, `uvicorn`, `vite`) to automatically restart your servers whenever you save a file.

### **Pros:**
- Instant feedback loop (hot reloading).
- Easy to attach debuggers.
- No need to wait for Docker images to build after every code change.

### **Cons:**
- Doesn't perfectly match the production (Render) environment.
- Requires Node.js and Python installed locally on your machine.

### **How to Run:**
You need to open three separate terminal windows:

**Terminal 1: FastAPI (Python)**
```bash
cd api
# Activate your virtual environment if you use one: source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
*Locally, this runs at `http://127.0.0.1:8000`*

**Terminal 2: Express (Node.js)**
```bash
cd backend
npm install
# Ensure .env has FASTAPI_URL=http://127.0.0.1:8000
npm run dev
```
*Locally, this runs at `http://localhost:5000`*

**Terminal 3: Frontend (React/Vite)**
```bash
cd frontend
npm install
npm run dev
```

---

## 2. Docker Local Testing (Production Parity)

Use this method when you want to verify that your Dockerfiles work correctly and that the containers will run properly before deploying them to Render.

### **Pros:**
- Matches the Render production environment perfectly.
- Validates that `Dockerfile` for both Express and FastAPI are correctly configured.
- Tests inter-container communication.

### **Cons:**
- Slower to start (requires building images).
- By default, changes to the code require a rebuild (unless volumes are mapped).

### **How to Run:**
Make sure Docker Desktop (or the Docker daemon) is running.

```bash
# Build and start the containers using the local code
docker-compose -f docker-compose-local.yml up --build
```

### **The Key Difference in Networking (Crucial for Render)**

When running native local development, Express talks to FastAPI via `localhost` (e.g., `http://127.0.0.1:8000`), because they share the same host machine network.

When running in **Docker Compose**, Express talks to FastAPI using Docker's internal DNS: `http://fastapi:8000`.

**When Deploying to Render:**
Because you are deploying them as *two separate* Render Web Services, they will not share a standard `docker-compose` network.
1. You will deploy the FastAPI service first and get its Render URL (e.g., `https://time-management-fastapi.onrender.com`).
2. You will then deploy the Express service and set its **Environment Variable** `FASTAPI_URL` to point to that public Render URL, *not* `fastapi:8000` or `localhost`.
*(Note: If you use Render's Private Services feature, you can use the private network URL provided by Render).*