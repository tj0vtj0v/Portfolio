from pydantic import BaseModel
from datetime import date

from backend.core.database.models import Transaction


class TransactionSchema(BaseModel):
    account: str
    amount: float
    currencycode: str
    date: date
    peer: str
    reasonforpayment: str

    @staticmethod
    def from_model(transaction: Transaction) -> "TransactionSchema":
        return TransactionSchema(
            account=transaction.account,
            amount=transaction.amount,
            currencycode=transaction.currencycode,
            date=transaction.date,
            peer=transaction.peer,
            reasonforpayment=transaction.reasonforpayment
        )


class TransactionModifySchema(TransactionSchema):
    bdate: date
    vdate: date
    postingtext: str
    customerreferenz: str
    mandatereference: str
    peeraccount: str
    peerbic: str
    peerid: str

    @staticmethod
    def from_model(transaction: Transaction) -> None:
        raise NotImplementedError()
