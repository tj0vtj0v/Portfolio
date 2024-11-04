from datetime import date
from typing import List

from sqlalchemy.exc import IntegrityError

from backend.core.database.dao import NotFoundException
from backend.core.database.models.banking import History
from backend.core.database.session import DBSession
from backend.api.schemas.banking.history_schema import HistorySchema, HistoryModifySchema


class HistoryDao:
    def __init__(self, db_session: DBSession) -> None:
        self.db_session = db_session

    def exists(self, account_id: int, entry_date: date) -> bool:
        entry = (self.db_session
                 .query(History)
                 .where(History.date == entry_date, History.account_id == account_id)
                 .one_or_none())

        return entry is not None

    def create(self, history: HistoryModifySchema) -> History:
        if self.exists(history.account_id, history.date):
            raise IntegrityError(f"Account and Date pair #{history.account_id}, '{history.date}' already exists")

        to_add = History(
            account_id=history.account_id,
            date=history.date,
            amount=history.amount
        )

        self.db_session.add(to_add)

        return to_add

    def get_all_with(self,
                     account_name: str = None,
                     entry_date: date = None,
                     amount: float = None
                     ) -> List[History]:
        query = self.db_session.query(History)

        if account_name is not None:
            query.where(History.account.name == account_name)

        if entry_date is not None:
            query.where(History.date == entry_date)

        if amount is not None:
            query.where(History.amount == amount)

        return query.all()

    def get_entry(self, account_id: int, entry_date: date) -> History:
        entry = (self.db_session
                 .query(History)
                 .where(History.date == entry_date, History.account_id == account_id)
                 .one_or_none())

        if entry is None:
            raise NotFoundException(f"Entry from account #{account_id} at date '{entry_date}' not found")

        return entry

    def update(self,
               account_id: int,
               entry_date: date,
               update: HistoryModifySchema
               ) -> History:
        if self.exists(update.account_id, update.date):
            raise IntegrityError(f"Account and Date pair #{update.account_id}, '{update.date}' already exists")

        to_update = self.get_entry(account_id, entry_date)

        to_update.account_id = update.account_id
        to_update.date = update.date
        to_update.amount = update.amount

        return to_update

    def delete(self, account_id: int, entry_date: date) -> None:
        to_delete = self.get_entry(account_id, entry_date)
        self.db_session.delete(to_delete)
