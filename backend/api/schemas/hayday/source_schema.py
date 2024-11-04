from pydantic import BaseModel

from backend.core.database.models.hayday import Source


class SourceSchema(BaseModel):
    name: str

    @staticmethod
    def from_model(source: Source) -> "SourceSchema":
        return SourceSchema(
            name=source.name
        )
