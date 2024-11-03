from typing import List

from http import HTTPStatus

from backend.core.database.models import Account
from backend.core.database.session import DBSession
from backend.api.schemas.accounting.account_schema import AccountSchema


class AccountDao:
    def __init__(self, db_session: DBSession) -> None:
        self.db_session = db_session

    def create(self, account: AccountSchema) -> Account:
        to_add = Account(
            name=account.name,
            balance=account.balance
        )

        self.db_session.add(to_add)

        return to_add

    def get_accounts(self) -> List[str]:
        return (self.db_session
                .query(Account.name)
                .distinct(Account.name)
                .all())

    def get_by_name(self, name: str) -> Account:
        account = (self.db_session
                   .query(Account)
                   .where(Account.name == name)
                   .one_or_none())

        if account is None:
            raise AccountDao.NotFoundException(f"Account with name '{name}' not found")

        return account

    def update(self, name: str, account: AccountSchema) -> Account:
        to_update = self.get_by_name(name)

        to_update.name = account.name
        to_update.balance = account.balance

        return to_update

    def delete(self, name: str) -> None:
        to_delete = self.get_by_name(name)
        self.db_session.delete(to_delete)

    class NotFoundException(Exception):
        def __init__(self, detail: str):
            self.status_code = HTTPStatus.NOT_FOUND
            self.detail = detail
