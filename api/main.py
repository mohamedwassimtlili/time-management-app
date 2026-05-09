from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.plan_routes import router as plan_router

app = FastAPI(title="AI Planner API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://time-management-app-c1x1.onrender.com",
        "http://localhost:5000",
        "https://time-management-88h6ijue5-mohamed-wassim-tlilis-projects.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(plan_router)