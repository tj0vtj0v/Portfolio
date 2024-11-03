from typing import List

from http import HTTPStatus

from backend.core.database.models import MonthlyCost
from backend.core.database.session import DBSession
from backend.api.schemas.accounting.monthly_cost_schema import MonthlyCostSchema


class MonthlyCostDao:
    def __init__(self, db_session: DBSession) -> None:
        self.db_session = db_session

    def create(self, monthly_cost: MonthlyCostSchema) -> MonthlyCost:
        to_add = MonthlyCost(
            name=monthly_cost.name,
            amount=monthly_cost.amount
        )

        self.db_session.add(to_add)

        return to_add

    def get_all_with(self,
                     amount: int = None
                     ) -> List[MonthlyCost]:
        query = self.db_session.query(MonthlyCost)

        if amount is not None:
            query = query.where(MonthlyCost.amount == amount)

        return query.all()

    def get_by_name(self, name: str) -> MonthlyCost:
        monthly_cost = (self.db_session
                        .query(MonthlyCost)
                        .where(MonthlyCost.name == name)
                        .one_or_none())

        if monthly_cost is None:
            raise self.NotFoundException(f"Monthly cost with name '{name}' not found")

        return monthly_cost

    def update(self, name: str, monthly_cost: MonthlyCostSchema) -> MonthlyCost:
        to_update = self.get_by_name(name)

        to_update.name = monthly_cost.name
        to_update.amount = monthly_cost.amount

        return to_update

    def delete(self, name: str) -> None:
        to_delete = self.get_by_name(name)
        self.db_session.delete(to_delete)

    class NotFoundException(Exception):
        def __init__(self, detail: str):
            self.status_code = HTTPStatus.NOT_FOUND
            self.detail = detail
