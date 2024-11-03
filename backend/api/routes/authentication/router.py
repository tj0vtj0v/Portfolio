from fastapi import APIRouter

from backend.api.routes.authentication.login import router as login_router
from backend.api.routes.authentication.users import router as users_router
from backend.api.routes.authentication.roles import router as roles_router

router = APIRouter(
    tags=["authentication"]
)

router.include_router(login_router, prefix="/login")
router.include_router(roles_router, prefix="/roles")
router.include_router(users_router, prefix="/users")
