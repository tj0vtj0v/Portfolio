from pydantic import BaseModel

from backend.core.database.models import Account


class AccountSchema(BaseModel):
    name: str
    balance: float

    @staticmethod
    def from_model(account: Account) -> "AccountSchema":
        return AccountSchema(
            name=account.name,
            balance=account.balance
        )
