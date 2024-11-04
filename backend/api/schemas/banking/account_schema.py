from pydantic import BaseModel

from backend.core.database.models.banking import Account


class AccountSchema(BaseModel):
    name: str

    @staticmethod
    def from_model(account: Account) -> "AccountSchema":
        return AccountSchema(
            name=account.name
        )
