from datetime import date
from typing import List

from http import HTTPStatus

from backend.core.database.models import Transaction
from backend.core.database.session import DBSession
from backend.api.schemas.banking.transaction_schema import TransactionModifySchema


class TransactionDao:
    def __init__(self, db_session: DBSession) -> None:
        self.db_session = db_session

    def create(self, transaction: TransactionModifySchema) -> Transaction:
        to_add = Transaction(
            account=transaction.account,
            amount=transaction.amount,
            currencycode=transaction.currencycode,
            date=transaction.date,
            bdate=transaction.bdate,
            vdate=transaction.vdate,
            peer=transaction.peer,
            postingtext=transaction.postingtext,
            reasonforpayment=transaction.reasonforpayment,
            customerreferenz=transaction.customerreferenz,
            mandatereference=transaction.mandatereference,
            peeraccount=transaction.peeraccount,
            peerbic=transaction.peerbic,
            peerid=transaction.peerid
        )

        self.db_session.add(to_add)

        return to_add

    def get_accounts(self) -> List[str]:
        return (self.db_session
                .query(Transaction.account)
                .distinct(Transaction.account)
                .all())

    def get_all_with(self,
                     iban: str = None,
                     amount: float = None,
                     currencycode: str = None,
                     transaction_date: date = None,
                     peer: str = None,
                     reasonforpayment: str = None
                     ) -> List[Transaction]:
        query = self.db_session.query(Transaction)

        if iban is not None:
            query.where(Transaction.account == iban)

        if amount is not None:
            query.where(Transaction.amount == amount)

        if currencycode is not None:
            query.where(Transaction.currencycode == currencycode)

        if transaction_date is not None:
            query.where(Transaction.date == transaction_date)

        if peer is not None:
            query.where(Transaction.peer == peer)

        if reasonforpayment is not None:
            query.where(Transaction.reasonforpayment == reasonforpayment)

        return query.all()

    def get_by_id(self, id: int) -> Transaction:
        entry = (self.db_session
                 .query(Transaction)
                 .where(Transaction.id == id)
                 .one_or_none())

        if entry is None:
            raise TransactionDao.NotFoundException(f"Entry with id #{id} not found")

        return entry

    def update(self, id: int, update: TransactionModifySchema) -> Transaction:
        to_update = self.get_by_id(id)

        to_update.account = update.account
        to_update.amount = update.amount
        to_update.currencycode = update.currencycode
        to_update.date = update.date
        to_update.bdate = update.bdate
        to_update.vdate = update.vdate
        to_update.peer = update.peer
        to_update.postingtext = update.postingtext
        to_update.reasonforpayment = update.reasonforpayment
        to_update.customerreferenz = update.customerreferenz
        to_update.mandatereference = update.mandatereference
        to_update.peeraccount = update.peeraccount
        to_update.peerbic = update.peerbic
        to_update.peerid = update.peerid

        return to_update

    def delete(self, id: int) -> None:
        to_delete = self.get_by_id(id)
        self.db_session.delete(to_delete)

    class NotFoundException(Exception):
        def __init__(self, detail: str):
            self.status_code = HTTPStatus.NOT_FOUND
            self.detail = detail
