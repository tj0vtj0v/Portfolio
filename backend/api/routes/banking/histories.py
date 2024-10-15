from datetime import date
from typing import List
from http import HTTPStatus

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError

from backend.core.auth.token import Token
from backend.core.database.dao.banking.history_dao import HistoryDao
from backend.core.database.transaction import DBTransaction
from backend.core.auth.authorisation import get_and_validate_user
from backend.api.schemas.authentication.role_schema import RoleEnum
from backend.api.schemas.banking.history_schema import HistorySchema

router = APIRouter()


@router.get("/accounts", dependencies=[Depends(get_and_validate_user(RoleEnum.Viewer))])
async def get_all_accounts(
        history_dao: HistoryDao = Depends()
) -> List[str]:
    """
    Authorisation: at least 'Viewer' is required
    """

    accounts = history_dao.get_accounts()

    return sorted(accounts)


@router.get("", dependencies=[Depends(get_and_validate_user(RoleEnum.Viewer))])
async def get_history(
        account: str = None,
        entry_date: date = None,
        history_dao: HistoryDao = Depends()
) -> List[HistorySchema]:
    """
    Authorisation: at least 'Viewer' is required
    """

    if account is None and entry_date is None:
        history_data = history_dao.get_complete_history()
    elif entry_date is None:
        history_data = history_dao.get_by_account(account)
    elif account is None:
        history_data = history_dao.get_by_date(entry_date)
    else:
        try:
            history_data = history_dao.get_entry(account, entry_date)
        except HistoryDao.EntryNotFoundException:
            return []

    history = [HistorySchema.from_model(entry) for entry in history_data]

    return sorted(history, key=lambda entry: (entry.date, entry.account))


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
    except IntegrityError as e:
        raise HTTPException(status_code=HTTPStatus.BAD_REQUEST, detail=e.detail)
    except HistoryDao.EntryNotFoundException as e:
        raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail=e.detail)

    return HistorySchema.from_model(updated)


@router.post("", dependencies=[Depends(get_and_validate_user(RoleEnum.Editor))])
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
        raise HTTPException(status_code=HTTPStatus.BAD_REQUEST, detail=e.detail)

    return HistorySchema.from_model(created)


@router.delete("", dependencies=[Depends(get_and_validate_user(RoleEnum.Editor))])
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
    except HistoryDao.EntryNotFoundException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)
