"""SehatYar API — FastAPI entrypoint with MongoDB health check."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import get_settings
from db import close_db, get_db, ping_db


@asynccontextmanager
async def lifespan(_app: FastAPI):
    # Warm the Mongo client on startup
    await ping_db()
    yield
    await close_db()


settings = get_settings()

app = FastAPI(
    title="SehatYar API",
    description="Pashto health literacy assistant — informational only, not medical advice.",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    """Liveness + MongoDB connectivity."""
    mongo_ok = False
    error = None
    try:
        await ping_db()
        mongo_ok = True
    except Exception as exc:  # noqa: BLE001 — surface connection errors in health
        error = str(exc)

    db = get_db()
    return {
        "status": "ok" if mongo_ok else "degraded",
        "service": "sehatyar-api",
        "mongo": {
            "connected": mongo_ok,
            "database": db.name,
            "error": error,
        },
        "disclaimer": "Informational only. Not a diagnosis or prescription.",
    }


@app.get("/")
async def root():
    return {
        "name": "SehatYar API",
        "docs": "/docs",
        "health": "/health",
    }
