from typing import List

from backend.core.database.dao import NotFoundException
from backend.core.database.models.hayday import Source
from backend.core.database.session import DBSession
from backend.api.schemas.hayday.source_schema import SourceSchema


class SourceDao:
    def __init__(self, db_session: DBSession) -> None:
        self.db_session = db_session

    def create(self, source: SourceSchema) -> Source:
        to_add = Source(
            name=source.name
        )

        self.db_session.add(to_add)

        return to_add

    def get_all(self) -> List[Source]:
        return (self.db_session
                .query(Source)
                .all())

    def get_by_name(self, name: str = None) -> Source:
        source = (self.db_session
                  .query(Source)
                  .where(Source.name == name)
                  .one_or_none())

        if source is None:
            raise NotFoundException(f"Source with name '{name}' not found")

        return source

    def update(self, name: str, update: SourceSchema) -> Source:
        to_update = self.get_by_name(name)

        to_update.name = update.name

        return to_update

    def delete(self, name: str) -> None:
        to_delete = self.get_by_name(name)
        self.db_session.delete(to_delete)
