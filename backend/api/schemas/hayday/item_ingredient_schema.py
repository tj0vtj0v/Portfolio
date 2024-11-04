from pydantic import BaseModel

from backend.core.database.models.hayday import Ingredient
from backend.core.database.models.hayday import Item
from backend.api.schemas.hayday.source_schema import SourceSchema


class _IngredientsBaseSchema(BaseModel):
    quantity_1: float
    quantity_2: float
    quantity_3: float
    quantity_4: float


class IngredientsSchema(_IngredientsBaseSchema):
    ingredient_1: "ItemSchema"
    ingredient_2: "ItemSchema"
    ingredient_3: "ItemSchema"
    ingredient_4: "ItemSchema"

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


class _ItemBaseSchema(BaseModel):
    name: str
    level: int
    production_time: float
    mastered_time: float
    experience: int
    default_price: int
    maximum_price: int


class ItemSchema(_ItemBaseSchema):
    source: SourceSchema
    ingredients: IngredientsSchema

    @staticmethod
    def from_model(item: Item) -> "ItemSchema":
        return ItemSchema(
            source=SourceSchema.from_model(item.source),
            ingredients=IngredientsSchema.from_model(item.ingredients),
            name=item.name,
            level=item.level,
            production_time=item.production_time,
            mastered_time=item.mastered_time,
            experience=item.experience,
            default_price=item.default_price,
            maximum_price=item.maximum_price
        )


class ItemModifySchema(_ItemBaseSchema):
    source_id: int
    ingredients_id: int
