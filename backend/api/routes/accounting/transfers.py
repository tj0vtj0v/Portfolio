from datetime import date
from typing import List
from http import HTTPStatus

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError

from backend.api.schemas.authentication.role_schema import RoleEnum
from backend.core.database.dao.accounting.transfer_dao import TransferDao
from backend.core.database.dao import NotFoundException
from backend.core.database.transaction import DBTransaction
from backend.core.auth.authorisation import get_and_validate_user
from backend.api.schemas.accounting.transfer_schema import TransferModifySchema, TransferSchema

router = APIRouter()


@router.post("", status_code=HTTPStatus.CREATED, dependencies=[Depends(get_and_validate_user(RoleEnum.Editor))])
async def create_transfer(
        transfer: TransferModifySchema,
        transaction: DBTransaction,
        transfer_dao: TransferDao = Depends()
) -> TransferSchema:
    """
    Authorisation: at least 'Editor' is required
    """

    with transaction.start():
        created = transfer_dao.create(transfer)

    return TransferSchema.from_model(created)


@router.get("", dependencies=[Depends(get_and_validate_user(RoleEnum.Viewer))])
async def get_transfers(
        amount: float = None,
        entry_date: date = None,
        source_name: str = None,
        target_name: str = None,
        transfer_dao: TransferDao = Depends()
) -> List[TransferSchema]:
    """
    Authorisation: at least 'Viewer' is required
    """

    raw_data = transfer_dao.get_all_with(amount, entry_date, source_name, target_name)

    transfers = [TransferSchema.from_model(transfer) for transfer in raw_data]

    return sorted(transfers, key=lambda transfer: (transfer.entry_date, transfer.source.name))


@router.patch("/{id}", dependencies=[Depends(get_and_validate_user(RoleEnum.Editor))])
async def update_transfer(
        id: int,
        transfer: TransferModifySchema,
        transaction: DBTransaction,
        transfer_dao: TransferDao = Depends()
) -> TransferSchema:
    """
    Authorisation: at least 'Editor' is required
    """

    try:
        with transaction.start():
            updated = transfer_dao.update(id, transfer)
    except NotFoundException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)
    except IntegrityError as e:
        raise HTTPException(status_code=HTTPStatus.CONFLICT, detail=e.detail)

    return TransferSchema.from_model(updated)


@router.delete("/{id}", status_code=HTTPStatus.NO_CONTENT,
               dependencies=[Depends(get_and_validate_user(RoleEnum.Editor))])
async def delete_transfer(
        id: int,
        transaction: DBTransaction,
        transfer_dao: TransferDao = Depends()
) -> None:
    """
    Authorisation: at least 'Editor' is required
    """

    try:
        with transaction.start():
            transfer_dao.delete(id)
    except NotFoundException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)
