from pydantic import BaseModel
from datetime import date

from backend.core.database.models.fuel import Refuel
from backend.api.schemas.fuel.fuel_type_schema import FuelTypeSchema


class _RefuelBaseSchema(BaseModel):
    date: date
    distance: float
    consumption: float
    cost: float


class RefuelSchema(_RefuelBaseSchema):
    fuel_type: FuelTypeSchema

    @staticmethod
    def from_model(refuel: Refuel) -> "RefuelSchema":
        return RefuelSchema(
            date=refuel.date,
            distance=refuel.distance,
            consumption=refuel.consumption,
            cost=refuel.cost,
            fuel_type=FuelTypeSchema.from_model(refuel.fuel_type)
        )


class RefuelModifySchema(_RefuelBaseSchema):
    fuel_type_id: int
