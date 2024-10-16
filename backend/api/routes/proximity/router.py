from fastapi import APIRouter

from backend.api.routes.proximity.proximities import router as proximity_router

router = APIRouter(
    tags=["proximity"]
)

router.include_router(proximity_router, prefix="/proximity")
