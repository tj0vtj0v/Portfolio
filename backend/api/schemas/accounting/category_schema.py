from pydantic import BaseModel
from datetime import date

from backend.core.database.models import Category


class CategorySchema(BaseModel):
    name: str

    @staticmethod
    def from_model(category: Category) -> "CategorySchema":
        return CategorySchema(name=category.name)
