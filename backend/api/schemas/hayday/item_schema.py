from pydantic import BaseModel

from backend.core.database.models import Item
from backend.core.database.models import Source
from backend.core.database.models import Ingredient
from backend.api.schemas.hayday.source_schema import SourceSchema
from backend.api.schemas.hayday.ingredients_schema import IngredientsSchema


class _ItemBaseSchema(BaseModel):
    name: str
    level: int
    production_time: float
    mastered_time: float
    experience: int
    default_price: int
    maximum_price: int


class ItemSchema(_ItemBaseSchema):
    source: Source
    ingredients: Ingredient

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
