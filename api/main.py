from fastapi import FastAPI
from routes.plan_routes import router as plan_router

app = FastAPI(title="AI Planner API")

app.include_router(plan_router)