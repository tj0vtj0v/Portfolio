from datetime import date
from typing import List
from http import HTTPStatus

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError

from backend.core.database.dao.banking.history_dao import HistoryDao
from backend.core.database.transaction import DBTransaction
from backend.core.auth.authorisation import get_and_validate_user
from backend.api.schemas.authentication.role_schema import RoleEnum
from backend.api.schemas.banking.history_schema import HistorySchema

router = APIRouter()


@router.post("", status_code=HTTPStatus.CREATED, dependencies=[Depends(get_and_validate_user(RoleEnum.Editor))])
async def create_entry(
        history: HistorySchema,
        transaction: DBTransaction,
        history_dao: HistoryDao = Depends()
):
    """
    Authorisation: at least 'Editor' is required
    """

    try:
        with transaction.start():
            created = history_dao.create(history)
    except IntegrityError as e:
        raise HTTPException(status_code=HTTPStatus.CONFLICT, detail=e.detail)

    return HistorySchema.from_model(created)


@router.get("/accounts", dependencies=[Depends(get_and_validate_user(RoleEnum.Viewer))])
async def get_accounts(
        history_dao: HistoryDao = Depends()
) -> List[str]:
    """
    Authorisation: at least 'Viewer' is required
    """

    accounts = history_dao.get_accounts()

    return sorted(accounts)


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

    entries = [HistorySchema.from_model(entry) for entry in history_dao.get_all_with(account, entry_date, amount)]

    return sorted(entries, key=lambda entry: (entry.date, entry.account))


@router.patch("", dependencies=[Depends(get_and_validate_user(RoleEnum.Editor))])
async def update_entry(
        account: str,
        entry_date: date,
        history: HistorySchema,
        transaction: DBTransaction,
        history_dao: HistoryDao = Depends()
) -> HistorySchema:
    """
    Authorisation: at least 'Editor' is required
    """

    try:
        with transaction.start():
            updated = history_dao.update(account, entry_date, history)
    except HistoryDao.NotFoundException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)
    except IntegrityError as e:
        raise HTTPException(status_code=HTTPStatus.CONFLICT, detail=e.detail)

    return HistorySchema.from_model(updated)


@router.delete("", status_code=HTTPStatus.NO_CONTENT, dependencies=[Depends(get_and_validate_user(RoleEnum.Editor))])
async def delete_entry(
        account: str,
        entry_date: date,
        transaction: DBTransaction,
        history_dao: HistoryDao = Depends()
):
    """
    Authorisation: at least 'Editor' is required
    """

    try:
        with transaction.start():
            history_dao.delete(account, entry_date)
    except HistoryDao.NotFoundException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)
