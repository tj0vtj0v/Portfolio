from datetime import date
from typing import List
from http import HTTPStatus

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError

from backend.core.database.dao.banking.history_dao import HistoryDao
from backend.core.database.dao import NotFoundException
from backend.core.database.transaction import DBTransaction
from backend.core.auth.authorisation import get_and_validate_user
from backend.api.schemas.authentication.role_schema import RoleEnum
from backend.api.schemas.banking.history_schema import HistorySchema, HistoryModifySchema

router = APIRouter()


@router.post("", status_code=HTTPStatus.CREATED, dependencies=[Depends(get_and_validate_user(RoleEnum.Editor))])
async def create_entry(
        history: HistoryModifySchema,
        transaction: DBTransaction,
        history_dao: HistoryDao = Depends()
) -> HistorySchema:
    """
    Authorisation: at least 'Editor' is required
    """

    try:
        with transaction.start():
            created = history_dao.create(history)
    except IntegrityError as e:
        raise HTTPException(status_code=HTTPStatus.CONFLICT, detail=e.detail)

    return HistorySchema.from_model(created)


@router.get("", dependencies=[Depends(get_and_validate_user(RoleEnum.Viewer))])
async def get_entries(
        account: str = None,
        entry_date: date = None,
        amount: float = None,
        history_dao: HistoryDao = Depends()
) -> List[HistorySchema]:
    """
    Authorisation: at least 'Viewer' is required
    """

    raw_data = history_dao.get_all_with(account, entry_date, amount)

    entries = [HistorySchema.from_model(entry) for entry in raw_data]

    return sorted(entries, key=lambda entry: (entry.date, entry.account))


@router.patch("", dependencies=[Depends(get_and_validate_user(RoleEnum.Editor))])
async def update_entry(
        account_id: int,
        entry_date: date,
        history: HistoryModifySchema,
        transaction: DBTransaction,
        history_dao: HistoryDao = Depends()
) -> HistorySchema:
    """
    Authorisation: at least 'Editor' is required
    """

    try:
        with transaction.start():
            updated = history_dao.update(account_id, entry_date, history)
    except NotFoundException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)
    except IntegrityError as e:
        raise HTTPException(status_code=HTTPStatus.CONFLICT, detail=e.detail)

    return HistorySchema.from_model(updated)


@router.delete("", status_code=HTTPStatus.NO_CONTENT, dependencies=[Depends(get_and_validate_user(RoleEnum.Editor))])
async def delete_entry(
        account_id: int,
        entry_date: date,
        transaction: DBTransaction,
        history_dao: HistoryDao = Depends()
) -> None:
    """
    Authorisation: at least 'Editor' is required
    """

    try:
        with transaction.start():
            history_dao.delete(account_id, entry_date)
    except NotFoundException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)
