from datetime import date
from typing import List

from http import HTTPStatus

from backend.core.database.models import Refuel
from backend.core.database.session import DBSession
from backend.api.schemas.fuel.refuel_schema import RefuelModifySchema


class RefuelDAO:
    def __init__(self, db_session: DBSession) -> None:
        self.db_session = db_session

    def create(self, refuel: RefuelModifySchema) -> Refuel:
        to_add = Refuel(
            date=refuel.date,
            distance=refuel.distance,
            consumption=refuel.consumption,
            cost=refuel.cost,
            fuel_type_id=refuel.fuel_type_id
        )

        self.db_session.add(to_add)

        return to_add

    def get_all_with(self,
                     entry_date: date = None,
                     distance: float = None,
                     consumption: float = None,
                     cost: float = None,
                     fuel_type_name: str = None
                     ) -> List[Refuel]:
        query = self.db_session.query(Refuel)

        if entry_date is not None:
            query = query.where(Refuel.date == entry_date)

        if distance is not None:
            query = query.where(Refuel.distance == distance)

        if consumption is not None:
            query = query.where(Refuel.consumption == consumption)

        if cost is not None:
            query = query.where(Refuel.cost == cost)

        if fuel_type_name is not None:
            query = query.where(Refuel.fuel_type.name == fuel_type_name)

        return query.all()

    def get_by_id(self, id: int) -> Refuel:
        refuel = (self.db_session
                  .query(Refuel)
                  .where(Refuel.id == id)
                  .one_or_none()
                  )

        if refuel is None:
            raise self.NotFoundException(f"Refuel at id {id} not found")

        return refuel

    def update(self, id: int, refuel: RefuelModifySchema) -> Refuel:
        to_update = self.get_by_id(id)

        to_update.date = refuel.date
        to_update.distance = refuel.distance
        to_update.consumption = refuel.consumption
        to_update.cost = refuel.cost
        to_update.fuel_type_id = refuel.fuel_type_id

        return to_update

    def delete(self, id: int) -> None:
        to_delete = self.get_by_id(id)
        self.db_session.delete(to_delete)

    class NotFoundException(Exception):
        def __init__(self, detail: str):
            self.status_code = HTTPStatus.NOT_FOUND
            self.detail = detail
