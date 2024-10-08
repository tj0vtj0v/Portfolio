from typing import Annotated, Optional
from datetime import datetime

from sqlalchemy import String, ForeignKey, LargeBinary
from sqlalchemy.dialects.postgresql import TIMESTAMP
from sqlalchemy.orm import DeclarativeBase, registry, Mapped, mapped_column, relationship

str_16 = Annotated[str, 16]
str_64 = Annotated[str, 64]
serial_pk = Annotated[int, mapped_column(primary_key=True, nullable=False, autoincrement=True)]


class Base(DeclarativeBase):
    registry = registry(
        type_annotation_map={
            # definition for the ORM-Model
            datetime: TIMESTAMP(timezone=True),
            str_16: String(16),
            str_64: String(64),
        }
    )

    created_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), nullable=False, default=datetime.now)
    updated_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), nullable=False, default=datetime.now, onupdate=datetime.now)


class Role(Base):
    __tablename__ = "t_role"

    id: Mapped[serial_pk]
    priority: Mapped[int]
    name: Mapped[str_16]


class User(Base):
    __tablename__ = "t_user"

    id: Mapped[serial_pk]
    password: Mapped[str_64]
    first_name: Mapped[str_64]
    last_name: Mapped[str_64]
    email: Mapped[str_64]
    username: Mapped[str_16]
    role_id: Mapped[int] = mapped_column(ForeignKey('t_role.id'))

    role: Mapped[Optional[Role]] = relationship()
