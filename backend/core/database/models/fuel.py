from typing import Optional, List

from sqlalchemy import ForeignKey
from sqlalchemy.orm import relationship

from backend.core.database.models.__init__ import *


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
