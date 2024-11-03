from typing import List

from backend.core.database.dao.generals import NotFoundException
from backend.core.database.models import Category
from backend.core.database.session import DBSession
from backend.api.schemas.accounting.category_schema import CategorySchema


class CategoryDao:
    def __init__(self, db_session: DBSession) -> None:
        self.db_session = db_session

    def create(self, category: CategorySchema) -> Category:
        to_add = Category(
            name=category.name
        )

        self.db_session.add(to_add)

        return to_add

    def get_all(self) -> List[Category]:
        return (self.db_session
                .query(Category)
                .all())

    def get_category_by_name(self, name: str) -> Category:
        category = (self.db_session
                    .query(Category)
                    .where(Category.name == name)
                    .one_or_none())

        if category is None:
            raise NotFoundException(f"Category with name '{name}' not found")

        return category

    def update(self, name: str, category: CategorySchema) -> Category:
        to_update = self.get_category_by_name(name)

        to_update.name = category.name

        return to_update

    def delete(self, name: str) -> None:
        to_delete = self.get_category_by_name(name)
        self.db_session.delete(to_delete)
