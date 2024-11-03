from datetime import date
from typing import List

from backend.core.database.dao.generals import NotFoundException
from backend.core.database.models import Expense
from backend.core.database.session import DBSession
from backend.api.schemas.accounting.expense_schema import ExpenseModifySchema


class ExpenseDao:
    def __init__(self, db_session: DBSession) -> None:
        self.db_session = db_session

    def create(self, expense: ExpenseModifySchema) -> Expense:
        to_add = Expense(
            reason=expense.reason,
            amount=expense.amount,
            date=expense.date,
            account_id=expense.account_id,
            category_id=expense.category_id
        )

        self.db_session.add(to_add)

        return to_add

    def get_all_with(self,
                     reason: str = None,
                     amount: float = None,
                     entry_date: date = None,
                     account_name: str = None,
                     category_name: str = None
                     ) -> List[Expense]:
        query = self.db_session.query(Expense)

        if reason is not None:
            query = query.where(Expense.reason.like(f"%{reason}%"))  # TODO: check if its working

        if amount is not None:
            query = query.where(Expense.amount == amount)

        if entry_date is not None:
            query = query.where(Expense.date == entry_date)

        if account_name is not None:
            query = query.where(Expense.account.name == account_name)

        if category_name is not None:
            query = query.where(Expense.category.name == category_name)

        return query.all()

    def get_by_id(self, id: int) -> Expense:
        expense = (self.db_session
                   .query(Expense)
                   .where(Expense.id == id)
                   .one_or_none())

        if expense is None:
            raise NotFoundException(f"Expense with id #{id} not found")

        return expense

    def update(self, id: int, expense: ExpenseModifySchema) -> Expense:
        to_update = self.get_by_id(id)

        to_update.reason = expense.reason
        to_update.amount = expense.amount
        to_update.date = expense.date
        to_update.account_id = expense.account_id
        to_update.category_id = expense.category_id

        return to_update

    def delete(self, id: int) -> None:
        to_delete = self.get_by_id(id)
        self.db_session.delete(to_delete)
