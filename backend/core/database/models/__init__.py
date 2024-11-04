from typing import Annotated
from datetime import datetime, date

from sqlalchemy import String, Date
from sqlalchemy.orm import DeclarativeBase, registry, Mapped, mapped_column
from sqlalchemy.dialects.postgresql import TIMESTAMP

str_3 = Annotated[str, 3]
str_6 = Annotated[str, 6]
str_8 = Annotated[str, 8]
str_16 = Annotated[str, 16]
str_17 = Annotated[str, 17]
str_22 = Annotated[str, 22]
str_32 = Annotated[str, 32]
str_64 = Annotated[str, 64]
str_256 = Annotated[str, 256]
str_512 = Annotated[str, 512]
serial_pk = Annotated[int, mapped_column(primary_key=True, nullable=False, autoincrement=True)]


class Base(DeclarativeBase):
    registry = registry(
        type_annotation_map={
            datetime: TIMESTAMP(timezone=True),
            date: Date,
            str_3: String(3),
            str_6: String(6),
            str_8: String(8),
            str_16: String(16),
            str_17: String(17),
            str_22: String(22),
            str_32: String(32),
            str_64: String(64),
            str_256: String(256),
            str_512: String(512)
        }
    )

    created_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), nullable=False, default=datetime.now)
    updated_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), nullable=False, default=datetime.now,
                                                 onupdate=datetime.now)
