from datetime import datetime
from typing import List
from http import HTTPStatus

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError

from backend.core.database.dao import NotFoundException
from backend.core.database.dao.proximity.proximity_dao import ProximityDao
from backend.core.database.transaction import DBTransaction
from backend.core.auth.authorisation import get_and_validate_user
from backend.api.schemas.authentication.role_schema import RoleEnum
from backend.api.schemas.proximity.proximity_schema import ProximitySchema, ProximityModifySchema

router = APIRouter()


@router.post("", status_code=HTTPStatus.CREATED, dependencies=[Depends(get_and_validate_user(RoleEnum.Editor))])
async def create_proximity(
        proximity: ProximityModifySchema,
        transaction: DBTransaction,
        proximity_dao: ProximityDao = Depends()
) -> ProximitySchema:
    """
    Authorisation: at least 'Editor' is required
    """

    try:
        with transaction.start():
            created = proximity_dao.create(proximity)
    except IntegrityError as e:
        raise HTTPException(status_code=HTTPStatus.CONFLICT, detail=e.detail)

    return ProximitySchema.from_model(created)


@router.get("", dependencies=[Depends(get_and_validate_user(RoleEnum.Viewer))])
async def get_proximities(
        device: str = None,
        timestamp: datetime = None,
        responsetime: float = None,
        proximity_dao: ProximityDao = Depends()

) -> List[ProximitySchema]:
    """
    Authorisation: at least 'Viewer' is required
    """

    raw_data = proximity_dao.get_all_with(device, timestamp, responsetime)

    proximities = [ProximitySchema.from_model(entry) for entry in raw_data]

    return sorted(proximities, key=lambda entry: (entry.timestamp, entry.device))


@router.patch("", dependencies=[Depends(get_and_validate_user(RoleEnum.Editor))])
async def update_proximity(
        device_id: int,
        timestamp: datetime,
        proximity: ProximityModifySchema,
        transaction: DBTransaction,
        proximity_dao: ProximityDao = Depends()
) -> ProximitySchema:
    """
    Authorisation: at least 'Editor' is required
    """

    try:
        with transaction.start():
            updated = proximity_dao.update(device_id, timestamp, proximity)
    except NotFoundException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)
    except IntegrityError as e:
        raise HTTPException(status_code=HTTPStatus.CONFLICT, detail=e.detail)

    return ProximitySchema.from_model(updated)


@router.delete("", status_code=HTTPStatus.NO_CONTENT,
               dependencies=[Depends(get_and_validate_user(RoleEnum.Editor))])
async def delete_proximity(
        device_id: int,
        timestamp: datetime,
        transaction: DBTransaction,
        proximity_dao: ProximityDao = Depends()
) -> None:
    """
    Authorisation: at least 'Editor' is required
    """

    try:
        with transaction.start():
            proximity_dao.delete(device_id, timestamp)
    except NotFoundException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)
