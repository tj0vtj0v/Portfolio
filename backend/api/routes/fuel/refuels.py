from datetime import date
from typing import List
from http import HTTPStatus

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError

from backend.api.schemas.authentication.role_schema import RoleEnum
from backend.core.database.dao.fuel.refuel_dao import RefuelDao
from backend.core.database.transaction import DBTransaction
from backend.core.auth.authorisation import get_and_validate_user
from backend.api.schemas.fuel.refuel_schema import RefuelSchema, RefuelModifySchema

router = APIRouter()


@router.post("", status_code=HTTPStatus.CREATED, dependencies=[Depends(get_and_validate_user(RoleEnum.Editor))])
async def create_refuel(
        refuel: RefuelModifySchema,
        transaction: DBTransaction,
        refuel_dao: RefuelDao = Depends()
) -> RefuelSchema:
    """
    Authorisation: at least 'Editor' is required
    """

    with transaction.start():
        created = refuel_dao.create(refuel)

    return RefuelSchema.from_model(created)


@router.get("", dependencies=[Depends(get_and_validate_user(RoleEnum.Viewer))])
async def get_refuels(
        entry_date: date = None,
        distance: float = None,
        consumption: float = None,
        cost: float = None,
        fuel_type_name: str = None,
        refuel_dao: RefuelDao = Depends()
) -> List[RefuelSchema]:
    """
    Authorisation: at least 'Viewer' is required
    """

    raw_data = refuel_dao.get_all_with(entry_date, distance, consumption, cost, fuel_type_name)

    refuels = [RefuelSchema.from_model(refuel) for refuel in raw_data]

    return sorted(refuels, key=lambda refuel: refuel.entry_date)


@router.patch("/{id}", dependencies=[Depends(get_and_validate_user(RoleEnum.Editor))])
async def update_refuel(
        id: int,
        refuel: RefuelModifySchema,
        transaction: DBTransaction,
        refuel_dao: RefuelDao = Depends()
) -> RefuelSchema:
    """
    Authorisation: at least 'Editor' is required
    """

    try:
        with transaction.start():
            updated = refuel_dao.update(id, refuel)
    except RefuelDao.NotFoundException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)
    except IntegrityError as e:
        raise HTTPException(status_code=HTTPStatus.CONFLICT, detail=e.detail)

    return RefuelSchema.from_model(updated)


@router.delete("/{id}", status_code=HTTPStatus.NO_CONTENT,
               dependencies=[Depends(get_and_validate_user(RoleEnum.Editor))])
async def delete_refuel(
        id: int,
        transaction: DBTransaction,
        refuel_dao: RefuelDao = Depends()
) -> None:
    """
    Authorisation: at least 'Editor' is required
    """

    try:
        with transaction.start():
            refuel_dao.delete(id)
    except RefuelDao.NotFoundException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)
