"""
coach-tools API
FastAPI server that exposes the Python tools over HTTP.
Runs on port 3011 in development and production.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import practice_plan, lineup

app = FastAPI(
    title="Coach Tools API",
    description="LGLL coaching tools — practice plan generator, lineup generator",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3010",
        "https://coach.chrislanus.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(practice_plan.router, prefix="/practice-plan", tags=["Practice Plan"])
app.include_router(lineup.router,        prefix="/lineup",         tags=["Lineup"])


@app.get("/health")
def health():
    return {"status": "ok"}
