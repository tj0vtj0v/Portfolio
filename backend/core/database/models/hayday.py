from typing import Optional, List

from sqlalchemy import ForeignKey
from sqlalchemy.orm import relationship

from backend.core.database.models.__init__ import *


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
