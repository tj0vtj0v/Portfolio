from fastapi import APIRouter

from backend.api.routes.hayday.items import router as items_router
from backend.api.routes.hayday.ingredients import router as ingredients_router
from backend.api.routes.hayday.sources import router as sources_router
from backend.api.routes.hayday.evaluations import router as evaluations_router
from backend.api.routes.hayday.magic_numbers import router as magic_numbers_router
from backend.api.routes.hayday.animal_steps import router as animal_steps_router
from backend.api.routes.hayday.ore_occurrences import router as ore_occurrence_router

router = APIRouter(
    tags=["hayday"]
)

router.include_router(items_router, prefix="/items")
router.include_router(ingredients_router, prefix="/ingredients")
router.include_router(sources_router, prefix="/sources")
router.include_router(evaluations_router, prefix="/evaluations")
router.include_router(magic_numbers_router, prefix="/magic_numbers")
router.include_router(animal_steps_router, prefix="/animal_steps")
router.include_router(ore_occurrence_router, prefix="/ore_occurrences")
