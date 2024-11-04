from typing import List
from http import HTTPStatus

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError

from backend.core.database.dao import NotFoundException
from backend.core.database.dao.proximity.device_dao import DeviceDao
from backend.core.database.transaction import DBTransaction
from backend.core.auth.authorisation import get_and_validate_user
from backend.api.schemas.authentication.role_schema import RoleEnum
from backend.api.schemas.proximity.device_schema import DeviceSchema

router = APIRouter()


@router.post("", status_code=HTTPStatus.CREATED, dependencies=[Depends(get_and_validate_user(RoleEnum.Editor))])
async def create_device(
        device: DeviceSchema,
        transaction: DBTransaction,
        device_dao: DeviceDao = Depends()
) -> DeviceSchema:
    """
    Authorisation: at least 'Editor' is required
    """

    try:
        with transaction.start():
            created = device_dao.create(device)
    except IntegrityError as e:
        raise HTTPException(status_code=HTTPStatus.CONFLICT, detail=e.detail)

    return DeviceSchema.from_model(created)


@router.get("", dependencies=[Depends(get_and_validate_user(RoleEnum.Viewer))])
async def get_devices(
        device_dao: DeviceDao = Depends()
) -> List[DeviceSchema]:
    """
    Authorisation: at least 'Viewer' is required
    """

    devices = [DeviceSchema.from_model(device) for device in device_dao.get_all()]

    return sorted(devices, key=lambda device: device.name)


@router.get("/{name}", dependencies=[Depends(get_and_validate_user(RoleEnum.Viewer))])
async def get_device_by_name(
        name: str,
        device_dao: DeviceDao = Depends()
) -> DeviceSchema:
    """
    Authorisation: at least 'Viewer' is required
    """

    try:
        device = device_dao.get_by_name(name)
    except NotFoundException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)

    return DeviceSchema.from_model(device)


@router.patch("/{name}", dependencies=[Depends(get_and_validate_user(RoleEnum.Editor))])
async def update_device(
        name: str,
        device: DeviceSchema,
        transaction: DBTransaction,
        device_dao: DeviceDao = Depends()
) -> DeviceSchema:
    """
    Authorisation: at least 'Editor' is required
    """

    try:
        with transaction.start():
            updated = device_dao.update(name, device)
    except NotFoundException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)
    except IntegrityError as e:
        raise HTTPException(status_code=HTTPStatus.CONFLICT, detail=e.detail)

    return DeviceSchema.from_model(updated)


@router.delete("/{name}", status_code=HTTPStatus.NO_CONTENT,
               dependencies=[Depends(get_and_validate_user(RoleEnum.Editor))])
async def delete_device(
        name: str,
        transaction: DBTransaction,
        device_dao: DeviceDao = Depends()
) -> None:
    """
    Authorisation: at least 'Editor' is required
    """

    try:
        with transaction.start():
            device_dao.delete(name)
    except NotFoundException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)
