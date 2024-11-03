from pydantic import BaseModel

from backend.core.database.models import YearlyCost


class YearlyCostSchema(BaseModel):
    name: str
    amount: float

    @staticmethod
    def from_model(yearly_cost: YearlyCost) -> "YearlyCostSchema":
        return YearlyCostSchema(
            name=yearly_cost.name,
            amount=yearly_cost.amount
        )
