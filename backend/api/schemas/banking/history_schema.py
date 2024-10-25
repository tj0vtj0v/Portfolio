from pydantic import BaseModel
from datetime import date

from backend.core.database.models import History


class HistorySchema(BaseModel):
    account: str
    amount: float
    date: date

    @staticmethod
    def from_model(history: History) -> "HistorySchema":
        return HistorySchema(
            account=history.account,
            amount=history.amount,
            date=history.date
        )
