from fastapi import APIRouter

from backend.api.routes.accounting.accounts import router as accounts_router
from backend.api.routes.accounting.categories import router as categories_router
from backend.api.routes.accounting.expenses import router as expenses_router
from backend.api.routes.accounting.transfers import router as transfers_router
from backend.api.routes.accounting.monthly_costs import router as monthly_costs_router
from backend.api.routes.accounting.yearly_costs import router as yearly_costs_router
from backend.api.routes.accounting.monthly_closings import router as monthly_closings_router

router = APIRouter(
    tags=["accounting"]
)

router.include_router(accounts_router, prefix="/accounts")
router.include_router(categories_router, prefix="/categories")
router.include_router(expenses_router, prefix="/expenses")
router.include_router(transfers_router, prefix="/transfers")
router.include_router(monthly_costs_router, prefix="/monthly_costs")
router.include_router(yearly_costs_router, prefix="/yearly_costs")
router.include_router(monthly_closings_router, prefix="/monthly_closings")
