from pydantic import BaseModel

from backend.core.database.models.hayday import MagicNumber


class MagicNumberSchema(BaseModel):
    level: int
    number: int

    @staticmethod
    def from_model(magic_number: MagicNumber) -> "MagicNumberSchema":
        return MagicNumberSchema(
            level=magic_number.level,
            number=magic_number.number
        )
