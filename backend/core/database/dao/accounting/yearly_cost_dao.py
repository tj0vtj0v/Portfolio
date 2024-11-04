from typing import List

from backend.core.database.dao import NotFoundException
from backend.core.database.models.accounting import YearlyCost
from backend.core.database.session import DBSession
from backend.api.schemas.accounting.yearly_cost_schema import YearlyCostSchema


class YearlyCostDao:
    def __init__(self, db_session: DBSession) -> None:
        self.db_session = db_session

    def create(self, yearly_cost: YearlyCostSchema) -> YearlyCost:
        to_add = YearlyCost(
            name=yearly_cost.name,
            amount=yearly_cost.amount
        )

        self.db_session.add(to_add)

        return to_add

    def get_all_with(self,
                     amount: int = None
                     ) -> List[YearlyCost]:
        query = self.db_session.query(YearlyCost)

        if amount is not None:
            query = query.where(YearlyCost.amount == amount)

        return query.all()

    def get_by_name(self, name: str) -> YearlyCost:
        yearly_cost = (self.db_session
                       .query(YearlyCost)
                       .where(YearlyCost.name == name)
                       .one_or_none())

        if yearly_cost is None:
            raise NotFoundException(f"Yearly cost with name '{name}' not found")

        return yearly_cost

    def update(self, name: str, yearly_cost: YearlyCostSchema) -> YearlyCost:
        to_update = self.get_by_name(name)

        to_update.name = yearly_cost.name
        to_update.amount = yearly_cost.amount

        return to_update

    def delete(self, name: str) -> None:
        to_delete = self.get_by_name(name)
        self.db_session.delete(to_delete)
