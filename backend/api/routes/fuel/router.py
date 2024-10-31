from fastapi import APIRouter

from backend.api.routes.fuel.fuel_types import router as fuel_types_router
from backend.api.routes.fuel.refuels import router as refuel_router

router = APIRouter(
    tags=["fuel"]
)

router.include_router(fuel_types_router, prefix="/fuel_types")
router.include_router(refuel_router, prefix="/refuels")
