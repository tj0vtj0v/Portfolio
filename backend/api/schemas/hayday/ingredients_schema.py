from pydantic import BaseModel

from backend.core.database.models import Item
from backend.core.database.models import Ingredient
from backend.api.schemas.hayday.item_schema import ItemSchema


class _IngredientsBaseSchema(BaseModel):
    quantity_1: float
    quantity_2: float
    quantity_3: float
    quantity_4: float


class IngredientsSchema(_IngredientsBaseSchema):
    ingredient_1: Item
    ingredient_2: Item
    ingredient_3: Item
    ingredient_4: Item

    @staticmethod
    def from_model(ingredients: Ingredient) -> "IngredientsSchema":
        return IngredientsSchema(
            ingredient_1=ItemSchema.from_model(ingredients.ingredient_1),
            quantity_1=ingredients.ingredient_1,
            ingredient_2=ItemSchema.from_model(ingredients.ingredient_2),
            quantity_2=ingredients.ingredient_2,
            ingredient_3=ItemSchema.from_model(ingredients.ingredient_3),
            quantity_3=ingredients.ingredient_3,
            ingredient_4=ItemSchema.from_model(ingredients.ingredient_4),
            quantity_4=ingredients.ingredient_4)


class IngredientsModifySchema(_IngredientsBaseSchema):
    ingredient_1_id: int
    ingredient_2_id: int
    ingredient_3_id: int
    ingredient_4_id: int
