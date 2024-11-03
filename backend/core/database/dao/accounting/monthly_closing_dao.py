from datetime import date
from typing import List

from http import HTTPStatus

from backend.core.database.models import MonthlyClosing
from backend.core.database.session import DBSession
from backend.api.schemas.accounting.monthly_closing_schema import MonthlyClosingSchema


class MonthlyClosingDao:
    def __init__(self, db_session: DBSession) -> None:
        self.db_session = db_session

    def create(self, monthly_closing: MonthlyClosingSchema) -> MonthlyClosing:
        to_add = MonthlyClosing(
            date=monthly_closing.date,
            balance=monthly_closing.balance,
            depreciation=monthly_closing.depreciation,
            bonus=monthly_closing.bonus,
            fun_money=monthly_closing.fun_money,
            save_money=monthly_closing.save_money,
            remaining=monthly_closing.remaining
        )

        self.db_session.add(to_add)

        return to_add

    def get_all(self) -> List[MonthlyClosing]:
        return self.db_session.query(MonthlyClosing).all()

    def get_by_date(self, entry_date: date) -> MonthlyClosing:
        monthly_closing = (self.db_session
                           .query(MonthlyClosing)
                           .where(MonthlyClosing.date == entry_date)
                           .one_or_none())

        if monthly_closing is None:
            raise

        return monthly_closing

    def update(self, entry_date: date, monthly_closing: MonthlyClosingSchema) -> MonthlyClosing:
        to_update = self.get_by_date(entry_date)

        to_update.date = monthly_closing.date
        to_update.balance = monthly_closing.balance
        to_update.depreciation = monthly_closing.depreciation
        to_update.bonus = monthly_closing.bonus
        to_update.fun_money = monthly_closing.fun_money
        to_update.save_money = monthly_closing.save_money
        to_update.remaining = monthly_closing.remaining

        return to_update

    def delete(self, entry_date: date) -> None:
        to_delete = self.get_by_date(entry_date)
        self.db_session.delete(to_delete)

    class NotFoundException(Exception):
        def __init__(self, detail: str):
            self.status_code = HTTPStatus.NOT_FOUND
            self.detail = detail
