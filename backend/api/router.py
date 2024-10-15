from fastapi import APIRouter

from backend.api.routes.authentication.router import router as auth_router
from backend.api.routes.banking.router import router as banking_router

router = APIRouter()

router.include_router(auth_router, prefix="")
router.include_router(banking_router, prefix="/banking")
