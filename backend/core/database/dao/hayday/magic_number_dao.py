from typing import List

from http import HTTPStatus

from backend.core.database.models import MagicNumber
from backend.core.database.session import DBSession
from backend.api.schemas.hayday.magic_number_schema import MagicNumberSchema


class MagicNumberDao:
    def __init__(self, db_session: DBSession) -> None:
        self.db_session = db_session

    def create(self, magic_number: MagicNumberSchema) -> MagicNumber:
        to_add = MagicNumber(
            level=magic_number.level,
            number=magic_number.number
        )

        self.db_session.add(to_add)

        return to_add

    def get_all(self) -> List[MagicNumber]:
        return (self.db_session
                .query(MagicNumber)
                .all())

    def get_by_level(self, level: int) -> MagicNumber:
        magic_number = (self.db_session
                        .query(MagicNumber)
                        .where(MagicNumber.level == level)
                        .one_or_none())

        if magic_number is None:
            raise MagicNumberDao.NotFoundException(f"Magic-number at level #{level} not found")

        return magic_number

    def update(self, level: int, update: MagicNumberSchema) -> MagicNumber:
        to_update = self.get_by_level(level)

        to_update.level = update.level
        to_update.number = update.number

        return to_update

    def delete(self, level: int) -> None:
        to_delete = self.get_by_level(level)
        self.db_session.delete(to_delete)

    class NotFoundException(Exception):
        def __init__(self, detail: str):
            self.status_code = HTTPStatus.NOT_FOUND
            self.detail = detail
