from typing import List

from backend.core.database.dao import NotFoundException
from backend.core.database.models.hayday import Item
from backend.core.database.session import DBSession
from backend.api.schemas.hayday.item_ingredient_schema import ItemModifySchema


class ItemDao:
    def __init__(self, db_session: DBSession) -> None:
        self.db_session = db_session

    def create(self, item: ItemModifySchema) -> Item:
        to_add = Item(
            source_id=item.source_id,
            ingredients_id=item.ingredients_id,
            name=item.name,
            level=item.level,
            production_time=item.production_time,
            mastered_time=item.mastered_time,
            experience=item.experience
        )

        self.db_session.add(to_add)

        return to_add

    def get_all_with(self,
                     level: int = None,
                     experience: int = None,
                     default_price: int = None,
                     maximum_price: int = None,
                     source_name: str = None
                     ) -> List[Item]:
        query = self.db_session.query(Item)

        if level is not None:
            query.where(Item.level == level)

        if experience is not None:
            query.where(Item.experience == experience)

        if default_price is not None:
            query.where(Item.default_price == default_price)

        if maximum_price is not None:
            query.where(Item.maximum_price == maximum_price)

        if source_name is not None:
            query.where(Item.source.name == source_name)

        return query.all()

    def get_by_name(self, name: str) -> Item:
        item = (self.db_session
                .query(Item)
                .where(Item.name == name)
                .one_or_none())

        if item is None:
            raise NotFoundException(f"Item with name '{name}' not found")

        return item

    def update(self, name: str, update: ItemModifySchema) -> Item:
        to_update = self.get_by_name(name)

        to_update.name = update.name
        to_update.level = update.level
        to_update.production_time = update.production_time
        to_update.mastered_time = update.mastered_time
        to_update.experience = update.experience
        to_update.default_price = update.default_price
        to_update.maximum_price = update.maximum_price
        to_update.source_id = update.source_id
        to_update.ingredients_id = update.ingredients_id

        return to_update

    def delete(self, name: str) -> None:
        to_delete = self.get_by_name(name)
        self.db_session.delete(to_delete)
