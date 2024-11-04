from typing import Optional, List

from sqlalchemy import ForeignKey
from sqlalchemy.orm import relationship

from backend.core.database.models.__init__ import *


class Device(Base):
    __tablename__ = "t_device"
    __table_args__ = {'schema': 'proximity'}

    id: Mapped[serial_pk]
    name: Mapped[str_17]

    proximities: Mapped[Optional[List["Proximity"]]] = relationship("Proximity", back_populates="device")


class Proximity(Base):
    __tablename__ = "t_proximity"
    __table_args__ = {'schema': 'proximity'}

    id: Mapped[serial_pk]
    device_id: Mapped[int] = mapped_column(ForeignKey('proximity.t_device.id'))
    timestamp: Mapped[datetime]
    responsetime: Mapped[float]

    device: Mapped[Optional["Device"]] = relationship("Device", back_populates="proximities")
