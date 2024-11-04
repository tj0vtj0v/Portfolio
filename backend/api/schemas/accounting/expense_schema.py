from pydantic import BaseModel
from datetime import date

from backend.core.database.models.accounting import Expense
from backend.api.schemas.accounting.account_schema import AccountSchema
from backend.api.schemas.accounting.category_schema import CategorySchema


class _ExpenseBaseSchema(BaseModel):
    reason: str
    amount: float
    date: date


class ExpenseSchema(_ExpenseBaseSchema):
    account: AccountSchema
    category: CategorySchema

    @staticmethod
    def from_model(expense: Expense) -> "ExpenseSchema":
        return ExpenseSchema(
            reason=expense.reason,
            amount=expense.amount,
            date=expense.date,
            account=AccountSchema.from_model(expense.account),
            category=CategorySchema.from_model(expense.category)
        )


class ExpenseModifySchema(_ExpenseBaseSchema):
    account_id: int
    category_id: int
