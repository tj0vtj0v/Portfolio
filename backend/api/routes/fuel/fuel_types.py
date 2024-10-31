from typing import List
from http import HTTPStatus

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError

from backend.api.schemas.authentication.role_schema import RoleEnum
from backend.core.database.dao.fuel.fuel_type_dao import FuelTypeDao
from backend.core.database.transaction import DBTransaction
from backend.core.auth.authorisation import get_and_validate_user
from backend.api.schemas.fuel.fuel_type_schema import FuelTypeSchema

router = APIRouter()


@router.post("", status_code=HTTPStatus.CREATED, dependencies=[Depends(get_and_validate_user(RoleEnum.Editor))])
async def create_fuel_type(
        fuel_type: FuelTypeSchema,
        transaction: DBTransaction,
        fuel_type_dao: FuelTypeDao = Depends()
) -> FuelTypeSchema:
    """
    Authorisation: at least 'Editor' is required
    """

    with transaction.start():
        created = fuel_type_dao.create(fuel_type)

    return FuelTypeSchema.from_model(created)


@router.get("", dependencies=[Depends(get_and_validate_user(RoleEnum.Viewer))])
async def get_fuel_types(
        fuel_type_dao: FuelTypeDao = Depends()
) -> List[FuelTypeSchema]:
    """
    Authorisation: at least 'Viewer' is required
    """

    fuel_types = [FuelTypeSchema.from_model(fuel_type) for fuel_type in fuel_type_dao.get_all()]

    return sorted(fuel_types, key=lambda fuel_type: fuel_type.name)


@router.get("/{name}", dependencies=[Depends(get_and_validate_user(RoleEnum.Viewer))])
async def get_fuel_type_by_name(
        name: str,
        fuel_type_dao: FuelTypeDao = Depends()
) -> FuelTypeSchema:
    """
    Authorisation: at least 'Viewer' is required
    """

    try:
        fuel_type = fuel_type_dao.get_by_name(name)
    except FuelTypeDao.NotFoundException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)

    return FuelTypeSchema.from_model(fuel_type)


@router.patch("/{name}", dependencies=[Depends(get_and_validate_user(RoleEnum.Editor))])
async def update_fuel_type(
        name: str,
        fuel_type: FuelTypeSchema,
        transaction: DBTransaction,
        fuel_type_dao: FuelTypeDao = Depends()
) -> FuelTypeSchema:
    """
    Authorisation: at least 'Editor' is required
    """

    try:
        with transaction.start():
            updated = fuel_type_dao.update(name, fuel_type)
    except FuelTypeDao.NotFoundException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)
    except IntegrityError as e:
        raise HTTPException(status_code=HTTPStatus.CONFLICT, detail=e.detail)

    return FuelTypeSchema.from_model(updated)


@router.delete("/{name}", dependencies=[Depends(get_and_validate_user(RoleEnum.Editor))])
async def delete_fuel_type(
        name: str,
        transaction: DBTransaction,
        fuel_type_dao: FuelTypeDao = Depends()
) -> None:
    """
    Authorisation: at least 'Editor' is required
    """

    try:
        with transaction.start():
            fuel_type_dao.delete(name)
    except FuelTypeDao.NotFoundException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)
