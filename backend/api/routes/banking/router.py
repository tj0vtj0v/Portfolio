from fastapi import APIRouter

from backend.api.routes.banking.histories import router as histories_router

router = APIRouter(
    tags=["banking"]
)

router.include_router(histories_router, prefix="/history")
