from typing import List

from sqlalchemy import or_

from backend.core.database.dao import NotFoundException
from backend.core.database.models.hayday import Ingredient
from backend.core.database.session import DBSession
from backend.api.schemas.hayday.item_ingredient_schema import IngredientsModifySchema


class IngredientDao:
    def __init__(self, db_session: DBSession) -> None:
        self.db_session = db_session

    def create(self, ingredient: IngredientsModifySchema) -> Ingredient:
        to_add = Ingredient(
            ingredient_1_id=ingredient.ingredient_1_id,
            quantity_1=ingredient.quantity_1,
            ingredient_2_id=ingredient.ingredient_2_id,
            quantity_2=ingredient.quantity_2,
            ingredient_3_id=ingredient.ingredient_3_id,
            quantity_3=ingredient.quantity_3,
            ingredient_4_id=ingredient.ingredient_4_id,
            quantity_4=ingredient.quantity_4
        )

        self.db_session.add(to_add)

        return to_add

    def get_all_with(self,
                     ingredient_name_1: str = None,
                     ingredient_name_2: str = None,
                     ingredient_name_3: str = None,
                     ingredient_name_4: str = None,
                     ) -> List[Ingredient]:
        query = self.db_session.query(Ingredient)

        if ingredient_name_1 is not None:
            query.where(or_(
                Ingredient.ingredient_1.name == ingredient_name_1,
                Ingredient.ingredient_2.name == ingredient_name_1,
                Ingredient.ingredient_3.name == ingredient_name_1,
                Ingredient.ingredient_4.name == ingredient_name_1
            ))

        if ingredient_name_2 is not None:
            query.where(or_(
                Ingredient.ingredient_1.name == ingredient_name_2,
                Ingredient.ingredient_2.name == ingredient_name_2,
                Ingredient.ingredient_3.name == ingredient_name_2,
                Ingredient.ingredient_4.name == ingredient_name_2
            ))

        if ingredient_name_3 is not None:
            query.where(or_(
                Ingredient.ingredient_1.name == ingredient_name_3,
                Ingredient.ingredient_2.name == ingredient_name_3,
                Ingredient.ingredient_3.name == ingredient_name_3,
                Ingredient.ingredient_4.name == ingredient_name_3
            ))

        if ingredient_name_4 is not None:
            query.where(or_(
                Ingredient.ingredient_1.name == ingredient_name_4,
                Ingredient.ingredient_2.name == ingredient_name_4,
                Ingredient.ingredient_3.name == ingredient_name_4,
                Ingredient.ingredient_4.name == ingredient_name_4
            ))

        return query.all()

    def get_by_id(self, id: int) -> Ingredient:
        ingredient = (self.db_session
                      .query(Ingredient)
                      .where(Ingredient.id == id)
                      .one_or_none())

        if ingredient is None:
            raise NotFoundException(f"Ingredients with id #{id} not found")

        return ingredient

    def update(self, id: int, update: IngredientsModifySchema) -> Ingredient:
        to_update = self.get_by_id(id)

        to_update.ingredient_1_id = update.ingredient_1_id
        to_update.quantity_1 = update.quantity_1
        to_update.ingredient_2_id = update.ingredient_2_id
        to_update.quantity_2 = update.quantity_2
        to_update.ingredient_3_id = update.ingredient_3_id
        to_update.quantity_3 = update.quantity_3
        to_update.ingredient_4_id = update.ingredient_4_id
        to_update.quantity_4 = update.quantity_4

        return to_update

    def delete(self, id: int) -> None:
        to_delete = self.get_by_id(id)
        self.db_session.delete(to_delete)
