from fastapi import APIRouter

from .routes.users import router as users_router
from .routes.login import router as login_router

router = APIRouter()

router.include_router(login_router, prefix="/login")
router.include_router(users_router, prefix="/users")
