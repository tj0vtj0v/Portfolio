from datetime import date
from typing import List

from http import HTTPStatus

from backend.core.database.models import Transaction
from backend.core.database.session import DBSession
from backend.api.schemas.banking.transaction_schema import TransactionModifySchema


class TransactionDao:
    def __init__(self, db_session: DBSession):
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

    def get_by_id(self, id: int) -> Transaction:
        entry = (self.db_session
                 .query(Transaction)
                 .where(Transaction.id == id)
                 .one_or_none())

        if entry is None:
            raise TransactionDao.IdNotFoundException(f"Entry with id '{id}' not found")

        return entry

    def get_by_account(self, iban: str) -> List[Transaction]:
        return (self.db_session
                .query(Transaction)
                .where(Transaction.account == iban)
                .all())

    def get_by_date(self, entry_date: date) -> List[Transaction]:
        return (self.db_session
                .query(Transaction)
                .where(Transaction.date == entry_date)
                .all())

    def get_by_peer(self, peer: str) -> List[Transaction]:
        return (self.db_session
                .query(Transaction)
                .where(Transaction.peer == peer)
                .all())

    def update(self, id: int, update: TransactionModifySchema) -> Transaction:
        to_update: Transaction = self.get_by_id(id)

        to_update.id = update.id
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
        to_delete: Transaction = self.get_by_id(id)
        self.db_session.delete(to_delete)

    class IdNotFoundException(Exception):
        def __init__(self, detail: str):
            self.status_code = HTTPStatus.NOT_FOUND
            self.detail = detail
