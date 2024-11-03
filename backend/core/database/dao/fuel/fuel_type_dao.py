from typing import List

from backend.core.database.dao.generals import NotFoundException
from backend.core.database.models import FuelType
from backend.core.database.session import DBSession
from backend.api.schemas.fuel.fuel_type_schema import FuelTypeSchema


class FuelTypeDao:
    def __init__(self, db_session: DBSession) -> None:
        self.db_session = db_session

    def create(self, fuel_type: FuelTypeSchema) -> FuelType:
        to_add = FuelType(
            name=fuel_type.name
        )

        self.db_session.add(to_add)

        return to_add

    def get_all(self) -> List[FuelType]:
        return (self.db_session
                .query(FuelType)
                .all())

    def get_by_name(self, name: str) -> FuelType:
        fuel_type = (self.db_session
                     .query(FuelType)
                     .where(FuelType.name == name)
                     .one_or_none())

        if fuel_type is None:
            raise NotFoundException(f"Fuel type with name '{name}' not found")

        return fuel_type

    def update(self, name: str, fuel_type: FuelTypeSchema) -> FuelType:
        to_update = self.get_by_name(name)

        to_update.name = fuel_type.name

        return to_update

    def delete(self, name: str) -> None:
        to_delete = self.get_by_name(name)
        self.db_session.delete(to_delete)
