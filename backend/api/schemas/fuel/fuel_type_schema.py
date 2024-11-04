from pydantic import BaseModel

from backend.core.database.models.fuel import FuelType


class FuelTypeSchema(BaseModel):
    name: str

    @staticmethod
    def from_model(fuel_type: FuelType) -> "FuelTypeSchema":
        return FuelTypeSchema(
            name=fuel_type.name
        )
