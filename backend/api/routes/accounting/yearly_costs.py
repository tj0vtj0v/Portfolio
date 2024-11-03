from typing import List
from http import HTTPStatus

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError

from backend.api.schemas.authentication.role_schema import RoleEnum
from backend.core.database.dao.accounting.yearly_cost_dao import YearlyCostDao
from backend.core.database.transaction import DBTransaction
from backend.core.auth.authorisation import get_and_validate_user
from backend.api.schemas.accounting.yearly_cost_schema import YearlyCostSchema

router = APIRouter()


@router.post("", status_code=HTTPStatus.CREATED, dependencies=[Depends(get_and_validate_user(RoleEnum.Editor))])
async def create_monthly_cost(
        monthly_cost: YearlyCostSchema,
        transaction: DBTransaction,
        monthly_cost_dao: YearlyCostDao = Depends()
) -> YearlyCostSchema:
    """
    Authorisation: at least 'Editor' is required
    """

    try:
        with transaction.start():
            created = monthly_cost_dao.create(monthly_cost)
    except IntegrityError as e:
        raise HTTPException(status_code=HTTPStatus.CONFLICT, detail=e.detail)

    return YearlyCostSchema.from_model(created)


@router.get("", dependencies=[Depends(get_and_validate_user(RoleEnum.Viewer))])
async def get_monthly_costs(
        amount: float = None,
        monthly_cost_dao: YearlyCostDao = Depends()
) -> List[YearlyCostSchema]:
    """
    Authorisation: at least 'Viewer' is required
    """

    raw_data = monthly_cost_dao.get_all_with(amount)

    monthly_costs = [YearlyCostSchema.from_model(monthly_cost) for monthly_cost in raw_data]

    return sorted(monthly_costs, key=lambda monthly_cost: monthly_cost.name)


@router.patch("/{id}", dependencies=[Depends(get_and_validate_user(RoleEnum.Editor))])
async def update_monthly_cost(
        id: int,
        monthly_cost: YearlyCostSchema,
        transaction: DBTransaction,
        monthly_cost_dao: YearlyCostDao = Depends()
) -> YearlyCostSchema:
    """
    Authorisation: at least 'Editor' is required
    """

    try:
        with transaction.start():
            updated = monthly_cost_dao.update(id, monthly_cost)
    except YearlyCostDao.NotFoundException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)
    except IntegrityError as e:
        raise HTTPException(status_code=HTTPStatus.CONFLICT, detail=e.detail)

    return YearlyCostSchema.from_model(updated)


@router.delete("/{id}", status_code=HTTPStatus.NO_CONTENT,
               dependencies=[Depends(get_and_validate_user(RoleEnum.Editor))])
async def delete_monthly_cost(
        id: int,
        transaction: DBTransaction,
        monthly_cost_dao: YearlyCostDao = Depends()
) -> None:
    """
    Authorisation: at least 'Editor' is required
    """

    try:
        with transaction.start():
            monthly_cost_dao.delete(id)
    except YearlyCostDao.NotFoundException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)
