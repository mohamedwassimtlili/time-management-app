# Standalone Docker & Render Deployment Guide

This document explains the steps taken to build and connect the Express and FastAPI services as standalone containers, and how to replicate this architecture on Render.

## 1. Local Standalone Connection (Without Docker Compose)

To simulate Render's environment locally, we ran the containers independently. Since they are not on a shared Docker network by default, we used the Host Bridge IP to allow them to communicate.

### **Step 1: Build the Images**
First, we created local Docker images for both services:
```bash
docker build -t my-fatapi-app ./api
docker build -t my-express-app ./backend
```

### **Step 2: Run FastAPI Standalone**
We started the FastAPI container first on port `8000`:
```bash
docker run -d --name fastapi-standalone -p 8000:8000 my-fatapi-app
```

### **Step 3: Run Express & Connect via Bridge IP**
To connect Express to FastAPI, we used the environment variable `FASTAPI_URL`. Locally, Docker's default bridge IP for the host is typically `172.17.0.1`:
```bash
docker run -d --name express-standalone \
  -p 5000:5000 \
  -e FASTAPI_URL=http://172.17.0.1:8000 \
  my-express-app
```

---

## 2. Deploying to Render

When deploying to Render, you will create two separate **Web Services**.

### **Service A: FastAPI (The Engine)**
1. **New > Web Service**: Point it to your GitHub repository and set the Root Directory to `api/`.
2. **Runtime**: Select `Docker`.
3. **Instance Type**: Select your preferred tier (Starter or higher is recommended for AI workloads).
4. **Deploy**: Once finished, Render will provide a URL like `https://fastapi-service.onrender.com`.

### **Service B: Express (The Backend)**
1. **New > Web Service**: Point it to your GitHub repository and set the Root Directory to `backend/`.
2. **Runtime**: Select `Docker`.
3. **Environment Variables**: This is the critical step for connectivity. Add the following:
   - `FASTAPI_URL`: `https://fastapi-service.onrender.com` (Use the actual URL from Service A).
   - `MONGO_URI`: Your MongoDB connection string.
   - `JWT_SECRET`: Your secret key.
   - `PORT`: `5000` (Render will automatically detect this, but it's good practice).
4. **Deploy**: Render will expose this service on port 443 (HTTPS) at a URL like `https://express-backend.onrender.com`.

### **Summary of Connectivity**
| Environment | Express Config (`FASTAPI_URL`) | Communication Method |
| :--- | :--- | :--- |
| **Local Dev** | `http://localhost:8000` | Machine Hostname |
| **Docker Compose** | `http://fastapi:8000` | Internal DNS |
| **Standalone Docker**| `http://172.17.0.1:8000` | Docker Bridge IP |
| **Render** | `https://your-api.onrender.com` | Public/Private Web URL |

---

## 3. Post-Deployment Verification
Once deployed, you can verify the connection by checking the logs of the **Express** service. If it successfully forwards a request to the FastAPI URL and receives a response (even an error from the LLM), the pipe is correctly connected.
