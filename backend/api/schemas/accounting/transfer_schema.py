from pydantic import BaseModel
from datetime import date

from backend.core.database.models.accounting import Transfer
from backend.api.schemas.accounting.account_schema import AccountSchema


class _TransferBaseSchema(BaseModel):
    amount: float
    date: date


class TransferSchema(_TransferBaseSchema):
    source: AccountSchema
    target: AccountSchema

    @staticmethod
    def from_model(transfer: Transfer) -> "TransferSchema":
        return TransferSchema(
            source=AccountSchema.from_model(transfer.source),
            target=AccountSchema.from_model(transfer.target),
            amount=transfer.amount,
            date=transfer.date
        )


class TransferModifySchema(_TransferBaseSchema):
    source_id: int
    target_id: int
