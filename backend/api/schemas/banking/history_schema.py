from pydantic import BaseModel
from datetime import date

from backend.api.schemas.banking.account_schema import AccountSchema
from backend.core.database.models.banking import History


class _HistoryBaseSchema(BaseModel):
    amount: float
    date: date


class HistorySchema(_HistoryBaseSchema):
    account: AccountSchema

    @staticmethod
    def from_model(history: History) -> "HistorySchema":
        return HistorySchema(
            account=AccountSchema.from_model(history.account),
            amount=history.amount,
            date=history.date
        )


class HistoryModifySchema(_HistoryBaseSchema):
    account_id: int
