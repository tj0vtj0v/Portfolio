from datetime import date
from typing import List
from http import HTTPStatus

from fastapi import APIRouter, Depends, HTTPException

from backend.api.schemas.authentication.role_schema import RoleEnum
from backend.core.database.dao.accounting.expense_dao import ExpenseDao
from backend.core.database.dao import NotFoundException
from backend.core.database.transaction import DBTransaction
from backend.core.auth.authorisation import get_and_validate_user
from backend.api.schemas.accounting.expense_schema import ExpenseModifySchema, ExpenseSchema

router = APIRouter()


@router.post("", status_code=HTTPStatus.CREATED, dependencies=[Depends(get_and_validate_user(RoleEnum.Editor))])
async def create_expense(
        expense: ExpenseModifySchema,
        transaction: DBTransaction,
        expense_dao: ExpenseDao = Depends()
) -> ExpenseSchema:
    """
    Authorisation: at least 'Editor' is required
    """

    with transaction.start():
        created = expense_dao.create(expense)

    return ExpenseSchema.from_model(created)


@router.get("", dependencies=[Depends(get_and_validate_user(RoleEnum.Viewer))])
async def get_expenses(
        reason: str = None,
        amount: float = None,
        entry_date: date = None,
        account_name: str = None,
        category_name: str = None,
        expense_dao: ExpenseDao = Depends()
) -> List[ExpenseSchema]:
    """
    Authorisation: at least 'Viewer' is required
    """

    raw_data = expense_dao.get_all_with(reason, amount, entry_date, account_name, category_name)

    expenses = [ExpenseSchema.from_model(expense) for expense in raw_data]

    return sorted(expenses, key=lambda expense: (expense.entry_date, expense.account.name))


@router.patch("/{id}", dependencies=[Depends(get_and_validate_user(RoleEnum.Editor))])
async def update_expense(
        id: int,
        expense: ExpenseModifySchema,
        transaction: DBTransaction,
        expense_dao: ExpenseDao = Depends()
) -> ExpenseSchema:
    """
    Authorisation: at least 'Editor' is required
    """

    try:
        with transaction.start():
            updated = expense_dao.update(id, expense)
    except NotFoundException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)

    return ExpenseSchema.from_model(updated)


@router.delete("/{id}", status_code=HTTPStatus.NO_CONTENT,
               dependencies=[Depends(get_and_validate_user(RoleEnum.Editor))])
async def delete_expense(
        id: int,
        transaction: DBTransaction,
        expense_dao: ExpenseDao = Depends()
) -> None:
    """
    Authorisation: at least 'Editor' is required
    """

    try:
        with transaction.start():
            expense_dao.delete(id)
    except NotFoundException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)
