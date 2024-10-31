from typing import Annotated, Optional, List
from datetime import datetime, date

from sqlalchemy import String, Date, ForeignKey
from sqlalchemy.orm import DeclarativeBase, registry, Mapped, mapped_column, relationship
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


# Authentication tables
class Role(Base):
    __tablename__ = "t_role"
    __table_args__ = {'schema': 'authentication'}

    id: Mapped[serial_pk]
    priority: Mapped[int]
    name: Mapped[str_16]

    users: Mapped[Optional[List["User"]]] = relationship("User", back_populates="role")


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

    role: Mapped[Optional["Role"]] = relationship("Role", back_populates="users")


# Banking tables
class History(Base):
    __tablename__ = "t_history"
    __table_args__ = {'schema': 'banking'}

    id: Mapped[serial_pk]
    account: Mapped[str_22]  # TODO refactor in own table
    date: Mapped[date]
    amount: Mapped[float]


class Transaction(Base):
    __tablename__ = "t_transaction"
    __table_args__ = {'schema': 'banking'}

    id: Mapped[serial_pk]
    account: Mapped[str_22]  # TODO refactor in own table
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


# Proximity table
class Proximity(Base):
    __tablename__ = "t_proximity"
    __table_args__ = {'schema': 'proximity'}

    id: Mapped[serial_pk]
    device: Mapped[str_17]  # TODO refactor in own table
    timestamp: Mapped[datetime]
    responsetime: Mapped[float]


# Hayday tables
class Item(Base):
    __tablename__ = "t_item"
    __table_args__ = {'schema': 'hayday'}

    id: Mapped[serial_pk]
    source_id: Mapped[int] = mapped_column(ForeignKey("hayday.t_source.id"))
    ingredients_id: Mapped[int] = mapped_column(ForeignKey("hayday.t_ingredient.id"))
    name: Mapped[str_32]
    level: Mapped[int]
    production_time: Mapped[float]
    mastered_time: Mapped[float]
    experience: Mapped[int]
    default_price: Mapped[int]
    maximum_price: Mapped[int]

    source: Mapped[Optional["Source"]] = relationship("Source", back_populates="items")
    ingredients: Mapped[Optional["Ingredient"]] = relationship("Ingredient", back_populates="items")
    evaluation: Mapped[Optional["Evaluation"]] = relationship("Evaluation", back_populates="item")


class Ingredient(Base):
    __tablename__ = "t_ingredient"
    __table_args__ = {'schema': 'hayday'}

    id: Mapped[serial_pk]
    ingredient_1_id: Mapped[int]
    quantity_1: Mapped[float]
    ingredient_2_id: Mapped[int]
    quantity_2: Mapped[float]
    ingredient_3_id: Mapped[int]
    quantity_3: Mapped[float]
    ingredient_4_id: Mapped[int]
    quantity_4: Mapped[float]

    ingredient_1: Mapped[Optional["Item"]] = relationship("Item", viewonly=True)
    ingredient_2: Mapped[Optional["Item"]] = relationship("Item", viewonly=True)
    ingredient_3: Mapped[Optional["Item"]] = relationship("Item", viewonly=True)
    ingredient_4: Mapped[Optional["Item"]] = relationship("Item", viewonly=True)

    items: Mapped[Optional[List["Item"]]] = relationship("Item", back_populates="ingredients")


class Source(Base):
    __tablename__ = "t_source"
    __table_args__ = {'schema': 'hayday'}

    id: Mapped[serial_pk]
    name: Mapped[str_32]

    items: Mapped[Optional[List["Item"]]] = relationship("Item", back_populates="source")


class Evaluation(Base):
    __tablename__ = "t_evaluation"
    __table_args__ = {'schema': 'hayday'}

    item_id: Mapped[int] = mapped_column(ForeignKey("hayday.t_item.id"), primary_key=True, nullable=False,
                                         autoincrement=True)
    complete_time: Mapped[float]
    no_crops_time: Mapped[float]
    profit: Mapped[float]
    complete_experience: Mapped[int]

    item: Mapped[Optional["Item"]] = relationship("Item", back_populates="evaluation")


class MagicNumber(Base):
    __tablename__ = "t_magic_number"
    __table_args__ = {'schema': 'hayday'}

    level: Mapped[int] = mapped_column(primary_key=True, nullable=False)
    number: Mapped[int]


class AnimalSteps(Base):
    __tablename__ = "t_animal_steps"
    __table_args__ = {'schema': 'hayday'}

    id: Mapped[serial_pk]
    name: Mapped[str_32]
    level: Mapped[int]
    experience: Mapped[int]
    cooldown: Mapped[float]
    step_value: Mapped[int]


class OreOccurrence(Base):
    __tablename__ = "t_ore_occurrence"
    __table_args__ = {'schema': 'hayday'}

    tool: Mapped[str_8] = mapped_column(primary_key=True, nullable=False)
    silver: Mapped[int]
    gold: Mapped[int]
    platinum: Mapped[int]
    iron: Mapped[int]
    coal: Mapped[int]
    diamond: Mapped[int]


# Fuel tables
class FuelType(Base):
    __tablename__ = "t_fuel_type"
    __table_args__ = {'schema': 'fuel'}

    id: Mapped[serial_pk]
    name: Mapped[str_6]

    refuels: Mapped[Optional[List["Refuel"]]] = relationship("Refuel", back_populates="fuel_type")


class Refuel(Base):
    __tablename__ = "t_refuel"
    __table_args__ = {'schema': 'fuel'}

    id: Mapped[serial_pk]
    date: Mapped[date]
    distance: Mapped[float]
    consumption: Mapped[float]
    cost: Mapped[float]
    fuel_type_id: Mapped[int] = mapped_column(ForeignKey("fuel.t_fuel_type.id"))

    fuel_type: Mapped[Optional["FuelType"]] = relationship("FuelType", back_populates="refuels")
