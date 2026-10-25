from fastapi import APIRouter

from app.api.v1.endpoints import auth, documents, health
from app.api.routes import questions
from app.api.v1.endpoints.conversations import router as conversations_router
from app.api.v1.endpoints.activity import router as activity_router
from app.api.v1.endpoints.comparison import router as comparison_router


api_router = APIRouter(prefix="/api/v1")

api_router.include_router(auth.router)
api_router.include_router(health.router)
api_router.include_router(documents.router)
api_router.include_router(questions.router)
api_router.include_router(conversations_router)
api_router.include_router(activity_router)
api_router.include_router(comparison_router)