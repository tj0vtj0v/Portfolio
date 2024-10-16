from fastapi import APIRouter

from backend.api.routes.banking.histories import router as histories_router
from backend.api.routes.banking.transactions import router as transactions_router

router = APIRouter(
    tags=["banking"]
)

router.include_router(histories_router, prefix="/history")
router.include_router(transactions_router, prefix="/transactions")
