# Free Time Slot Finder API - Setup Guide

## ✅ Setup Complete!

Your FastAPI application is now running with a Python virtual environment.

---

## 📁 Project Structure

```
api/
├── venv/                    # Virtual environment (do not commit)
├── main.py                  # FastAPI application
├── free_slots_finder.py     # Core logic for finding free slots
├── requirements.txt         # Python dependencies
└── ...
```

---

## 🚀 Quick Start

### 1. Activate Virtual Environment

```bash
cd /home/mohamedwassim/dev/time-management-app/api
source venv/bin/activate
```

### 2. Install Dependencies (if needed)

```bash
pip install -r requirements.txt
```

### 3. Run the Server

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Or run in background:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000 &
```

---

## 🌐 API Endpoints

### **Base URL**: `http://localhost:8000`

### **1. Root Endpoint**
```
GET /
```

**Response:**
```json
{
  "message": "Free Time Slot Finder API",
  "version": "1.0.0",
  "endpoints": {
    "POST /free-slots": "Get free time slots from a list of tasks"
  }
}
```

### **2. Get Free Slots**
```
POST /free-slots
```

**Request Body:**
```json
[
  {
    "title": "Setup project environment",
    "description": "Configure development environment",
    "priority": 0,
    "start": "2026-02-02T09:00:00Z",
    "end": "2026-02-02T10:30:00Z",
    "deadline": "2026-02-02T09:00:00Z",
    "status": "done"
  },
  {
    "title": "Review project requirements",
    "start": "2026-02-02T14:00:00Z",
    "end": "2026-02-02T15:00:00Z"
  }
]
```

**Response:**
```json
{
  "free_slots": [
    [
      "2026-02-02",
      [
        {"start": "06:00", "end": "09:00"},
        {"start": "10:30", "end": "14:00"},
        {"start": "15:00", "end": "18:00"}
      ]
    ]
  ]
}
```

---

## 📝 Task Model

Required fields:
- `title` (string)
- `start` (ISO 8601 datetime string)
- `end` (ISO 8601 datetime string)

Optional fields:
- `description` (string, default: "")
- `priority` (int, default: 0)
- `deadline` (ISO 8601 datetime string, default: "")
- `status` (string, default: "pending")

---

## 🧪 Testing Examples

### Using cURL:

```bash
# Simple test
curl -X POST http://localhost:8000/free-slots \
  -H "Content-Type: application/json" \
  -d '[
    {
      "title": "Morning Meeting",
      "start": "2026-02-20T09:00:00Z",
      "end": "2026-02-20T10:00:00Z"
    },
    {
      "title": "Afternoon Task",
      "start": "2026-02-20T14:00:00Z",
      "end": "2026-02-20T15:30:00Z"
    }
  ]'
```

### Using Python:

```python
import requests

tasks = [
    {
        "title": "Morning Meeting",
        "start": "2026-02-20T09:00:00Z",
        "end": "2026-02-20T10:00:00Z"
    }
]

response = requests.post(
    "http://localhost:8000/free-slots",
    json=tasks
)

print(response.json())
```

### Using Postman:

1. **Method**: POST
2. **URL**: `http://localhost:8000/free-slots`
3. **Headers**: `Content-Type: application/json`
4. **Body** (raw JSON):
```json
[
  {
    "title": "Task 1",
    "start": "2026-02-20T09:00:00Z",
    "end": "2026-02-20T10:00:00Z"
  }
]
```

---

## ⚙️ Configuration

### Working Hours

Default: 6:00 AM - 6:00 PM (06:00 - 18:00)

To change, edit `free_slots_finder.py`:
```python
WORK_START_HOUR = 8  # 8 AM
WORK_END_HOUR = 18   # 6 PM
```

---

## 📦 Dependencies

- **fastapi**: Web framework
- **uvicorn**: ASGI server
- **pydantic**: Data validation

Install with:
```bash
pip install -r requirements.txt
```

---

## 🔍 Interactive API Documentation

FastAPI provides automatic interactive docs:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

---

## 🛑 Stop the Server

```bash
# If running in foreground, press Ctrl+C

# If running in background, find and kill the process:
ps aux | grep uvicorn
kill <PID>

# Or:
pkill -f "uvicorn main:app"
```

---

## 📌 Notes

- The virtual environment (`venv/`) should NOT be committed to git
- Add `venv/` to your `.gitignore` file
- Working hours are from 6:00 AM to 6:00 PM by default
- All times should be in ISO 8601 format (e.g., "2026-02-20T09:00:00Z")
- Free slots are calculated as gaps between scheduled tasks

---

## 🎯 Current Status

✅ Virtual environment created
✅ Dependencies installed
✅ FastAPI server running on port 8000
✅ API tested and working

**Server URL**: http://localhost:8000
**API Documentation**: http://localhost:8000/docs
