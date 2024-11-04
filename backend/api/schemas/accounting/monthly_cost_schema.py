from pydantic import BaseModel

from backend.core.database.models.accounting import MonthlyCost


class MonthlyCostSchema(BaseModel):
    name: str
    amount: float

    @staticmethod
    def from_model(monthly_cost: MonthlyCost) -> "MonthlyCostSchema":
        return MonthlyCostSchema(
            name=monthly_cost.name,
            amount=monthly_cost.amount
        )
