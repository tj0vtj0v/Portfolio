from pydantic import BaseModel
from datetime import date

from backend.core.database.models.accounting import MonthlyClosing


class MonthlyClosingSchema(BaseModel):
    date: date
    balance: float
    depreciation: float
    bonus: float
    fun_money: float
    save_money: float
    remaining: float

    @staticmethod
    def from_model(monthly_closing: MonthlyClosing) -> "MonthlyClosingSchema":
        return MonthlyClosingSchema(
            date=monthly_closing.date,
            balance=monthly_closing.balance,
            depreciation=monthly_closing.depreciation,
            bonus=monthly_closing.bonus,
            fun_money=monthly_closing.fun_money,
            save_money=monthly_closing.save_money,
            remaining=monthly_closing.remaining
        )
