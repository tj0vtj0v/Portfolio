from datetime import date
from typing import List

from http import HTTPStatus

from backend.core.database.models import History
from backend.core.database.session import DBSession
from backend.api.schemas.history_schema import HistorySchema


class HistoryDao:
    def __init__(self, db_session: DBSession):
        self.db_session = db_session

    def exists(self, account: str, entry_date: date) -> bool:
        entry = (self.db_session
                 .query(History)
                 .where(History.date == entry_date, History.account == account)
                 .one_or_none())

        return entry is not None

    def create(self, history: HistorySchema) -> History:
        to_add = History(
            account=history.account,
            date=history.date,
            amount=history.amount
        )

        self.db_session.add(to_add)

        return to_add

    def get_accounts(self) -> List[str]:
        return (self.db_session
                .query(History.account)
                .distinct(History.account)
                .all())

    def get_by_account(self, iban: str) -> List[History]:
        return (self.db_session
                .query(History)
                .where(History.account == iban)
                .all())

    def get_by_date(self, entry_date: date):
        return (self.db_session
                .query(History)
                .where(History.date == entry_date)
                .all())

    def get_entry(self, iban: str, entry_date: date) -> History:
        entry = (self.db_session
                 .query(History)
                 .where(History.date == entry_date, History.account == iban)
                 .one_or_none())

        if entry is None:
            raise HistoryDao.EntryNotFoundException(f"Entry from iban '{iban}' at date '{entry_date}' not found")

        return entry

    def update(self, iban: str, entry_date: date, update: HistorySchema) -> History:
        to_update: History = self.get_entry(iban, entry_date)

        to_update.account = update.account
        to_update.date = update.date
        to_update.amount = update.amount

        return to_update

    def delete(self, iban: str, entry_date: date) -> None:
        to_delete: History = self.get_entry(iban, entry_date)
        self.db_session.delete(to_delete)

    class EntryNotFoundException(Exception):
        def __init__(self, detail: str):
            self.status_code = HTTPStatus.NOT_FOUND
            self.detail = detail
