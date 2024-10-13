from fastapi import APIRouter

from backend.api.routes.authentication.users import router as users_router
from backend.api.routes.authentication.login import router as login_router

router = APIRouter()

router.include_router(login_router, prefix="")
router.include_router(users_router, prefix="/users")
