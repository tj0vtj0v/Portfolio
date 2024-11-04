from datetime import date
from typing import List
from http import HTTPStatus

from fastapi import APIRouter, Depends, HTTPException

from backend.core.database.dao.banking.transaction_dao import TransactionDao
from backend.core.database.dao import NotFoundException
from backend.core.database.transaction import DBTransaction
from backend.core.auth.authorisation import get_and_validate_user
from backend.api.schemas.authentication.role_schema import RoleEnum
from backend.api.schemas.banking.transaction_schema import TransactionModifySchema, TransactionSchema

router = APIRouter()


@router.post("", status_code=HTTPStatus.CREATED, dependencies=[Depends(get_and_validate_user(RoleEnum.Editor))])
async def create_transaction(
        transaction_entry: TransactionModifySchema,
        transaction: DBTransaction,
        transaction_dao: TransactionDao = Depends()
) -> TransactionSchema:
    """
    Authorisation: at least 'Editor' is required
    """

    with transaction.start():
        created = transaction_dao.create(transaction_entry)

    return TransactionSchema.from_model(created)


@router.get("", dependencies=[Depends(get_and_validate_user(RoleEnum.Viewer))])
async def get_transactions(
        iban: str = None,
        amount: float = None,
        currencycode: str = None,
        transaction_date: date = None,
        peer: str = None,
        reasonforpayment: str = None,
        transaction_dao: TransactionDao = Depends()
) -> List[TransactionSchema]:
    """
    Authorisation: at least 'Viewer' is required
    """

    raw_data = transaction_dao.get_all_with(iban, amount, currencycode, transaction_date, peer, reasonforpayment)

    transactions = [TransactionSchema.from_model(entry) for entry in raw_data]

    return sorted(transactions, key=lambda entry: (entry.date, entry.account, entry.peer))


@router.patch("/{id}", dependencies=[Depends(get_and_validate_user(RoleEnum.Editor))])
async def update_transaction(
        id: int,
        transaction_entry: TransactionModifySchema,
        transaction: DBTransaction,
        transaction_dao: TransactionDao = Depends()
) -> TransactionSchema:
    """
    Authorisation: at least 'Editor' is required
    """

    try:
        with transaction.start():
            updated = transaction_dao.update(id, transaction_entry)
    except NotFoundException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)

    return TransactionSchema.from_model(updated)


@router.delete("/{id}", status_code=HTTPStatus.NO_CONTENT,
               dependencies=[Depends(get_and_validate_user(RoleEnum.Editor))])
async def delete_transaction(
        id: int,
        transaction: DBTransaction,
        transaction_dao: TransactionDao = Depends()
) -> None:
    """
    Authorisation: at least 'Editor' is required
    """

    try:
        with transaction.start():
            transaction_dao.delete(id)
    except NotFoundException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)
