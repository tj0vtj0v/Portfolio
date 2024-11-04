from pydantic import BaseModel
from datetime import date

from backend.api.schemas.banking.account_schema import AccountSchema
from backend.core.database.models.banking import Transaction


class _TransactionBaseSchema(BaseModel):
    amount: float
    currencycode: str
    date: date
    peer: str
    reasonforpayment: str


class TransactionSchema(_TransactionBaseSchema):
    account: AccountSchema

    @staticmethod
    def from_model(transaction: Transaction) -> "TransactionSchema":
        return TransactionSchema(
            account=AccountSchema.from_model(transaction.account),
            amount=transaction.amount,
            currencycode=transaction.currencycode,
            date=transaction.date,
            peer=transaction.peer,
            reasonforpayment=transaction.reasonforpayment
        )


class TransactionModifySchema(_TransactionBaseSchema):
    account_id: int
    bdate: date
    vdate: date
    postingtext: str
    customerreferenz: str
    mandatereference: str
    peeraccount: str
    peerbic: str
    peerid: str
