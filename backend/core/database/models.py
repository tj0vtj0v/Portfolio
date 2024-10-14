from typing import Annotated, Optional
from datetime import datetime, date

from sqlalchemy import String, Date, ForeignKey
from sqlalchemy.orm import DeclarativeBase, registry, Mapped, mapped_column, relationship
from sqlalchemy.schema import PrimaryKeyConstraint
from sqlalchemy.dialects.postgresql import TIMESTAMP

str_3 = Annotated[str, 3]
str_16 = Annotated[str, 16]
str_22 = Annotated[str, 22]
str_32 = Annotated[str, 32]
str_64 = Annotated[str, 64]
str_256 = Annotated[str, 256]
str_512 = Annotated[str, 512]
serial_pk = Annotated[int, mapped_column(primary_key=True, nullable=False, autoincrement=True)]


class Base(DeclarativeBase):
    registry = registry(
        type_annotation_map={
            # definition for the ORM-Model
            datetime: TIMESTAMP(timezone=True),
            date: Date,
            str_3: String(3),
            str_16: String(16),
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


# Authentication tables
class Role(Base):
    __tablename__ = "t_role"
    __table_args__ = {'schema': 'authentication'}

    id: Mapped[serial_pk]
    priority: Mapped[int]
    name: Mapped[str_16]


class User(Base):
    __tablename__ = "t_user"
    __table_args__ = {'schema': 'authentication'}

    id: Mapped[serial_pk]
    password: Mapped[str_64]
    first_name: Mapped[str_64]
    last_name: Mapped[str_64]
    email: Mapped[str_64]
    username: Mapped[str_16]
    role_id: Mapped[int] = mapped_column(ForeignKey('authentication.t_role.id'))

    role: Mapped[Optional[Role]] = relationship()


# Banking tables
class History(Base):
    __tablename__ = "t_history"
    __table_args__ = {'schema': 'banking', 'extend_existing': True}

    id: Mapped[serial_pk]
    account: Mapped[str_22]
    date: Mapped[date]
    amount: Mapped[float]


class Transaction(Base):
    __tablename__ = "t_history"
    __table_args__ = {'schema': 'banking', 'extend_existing': True}

    id: Mapped[serial_pk]
    account: Mapped[str_22]
    amount: Mapped[float]
    currencycode: Mapped[str_3]
    date: Mapped[date]
    bdate: Mapped[date]
    vdate: Mapped[date]
    peer: Mapped[str_256]
    postingtext: Mapped[str_64]
    reasonforpayment: Mapped[str_512]
    customerreferenz: Mapped[str_64]
    mandatereference: Mapped[str_32]
    peeraccount: Mapped[str_32]
    peerbic: Mapped[str_16]
    peerid: Mapped[str_64]
