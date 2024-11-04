from pydantic import BaseModel

from backend.core.database.models.accounting import Category


class CategorySchema(BaseModel):
    name: str

    @staticmethod
    def from_model(category: Category) -> "CategorySchema":
        return CategorySchema(name=category.name)
